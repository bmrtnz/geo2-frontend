import { Component, Input, OnChanges, Output, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LieuxPassageAQuaiService, LocalizationService, TransporteursService } from "app/shared/services";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { ToggledGrid } from "../form/form.component";
import * as gridConfig from "assets/configurations/grids.json";
import { ZoomLieupassageaquaiPopupComponent } from "../zoom-lieupassageaquai-popup/zoom-lieupassageaquai-popup.component";
import { ZoomTransporteurPopupComponent } from "../zoom-transporteur-popup/zoom-transporteur-popup.component";
import { DxDataGridComponent } from "devextreme-angular";
import { GridColumn } from "basic";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
    GridConfiguratorService,
    Grid,
    GridConfig,
} from "app/shared/services/grid-configurator.service";
import { DateManagementService } from "app/shared/services/date-management.service";

@Component({
    selector: "app-grid-logistiques",
    templateUrl: "./grid-logistiques.component.html",
    styleUrls: ["./grid-logistiques.component.scss"],
})
export class GridLogistiquesComponent implements ToggledGrid, OnChanges {
    public dataSource: DataSource;
    public transporteurGroupageSource: DataSource;
    public groupageSource: DataSource;
    public SelectBoxPopupWidth: number;
    public itemsWithSelectBox: string[];
    public columnChooser = environment.columnChooser;
    public columns: Observable<GridColumn[]>;
    private gridConfig: Promise<GridConfig>;
    private hintDblClick: string;
    public env = environment;
    @Input() public ordre: Ordre;
    @Output() public transporteurLigneId: string;
    @Output() public transporteurTitle: string;
    @Output() public lieupassageaquaiLigneId: string;
    @Output() public lieupassageaquaiTitle: string;
    @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
    @ViewChild(ZoomTransporteurPopupComponent, { static: false }) zoomTransporteurPopup: ZoomTransporteurPopupComponent;
    @ViewChild(ZoomLieupassageaquaiPopupComponent, { static: false }) zoomLieupassageaquaiPopup: ZoomLieupassageaquaiPopupComponent;

    constructor(
        private ordresLogistiquesService: OrdresLogistiquesService,
        public gridConfiguratorService: GridConfiguratorService,
        public dateManagementService: DateManagementService,
        public groupageService: LieuxPassageAQuaiService,
        public transporteurGroupageService: TransporteursService,
        public localizeService: LocalizationService,
    ) {
        this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
            Grid.OrdreLogistique,
        );
        this.columns = from(this.gridConfig).pipe(
            map((config) => config.columns),
        );
        this.itemsWithSelectBox = [
            "transporteurGroupage",
            "groupage"
        ];
        this.hintDblClick = this.localizeService.localize("hint-DblClick-file");
        this.transporteurGroupageSource = this.transporteurGroupageService.getDataSource_v2(["id", "raisonSocial"]);
        this.transporteurGroupageSource.filter(["valide", "=", true]);
        this.groupageSource = this.groupageService.getDataSource_v2(["id", "ville"]);
        this.groupageSource.filter(["valide", "=", true]);
    }

    async enableFilters() {
        if (this?.ordre?.id) {
            const fields = this.columns.pipe(map(columns => columns.map(column => {
                return (this.addKeyToField(column.dataField));
            })));
            this.dataSource = this.ordresLogistiquesService.getDataSource_v2(
                await fields.toPromise(),
            );
            this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
            this.datagrid.dataSource = this.dataSource;
        } else if (this.datagrid) this.datagrid.dataSource = null;
    }

    ngOnChanges() {
        this.enableFilters();
    }

    onToggling(toggled: boolean) {
        toggled ? this.enableFilters() : (this.dataSource = null);
    }

    addKeyToField(field) {
        if (this.itemsWithSelectBox.includes(field)) {
            field += `.${this[field + "Service"].model.getKeyField()}`;
        }
        return field;
    }

    onValueChanged(event, cell) {
        if (cell.setValue) {
            cell.setValue(event.value);
            // this.cellValueChange(event);
            // this.idLigne = cell.data.id;
            // this.dataField = cell.column.dataField;
        }
    }

    onCellClick(e) {
        // Way to avoid Dx Selectbox list to appear when cell is readonly
        this.SelectBoxPopupWidth = e.cellElement.classList.contains("dx-datagrid-readonly") ? 0 : 400;
    }

    defineTemplate(field) {

        let templ;
        if (this.itemsWithSelectBox.includes(field)) templ = "selectBoxEditTemplate";
        // if (field === "article.matierePremiere.origine.id") templ = "origineTemplate";
        // if (field === "ordre.client.id") templ = "certificationTemplate";
        return templ ? templ : false;
    }

    displayIdBefore(data) {
        return data ?
            data.id + " - " + (data.raisonSocial ? data.raisonSocial :
                (data.ville ? data.ville : data.description))
            : null;
    }

    openFilePopup(e) {
        if (e.column?.dataField === "transporteurGroupage") {
            this.transporteurLigneId = e.data[e.column.dataField].id;
            if (this.transporteurLigneId === null) return;
            this.transporteurTitle = this.itemsWithSelectBox[0];
            this.zoomTransporteurPopup.visible = true;
        }
        if (e.column?.dataField === "groupage") {
            this.lieupassageaquaiLigneId = e.data[e.column.dataField].id;
            if (this.lieupassageaquaiLigneId === null) return;
            this.lieupassageaquaiTitle = this.itemsWithSelectBox[1];
            this.zoomLieupassageaquaiPopup.visible = true;
        }
    }

    onCellPrepared(e) {
        if (e.rowType === "data") {
            // Best expression for date
            if (
                e.column.dataField === "dateLivraisonPrevue" ||
                e.column.dataField === "dateDepartPrevueFournisseur" ||
                e.column.dataField === "dateLivraisonLieuGroupage" ||
                e.column.dataField === "dateDepartPrevueGroupage" ||
                e.column.dataField === "ordre.ETDDate" ||
                e.column.dataField === "ordre.ETADate"
            ) {
                if (e.value)
                    e.cellElement.innerText =
                        this.dateManagementService.friendlyDate(e.value, true);
            }
            if (this.itemsWithSelectBox.includes(e.column.dataField)) {
                if (e.value?.id) {
                    e.cellElement.classList.add("cursor-pointer");
                    e.cellElement.title = this.hintDblClick;
                }
            }
        }
    }
}
