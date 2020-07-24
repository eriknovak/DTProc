// the language mappings
import * as languages from "../config/languages.json";

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
        for (let i = 0; i < languages.length; i++) {
            const language = languages[i];
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
        return languages[idx][targetType];
    }
}