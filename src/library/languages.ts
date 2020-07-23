// the language mappings
const langs = [
    { fullname: "Catalan",    alpha2: "ca", alpha3: "cat" },
    { fullname: "Croatian",   alpha2: "hr", alpha3: "hrv" },
    { fullname: "English",    alpha2: "en", alpha3: "eng" },
    { fullname: "French",     alpha2: "fr", alpha3: "fra" },
    { fullname: "German",     alpha2: "de", alpha3: "deu" },
    { fullname: "Portuguese", alpha2: "pt", alpha3: "por" },
    { fullname: "Serbian",    alpha2: "sr", alpha3: "srp" },
    { fullname: "Slovene",    alpha2: "sl", alpha3: "slv" },
    { fullname: "Spanish",    alpha2: "es", alpha3: "spa" },
    { fullname: "Swahili",    alpha2: "sw", alpha3: "swa" },
    { fullname: "Swedish",    alpha2: "sv", alpha3: "swe" }
]

// interfaces
import * as Interfaces from "../Interfaces";

export default class Languages {

    private _idx_alpha2: Interfaces.IGenericJSON;
    private _idx_alpha3: Interfaces.IGenericJSON;
    private _idx_fullname: Interfaces.IGenericJSON;

    constructor() {
        this._idx_alpha2 = {};
        this._idx_alpha3 = {};
        this._idx_fullname = {};
        for (let i = 0; i < langs.length; i++) {
            const language = langs[i];
            this._idx_alpha2[language.alpha2] = i;
            this._idx_alpha3[language.alpha3] = i;
            this._idx_fullname[language.fullname] = i;
        }
    }

    // get the code type
    getCodeType(value: string) {
        switch(value.length) {
        case 2:
            return Interfaces.ILanguageTypes.ALPHA2;
        case 3:
            return Interfaces.ILanguageTypes.ALPHA3;
        default:
            return Interfaces.ILanguageTypes.FULLNAME;
        }
    }

    // get the code mapping
    getCodeMapping(type: Interfaces.ILanguageTypes) {
        switch(type) {
        case Interfaces.ILanguageTypes.ALPHA2:
            return this._idx_alpha2;
        case Interfaces.ILanguageTypes.ALPHA3:
            return this._idx_alpha3;
        default:
            return this._idx_fullname;
        }
    }

    // get the iso code in the target type
    getIsoCode(source: string, targetType: Interfaces.ILanguageTypes) {
        // get the value type based on their length
        const sourceType = this.getCodeType(source);
        // checks if the value type is the same as the target type
        if (sourceType === targetType) { return source; }
        // get the source mapping
        const sourceMapping = this.getCodeMapping(sourceType);
        // get the source index and use it to get the target type value
        const idx = sourceMapping[source];
        return langs[idx][targetType];
    }
}