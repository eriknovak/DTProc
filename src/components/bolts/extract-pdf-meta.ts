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
import * as pdf from "pdf-parse";
import got from "got";
// used for converting text documents into pdfs
import libre = require("libreoffice-convert");

class ExtractPdfMeta extends BasicBolt {

    private _documentLocationPath: string;
    private _documentLocationType: string;
    private _documentPdfPath: string;
    private _documentErrorPath: string;
    private _extractMetadata: Interfaces.IExtractPdfMetadata[];
    private _convertToPDF: boolean;

    constructor() {
        super();
        this._name = null;
        this._onEmit = null;
        this._context = null;
    }

    // initialize the bolt
    async init(name: string, config: Interfaces.IExtractPdfMetaConfig, context: any) {
        this._name = name;
        this._context = context;
        this._onEmit = config.onEmit;
        this._prefix = `[ExtractPdfMeta ${this._name}]`;

        // the path to where to get the url
        this._documentLocationPath = config.document_location_path;
        // the method type is used to extract the content
        this._documentLocationType = config.document_location_type || "remote";
        // the path to where to store the pdf output
        this._documentPdfPath = config.document_pdf_path;
        // the path to where to store the error
        this._documentErrorPath = config.document_error_path || "error";
        // the extraction types
        this._extractMetadata = config.extract_metadata || [
            Interfaces.IExtractPdfMetadata.PAGES,
            Interfaces.IExtractPdfMetadata.INFO,
            Interfaces.IExtractPdfMetadata.METADATA,
            Interfaces.IExtractPdfMetadata.TEXT
        ];
        // the convert to PDF flag, requires libreoffice
        this._convertToPDF = config.convert_to_pdf || false;
    }

    heartbeat() {
        // do something if needed
    }

    async shutdown() {
        // prepare for graceful shutdown, e.g. save state
    }

    // receive the message and extract the pdf content
    async receive(message: any, stream_id: string) {

        try {
            const documentURL: string = this.get(message, this._documentLocationPath);
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
            // convert the document if requested
            if (this._convertToPDF) {
                dataBuffer = await this.convertFile(dataBuffer, "pdf");
            }
            // get the pdf metadata
            const pdfMeta = await pdf(dataBuffer);

            const metadata = {};
            for (const type of this._extractMetadata) {
                switch (type) {
                case "pages":
                    metadata[type] = pdfMeta.numpages;
                    break;
                case "info":
                    metadata[type] = pdfMeta.info;
                    break;
                case "metadata":
                    metadata[type] = pdfMeta.metadata;
                    break;
                case "text":
                    metadata[type] = pdfMeta.text;
                    break;
                default:
                    break;
                }
            }
            // save the pdf metadata in the message
            this.set(message, this._documentPdfPath, metadata);
            return await this._onEmit(message, stream_id);
        } catch (error) {
            const errorMessage = `${this._prefix} Not able to extract pdf data: ${error.message}`;
            this.set(message, this._documentErrorPath, errorMessage);
            return await this._onEmit(message, "stream_error");
        }
    }

    // converts the file to the designated extension
    convertFile(fileBuffer: Buffer, extension: string) {
        return new Promise<Buffer>((resolve, reject) => {
            libre.convert(fileBuffer, extension, undefined, (error: Error, convBuffer: Buffer) => {
                if (error) { return reject(error); }
                return resolve(convBuffer);
            });
        });
    }
}

// create a new instance of the bolt
const create = () => new ExtractPdfMeta();

export { create };