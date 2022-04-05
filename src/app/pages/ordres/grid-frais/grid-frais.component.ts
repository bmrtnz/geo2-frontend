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
        public transporteursService: TransporteursService,
        public transitairesService: TransitairesService,
        public entrepotsService: EntrepotsService,
        public localizeService: LocalizationService,
    ) {
        this.displayDescOnly = this.displayDescOnly.bind(this),
            this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
                Grid.OrdreFrais,
            );
        this.columns = from(this.gridConfig).pipe(
            map((config) => config.columns),
        );
        this.itemsWithSelectBox = [
            "frais",
            "devise"
        ];
        this.descriptionOnlyDisplaySB = [
            "frais"
        ];
        this.fraisSource = this.fraisService.getDataSource_v2(["id", "description"]);
        this.fraisSource.filter(["valide", "=", true]);
        this.deviseSource = this.deviseService.getDataSource_v2(["id", "description", "taux"]);
        this.deviseSource.filter(["valide", "=", true]);
        if (!this.codePlusTransporteurs?.length) {
            this.transporteursService.getDataSource_v2(["id", "raisonSocial", "valide"]).load().then(res => {
                res
                    .filter(result => result.valide)
                    .map(result => this.codePlusTransporteurs.push(this.displayIdBefore(result)));
                console.log("codePlusTransporteurs ", this.codePlusTransporteurs);
            });
        }
        if (!this.codePlusTransitaires?.length) {
            this.transitairesService.getDataSource_v2(["id", "raisonSocial", "valide"]).load().then(res => {
                res
                    .filter(result => result.valide)
                    .map(result => this.codePlusTransitaires.push(this.displayIdBefore(result)));
                console.log("codePlusTransitaires ", this.codePlusTransitaires);
            });
        }
        if (!this.codePlusEntrepots?.length) {
            this.entrepotsService.getDataSource_v2(["id", "raisonSocial", "valide"]).load().then(res => {
                res
                    .filter(result => result.valide)
                    .map(result => this.codePlusEntrepots.push(this.displayIdBefore(result)));
                console.log("codePlusEntrepots ", this.codePlusEntrepots);
            });
        }


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
        if (cell.setValue) {
            cell.setValue(event.value);
            // console.log(cell, cell.column.dataField);

            switch (cell.column.dataField) {
                case "devise": {
                    cell.component.cellValue(cell.component.getRowIndexByKey(cell.row.key),
                        "deviseTaux", cell.value.taux);
                }
            }

            // this.datagrid.instance.saveEditData();
        }
    }

    updateFournisseurObjetDataSource() {

    }

    displayIdBefore(data) {
        return data ?
            data.id + " - " + (data.raisonSocial ? data.raisonSocial :
                (data.ville ? data.ville : data.description))
            : null;
    }

    displayDescOnly(data) {
        return data ? this.capitalize(data.description) : null;
    }

    capitalize(data) {
        return data ? data.charAt(0).toUpperCase() + data.slice(1).toLowerCase() : null;
    }

    onCellClick(e) {
        // Way to avoid Dx Selectbox list to appear when cell is readonly
        this.SelectBoxPopupWidth = e.cellElement.classList.contains("dx-datagrid-readonly") ? 0 : 400;
    }

    defineEditTemplate(field) {

        let templ;
        if (this.itemsWithSelectBox.includes(field)) templ = "selectBoxTemplate";
        if (field === "codePlus") templ = "customSelectBoxTemplate";
        return templ ? templ : false;
    }

    addKeyToField(field) {
        if (this.itemsWithSelectBox.includes(field)) {
            field += `.${this[field + "Service"].model.getKeyField()}`;
        }
        return field;
    }

    onToggling(toggled: boolean) {
        toggled ? this.enableFilters() : (this.dataSource = null);
    }
}
