import { Injectable } from "@angular/core";
import DataSource from "devextreme/data/data_source";
import { ModeLivraison } from "../../models";
import ArrayStore from "devextreme/data/array_store";

@Injectable({
    providedIn: "root",
})
export class ModesLivraisonService {
    constructor() {}

    getDataSource() {
        return new DataSource({
            // key: this.keyField,
            store: new ArrayStore({
                data: Object.entries(ModeLivraison).map(([value]) => value),
            }),
        });
    }
}
