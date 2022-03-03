import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class GridRowStyleService {
    constructor() {}

    applyGridRowStyle(e) {
        if (e.rowType === "data") {
            if (!e.data.valide) {
                e.rowElement.classList.add("highlight-datagrid-row");
            }
            if (e.data.preSaisie) {
                e.rowElement.classList.add("tovalidate-datagrid-row");
            }
        }
    }
}
