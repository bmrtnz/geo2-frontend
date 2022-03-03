import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class ModifiedFieldsService {
    constructor() {}

    saveModifiedFields(data, toRemove) {
        const keys = Object.keys(data);
        const index = keys.indexOf(toRemove);
        if (index > -1) {
            keys.splice(index, 1);
        }

        const modifiedKeys = "(" + keys.join("/") + ")";
        window.localStorage.setItem("modifiedKeys", modifiedKeys);
    }

    getModifiedFields() {
        return window.localStorage.getItem("modifiedKeys");
    }

    clearModifiedFields() {
        window.localStorage.removeItem("modifiedKeys");
    }
}
