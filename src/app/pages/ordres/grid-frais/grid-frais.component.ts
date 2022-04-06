import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { EntrepotsService, LocalizationService, TransporteursService } from "app/shared/services";
import { OrdresFraisService } from "app/shared/services/api/ordres-frais.service";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import {
    Grid,
    GridConfig, GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { map } from "rxjs/operators";
import { ToggledGrid } from "../form/form.component";
import { TypesFraisService } from "app/shared/services/api/types-frais.service";
import { DevisesService } from "app/shared/services/api/devises.service";
import { TransitairesService } from "app/shared/services/api/transitaires.service";

@Component({
    selector: "app-grid-frais",
    templateUrl: "./grid-frais.component.html",
    styleUrls: ["./grid-frais.component.scss"],
})

export class GridFraisComponent implements ToggledGrid, OnChanges {
    @Input() public ordre: Ordre;
    @ViewChild(DxDataGridComponent, { static: true })
    dataGrid: DxDataGridComponent;

    public dataSource: DataSource;
    public fraisSource: DataSource;
    public deviseSource: DataSource;
    public codePlusSource: DataSource;
    public transporteurSource: DataSource;
    public entrepotSource: DataSource;
    public transitaireSource: DataSource;
    public codePlusList: string[];
    public codePlusTransporteurs: string[];
    public codePlusTransitaires: string[];
    public codePlusEntrepots: string[];
    public itemsWithSelectBox: string[];
    public descriptionOnlyDisplaySB: string[];
    public SelectBoxPopupWidth: number;
    public columnChooser = environment.columnChooser;
    public columns: Observable<GridColumn[]>;
    private gridConfig: Promise<GridConfig>;
    public env = environment;
    @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

    constructor(
        private ordresFraisService: OrdresFraisService,
        public fraisService: TypesFraisService,
        public deviseService: DevisesService,
        public gridConfiguratorService: GridConfiguratorService,
        public codePlusService: TransporteursService,
        public transporteursService: TransporteursService,
        public transitairesService: TransitairesService,
        public entrepotsService: EntrepotsService,
        public localizeService: LocalizationService,
    ) {
        this.displayDescOnly = this.displayDescOnly.bind(this);
        this.displayCustom = this.displayCustom.bind(this);
        this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
            Grid.OrdreFrais,
        );
        this.columns = from(this.gridConfig).pipe(
            map((config) => config.columns),
        );
        this.itemsWithSelectBox = [
            "frais",
            "devise",
            "codePlus"
        ];
        this.descriptionOnlyDisplaySB = [
            "frais"
        ];
        this.codePlusTransporteurs = [];
        this.codePlusTransitaires = [];
        this.codePlusEntrepots = [];
        this.fraisSource = this.fraisService.getDataSource_v2(["id", "description"]);
        this.fraisSource.filter(["valide", "=", true]);
        this.deviseSource = this.deviseService.getDataSource_v2(["id", "description", "taux"]);
        this.deviseSource.filter(["valide", "=", true]);

        this.transporteurSource = this.transporteursService.getDataSource_v2(["id", "raisonSocial"]);
        this.transporteurSource.filter(["valide", "=", true]);
        this.transitaireSource = this.transitairesService.getDataSource_v2(["id", "raisonSocial"]);
        this.transitaireSource.filter([
            ["valide", "=", true],
            "and",
            ["declarantDouanier", "=", true]
        ]);
        this.entrepotSource = this.entrepotsService.getDataSource_v2(["id", "code", "raisonSocial"]);
        this.entrepotSource.filter([
            ["valide", "=", true],
            // "and",
            // ["valide", "=", true]
        ]);

        // this.codePlusSource = this.transitaireSource;

    }

    updateCodePlusDataSource(data) {

        const frais = data.frais.id;
        const key = data.key;
        this.codePlusSource = null;
        if (frais === "RAMASS" || frais === "FRET") this.codePlusSource = this.transporteurSource;
        if (frais === "DEDIMP" || frais === "DEDEXP") this.codePlusSource = this.transitaireSource;
        if (frais === "ENTBWS") this.codePlusSource = this.entrepotSource;

    }

    async enableFilters() {
        if (this?.ordre?.id) {
            const fields = this.columns.pipe(map(columns => columns.map(column => {
                return (this.addKeyToField(column.dataField));
            })));
            this.dataSource = this.ordresFraisService.getDataSource_v2(
                await fields.toPromise(),
            );
            this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
            this.datagrid.dataSource = this.dataSource;
        } else if (this.datagrid) this.datagrid.dataSource = null;
    }

    ngOnChanges() {
        this.enableFilters();
    }

    onValueChanged(event, cell) {
        let valueToSave;
        if (cell.setValue) {
            if (typeof event.value === "object" && cell.column.dataField === "codePlus")
                valueToSave = this.displayCodeBefore(event.value);
        } else {
            valueToSave = event.value;
        }
        this.codePlusSource = null;
        cell.setValue(valueToSave);

        switch (cell.column.dataField) {
            case "devise": {
                cell.component.cellValue(cell.component.getRowIndexByKey(cell.row.key),
                    "deviseTaux", cell.value.taux);
                break;
            }
            case "frais": {
                cell.component.cellValue(cell.component.getRowIndexByKey(cell.row.key),
                    "codePlus", "");
                break;
            }
        }

        // this.datagrid.instance.saveEditData();
    }

    onEditorPreparing(e) {
        // Saving cell main info
        // if (e.parentType === "dataRow") {
        //     e.editorOptions.onFocusIn = (elem) => {
        //         console.log("focus");
        //         if (e.dataField === "codePlus") {
        //             console.log(e);
        //         }
        //         // if (e.dataField !== "numero")
        //         elem.element.querySelector(".dx-texteditor-input")?.select();
        //     };
        // }
    }

    displayCodeBefore(data) {
        return data ?
            (data.code ? data.code : data.id) + " - " + (data.raisonSocial ? data.raisonSocial :
                (data.ville ? data.ville : data.description))
            : null;
    }

    displayDescOnly(data) {
        return data ? this.capitalize(data.description) : null;
    }

    displayCustom(data) {
        if (this.codePlusSource) {
            return this.displayCodeBefore(data);
        } else {
            return data;
        }
    }

    returnCodeId(data) {
        return data.code ? data.code : data.id;
    }

    capitalize(data) {
        return data ? data.charAt(0).toUpperCase() + data.slice(1).toLowerCase() : null;
    }

    onCellClick(e) {
        // Way to avoid Dx Selectbox list to appear when cell is readonly
        this.SelectBoxPopupWidth = e.cellElement.classList.contains("dx-datagrid-readonly") ? 0 : 400;

        if (e.column.dataField === "codePlus") {
            this.updateCodePlusDataSource(e.data);
        }
    }

    defineEditTemplate(field) {

        let templ;
        if (this.itemsWithSelectBox.includes(field)) templ = "selectBoxTemplate";
        if (field === "codePlus") templ = "customSelectBoxTemplate";
        return templ ? templ : false;
    }

    addKeyToField(field) {
        if (this.itemsWithSelectBox.includes(field) && field !== "codePlus") {
            field += `.${this[field + "Service"].model.getKeyField()}`;
        }
        return field;
    }

    onToggling(toggled: boolean) {
        toggled ? this.enableFilters() : (this.dataSource = null);
    }
}
