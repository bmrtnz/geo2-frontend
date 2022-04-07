import { Component, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { InfoPopupComponent } from "app/shared/components/info-popup/info-popup.component";
import Ordre from "app/shared/models/ordre.model";
import { LieuxPassageAQuaiService, LocalizationService, TransporteursService } from "app/shared/services";
import { IncotermsService } from "app/shared/services/api/incoterms.service";
import { InstructionsService } from "app/shared/services/api/instructions.service";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
    Grid,
    GridConfig, GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AjoutEtapeLogistiquePopupComponent } from "../ajout-etape-logistique-popup/ajout-etape-logistique-popup.component";
import { ToggledGrid } from "../form/form.component";
import { ZoomLieupassageaquaiPopupComponent } from "../zoom-lieupassageaquai-popup/zoom-lieupassageaquai-popup.component";
import { ZoomTransporteurPopupComponent } from "../zoom-transporteur-popup/zoom-transporteur-popup.component";


@Component({
    selector: "app-grid-logistiques",
    templateUrl: "./grid-logistiques.component.html",
    styleUrls: ["./grid-logistiques.component.scss"],
})
export class GridLogistiquesComponent implements ToggledGrid, OnChanges {
    public dataSource: DataSource;
    public transporteurGroupageSource: DataSource;
    public groupageSource: DataSource;
    public incotermFournisseurSource: DataSource;
    public instructionsList: string[];
    public SelectBoxPopupWidth: number;
    public itemsWithSelectBox: string[];
    public columnChooser = environment.columnChooser;
    public columns: Observable<GridColumn[]>;
    private gridConfig: Promise<GridConfig>;
    private hintDblClick: string;
    public addStepText: string;
    public infoPopupText: string;
    public env = environment;
    @Input() public ordre: Ordre;
    @Output() public transporteurLigneId: string;
    @Output() public transporteurTitle: string;
    @Output() public lieupassageaquaiLigneId: string;
    @Output() public lieupassageaquaiTitle: string;
    @Output() public lieuxGroupage: string[];
    @Output() public ligneId: string;
    @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
    @ViewChild(ZoomTransporteurPopupComponent, { static: false }) zoomTransporteurPopup: ZoomTransporteurPopupComponent;
    @ViewChild(ZoomLieupassageaquaiPopupComponent, { static: false }) zoomLieupassageaquaiPopup: ZoomLieupassageaquaiPopupComponent;
    @ViewChild(AjoutEtapeLogistiquePopupComponent, { static: false }) ajoutEtapePopup: AjoutEtapeLogistiquePopupComponent;
    @ViewChild(InfoPopupComponent, { static: false }) infoPopup: InfoPopupComponent;

    constructor(
        private ordresLogistiquesService: OrdresLogistiquesService,
        public gridConfiguratorService: GridConfiguratorService,
        public dateManagementService: DateManagementService,
        public groupageService: LieuxPassageAQuaiService,
        public instructionsService: InstructionsService,
        public incotermFournisseurService: IncotermsService,
        public transporteurGroupageService: TransporteursService,
        public localizeService: LocalizationService,
    ) {
        this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
            Grid.OrdreLogistique,
        );
        this.columns = from(this.gridConfig).pipe(
            map((config) => config.columns),
        );
        this.addStep = this.addStep.bind(this);
        this.itemsWithSelectBox = [
            "transporteurGroupage",
            "groupage",
            "incotermFournisseur"
        ];
        this.lieuxGroupage = [];
        this.instructionsList = [];
        this.hintDblClick = this.localizeService.localize("hint-DblClick-file");
        this.addStepText = this.localizeService.localize("hint-addStep");
        this.transporteurGroupageSource = this.transporteurGroupageService.getDataSource_v2(["id", "raisonSocial"]);
        this.transporteurGroupageSource.filter(["valide", "=", true]);
        this.groupageSource = this.groupageService.getDataSource_v2(["id", "ville"]);
        this.groupageSource.filter(["valide", "=", true]);
        this.incotermFournisseurSource = this.incotermFournisseurService.getDataSource_v2(["id", "description"]);
        this.incotermFournisseurSource.filter(["valide", "=", true]);
        this.instructionsService.getDataSource_v2(["id", "description", "valide"]).load().then(res => {
            res
                .filter(inst => inst.valide)
                .map(inst => this.instructionsList.push(inst.description));
        });
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
            // this.datagrid.instance.saveEditData();
        }
    }

    onCellClick(e) {
        // Way to avoid Dx Selectbox list to appear when cell is readonly
        this.SelectBoxPopupWidth = e.cellElement.classList.contains("dx-datagrid-readonly") ? 0 : 400;
    }

    defineEditTemplate(field) {

        let templ;
        if (this.itemsWithSelectBox.includes(field)) templ = "selectBoxTemplate";
        if (
            field === "dateDepartPrevueFournisseur" ||
            field === "dateLivraisonLieuGroupage" ||
            field === "dateDepartPrevueGroupage"
        ) templ = "datetimeBoxTemplate";
        if (field === "codeFournisseur") templ = "simpleElementEditTemplate";
        if (field === "instructions") templ = "customSelectBoxTemplate";
        return templ ? templ : false;
    }

    addStep(e) {
        e.event.preventDefault();
        // if (e.row.data.groupage?.id) { // This condition may be more logical (?)
        if (this.lieuxGroupage && this.lieuxGroupage.length) {
            this.ligneId = e.row.data.id;
            this.ajoutEtapePopup.visible = true;
        } else {
            notify(this.localizeService.localize("text-groupage-popup"), "warning", 5000);
        }
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

    onContentReady(e) {
        this.lieuxGroupage = [];
        e.component.getVisibleRows()
            .filter(row => row.data.groupage?.id !== null)
            .map(row => {
                if (!this.lieuxGroupage?.includes(row.data.groupage?.id))
                    this.lieuxGroupage.push(row.data.groupage?.id);
            });
    }

    showBLCheck(cell) {
        return !!cell.data.fournisseurReferenceDOC;
    }

    onCellPrepared(e) {
        if (e.rowType === "data") {
            if (this.itemsWithSelectBox.includes(e.column.dataField)) {
                if (e.value?.id) {
                    e.cellElement.classList.add("cursor-pointer");
                    // const titleDiv = e.cellElement.querySelector(".SB-edit-title-element");
                    // if (titleDiv) {
                    //     titleDiv.title = e.value.id
                    //         + " ("
                    //         + (e.value.ville ? e.value.ville : e.value.raisonSocial)
                    //         + ")"
                    //         + "\r\n"
                    //         + this.hintDblClick;
                    // }
                }
            }
            if (e.column.dataField === "instructions") {
                if (e.value) e.cellElement.title = e.value;
            }
        }
    }

    public refresh() {
        this.datagrid.instance.refresh();
    }
}
