/**
 * This component extracts raw content text from the file provided.
 * To do this we use textract <https://github.com/dbashford/textract>
 * which is a text extraction library. It returns the content in raw
 * text.
 */

// interfaces
import * as Interfaces from "../../Interfaces";

// modules
import BasicBolt from "./basic-bolt";
import * as fs from "fs";
import * as path from "path";
import got from "got";

import { PDFImage } from "pdf-image";
import * as Tesseract from "tesseract.js";

class ExtractOCRMeta extends BasicBolt {

    private _documentLocationPath: string;
    private _documentLocationType: string;
    private _documentLanguagePath: string;
    private _documentOCRPath: string;
    private _documentErrorPath: string;
    private _temporaryFolder: string;

    constructor() {
        super();
        this._name = null;
        this._onEmit = null;
        this._context = null;
    }

    // initialize the bolt
    async init(name: string, config: Interfaces.IExtractOCRMetaConfig, context: any) {
        this._name = name;
        this._context = context;
        this._onEmit = config.onEmit;
        this._prefix = `[ExtractOCRMeta ${this._name}]`;

        // the path to where to get the url
        this._documentLocationPath = config.document_location_path;
        // the method type is used to extract the content
        this._documentLocationType = config.document_location_type || "remote";
        // the path to where to get the language
        this._documentLanguagePath = config.document_language_path;
        // the path to where to store the pdf output
        this._documentOCRPath = config.document_ocr_path;
        // the path to where to store the error
        this._documentErrorPath = config.document_error_path || "error";
        // the location of the temporary folder
        this._temporaryFolder = config.temporary_folder;
    }

    heartbeat() {
        // do something if needed
    }

    async shutdown() {
        // prepare for graceful shutdown, e.g. save state
    }

    // receive the message and use OCR to extract the content
    async receive(message: any, stream_id: string) {

        try {
            const documentURL: string = this.get(message, this._documentLocationPath);
            const documentLang: string = this.get(message, this._documentLanguagePath);
            // get the material data as a buffer
            let dataBuffer: Buffer;
            switch(this._documentLocationType) {
            case "local":
                dataBuffer = fs.readFileSync(documentURL);
                break;
            case "remote":
            default:
                dataBuffer = (await got(documentURL)).rawBody;
                break;
            }
            // save the file temporarily
            const filePath = await this.saveTempFile(dataBuffer);
            // generate the images out of the given PDF
            const imagePaths = await this.convertToImage(filePath);
            // extract the text from the images
            const ocrTexts = [];
            for (const imagePath of imagePaths) {
                const text = await this.recognizeText(imagePath, documentLang);
                ocrTexts.push(text);
            }
            // join the OCR extracted texts
            const ocr = ocrTexts.join(" ");
            // save the ocr metadata in the message
            this.set(message, this._documentOCRPath, ocr);
            return await this._onEmit(message, stream_id);
        } catch (error) {
            const errorMessage = `${this._prefix} Not able to extract OCR data: ${error.message}`;
            this.set(message, this._documentErrorPath, errorMessage);
            return await this._onEmit(message, "stream_error");
        }
    }

    // save the file and return the file path
    saveTempFile(fileBuffer: Buffer, extension: string = "pdf") {
        return new Promise<string>((resolve, reject) => {
            try {
                const filePath = path.join(this._temporaryFolder, `${Math.random().toString().substring(2)}T${Date.now()}.${extension}`);
                fs.writeFileSync(filePath, fileBuffer);
                return resolve(filePath);
            } catch (error) {
                return reject(error);
            }
        });
    }

    // convert the pdf file into images and returns the image paths
    async convertToImage(filePath: string): Promise<string> {
        const pdfImage = new PDFImage(filePath, {
            graphicsMagick: true
        });
        return await pdfImage.convertFile();
    }

    // use tesseract to recognize the text from the images
    async recognizeText(imagePath: string, lang: string): Promise<string> {
        const { data: { text } } = await Tesseract.recognize(imagePath, lang);
        return text;
    }

}

// create a new instance of the bolt
const create = () => new ExtractOCRMeta();

export { create };