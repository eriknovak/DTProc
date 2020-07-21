/** ******************************************************************
 * This component extracts the material type using the material
 * origin url and assigns an object containing the extention and
 * mimetype of the material.
 */



// interfaces
import * as Interfaces from "../../Interfaces";

// modules
import BasicBolt from "./basic-bolt";

import got from "got";
import * as MimeType from "mime-types";
import * as FileType from "file-type";

/**
 * Formats Material into a common schema.
 */
class ExtractDocumentType extends BasicBolt {

    private _documentUrlPath: string;
    private _documentTypePath: string;
    private _documentErrorPath: string;

    constructor() {
        super();
        this._name = null;
        this._onEmit = null;
        this._context = null;
    }

    async init(name: string, config: any, context: Interfaces.IExtractDocumentTypeConfig) {
        this._name = name;
        this._context = context;
        this._onEmit = config.onEmit;
        this._prefix = `[ExtractType ${this._name}]`;
        // which field to use to check the material type
        this._documentUrlPath = config.document_url_path;
        // where to store the document type
        this._documentTypePath = config.document_type_path;
        // where to store the errors if any
        this._documentErrorPath = config.document_error_path || "error";
        // use other fields from config to control your execution
    }

    heartbeat() {
        // do something if needed
    }

    async shutdown() {
        // prepare for gracefull shutdown, e.g. save state
    }

    async receive(message: any, stream_id: string) {
        // get the material url and type
        const materialUrl: string = this.get(message, this._documentUrlPath);
        const materialType: { "ext": string, "mime": string } = this.get(message, this._documentTypePath);

        if (materialUrl && materialType && materialType.ext && materialType.mime) {
            // all values are present - continue to the next step
            return this._onEmit(message, stream_id);
        }

        if (!materialUrl) {
            // unable to get the url of the material
            this.set(message, this._documentErrorPath, `${this._prefix} No material URL provided`);
            return this._onEmit(message, "stream_error");
        }


        // get the extension of the material
        const splitUrl = materialUrl.split(".");
        const ext = splitUrl[splitUrl.length - 1].toLowerCase();

        // get the mimetype from the extension
        const mime = MimeType.lookup(ext);

        if (mime) {
            // assign the extension and mimetype to the message
            this.set(message, this._documentTypePath, { ext, mime });
            return this._onEmit(message, stream_id);
        }

        try {
            const stream = got.stream(materialUrl);
            const documentType = await FileType.stream(stream);
            // update the message with the data
            this.set(message, this._documentTypePath, documentType);
            // send the message to the next component
            return this._onEmit(message, stream_id);

        } catch (error) {
            // unable to get the url of the material
            this.set(message, this._documentErrorPath, `${this._prefix} Error when getting document type.`);
            return this._onEmit(message, "stream_error");
        }
    }
}

// create a new instance of the bolt
const create = () => new ExtractDocumentType();

export { create };
