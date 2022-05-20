import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import * as gridConfig from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { from, Observable, PartialObserver } from "rxjs";
import { map } from "rxjs/operators";
import {
    GridConfiguratorService,
    Grid,
    GridConfig,
} from "app/shared/services/grid-configurator.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import notify from "devextreme/ui/notify";
import OrdreLogistique from "app/shared/models/ordre-logistique.model";
import { ChoixRaisonDecloturePopupComponent } from "../choix-raison-decloture-popup/choix-raison-decloture-popup.component";
import { HistoriqueModifDetailPopupComponent } from "../historique-modif-detail-popup/historique-modif-detail-popup.component";
import { HistoriqueLogistiqueService } from "app/shared/services/api/historique-logistique.service";
import { AuthService } from "app/shared/services";
import { HistoriqueModificationsDetailService } from "app/shared/services/api/historique-modifs-detail.service";
import { GridLignesDetailsComponent } from "../grid-lignes-details/grid-lignes-details.component";

@Component({
    selector: "app-grid-ordre-ligne-logistique",
    templateUrl: "./grid-ordre-ligne-logistique.component.html",
    styleUrls: ["./grid-ordre-ligne-logistique.component.scss"],
})
export class GridOrdreLigneLogistiqueComponent implements OnChanges {
    public dataSource: DataSource;
    public columnChooser = environment.columnChooser;
    public columns: Observable<GridColumn[]>;
    private gridConfig: Promise<GridConfig>;
    public allowMutations = false;
    public env = environment;
    public currentLogId: string;
    public currentRowIndex: number;
    public countHisto: boolean;
    @Input() public ordre: Ordre;
    @Output() public ordreLogistique: OrdreLogistique;
    @Input() public ligneLogistiqueId: string;
    @Output() refreshGridLigneDetail = new EventEmitter();
    @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
    @ViewChild(ChoixRaisonDecloturePopupComponent, { static: false }) choixRaisonPopup: ChoixRaisonDecloturePopupComponent;
    @ViewChild(HistoriqueModifDetailPopupComponent, { static: false }) histoDetailPopup: HistoriqueModifDetailPopupComponent;

    constructor(
        public ordresLogistiquesService: OrdresLogistiquesService,
        public gridConfiguratorService: GridConfiguratorService,
        public dateManagementService: DateManagementService,
        private functionsService: FunctionsService,
        public historiqueModificationsDetailService: HistoriqueModificationsDetailService,
        public authService: AuthService,
        public historiqueLogistiqueService: HistoriqueLogistiqueService,
        public localizeService: LocalizationService,
    ) {
        this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
            Grid.OrdreLigneLogistique,
        );
        this.columns = from(this.gridConfig).pipe(
            map((config) => config.columns),
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        this.enableFilters();
        this.allowMutations = !this.env.production; // We can update some fields even if the order is closed
    }

    async enableFilters() {
        if (this?.ordre?.id) {
            const fields = this.columns.pipe(
                map((columns) => columns.map((column) => column.dataField)),
            );
            this.dataSource = this.ordresLogistiquesService.getDataSource_v2(
                await fields.toPromise(),
            );
            this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
            this.datagrid.dataSource = this.dataSource;
        } else if (this.datagrid) this.datagrid.dataSource = null;
    }

    applySentGridRowStyle(e) {
        if (e.rowType === "data") {
            if (e.data.expedieStation) {
                e.rowElement.classList.add("sent-highlight-datagrid-row");
            }
        }
    }

    onCellPrepared(e) {
        if (e.rowType === "data") {
            // Best expression for date/time
            if (e.column.dataField === "dateDepartReelleFournisseur") {
                if (e.value)
                    e.cellElement.innerText =
                        this.dateManagementService.friendlyDate(e.value, true);
            }
            if (e.column.dataField === "expedieStation") {
                e.cellElement.classList.add("cursor-pointer");
            }
        }
    }

    public refresh() {
        this.datagrid.instance.refresh();
    }

    showHistoDetail(cell) {

        if (this.countHisto) return;
        this.countHisto = true;
        cell.cellElement.classList.add("hide-button");
        this.ligneLogistiqueId = cell.data.id;
        this.historiqueModificationsDetailService
            .countModifDetailHistoryById(this.ligneLogistiqueId)
            .then((res) => {
                this.countHisto = false;
                cell.cellElement.classList.remove("hide-button");
                if (res.countHistoriqueModificationDetail) {
                    this.histoDetailPopup.visible = true;
                    console.log(res.countHistoriqueModificationDetail);
                } else {
                    notify("Aucun historique disponible", "warning", 3000);
                }
            });

    }

    onEditorPreparing(e) {
        // Saving cell main info
        if (e.parentType === "dataRow") {
            e.editorOptions.onFocusIn = (elem) => {
                elem.element.querySelector(".dx-texteditor-input")?.select();
            };
        }
    }

    saveGridField(rowIndex, field, state) {
        this.datagrid.instance.cellValue(rowIndex, field, state);
        this.datagrid.instance.saveEditData();
    }

    onCellClick(e) {
        this.currentLogId = e.data.id;
        this.currentRowIndex = e.component.getRowIndexByKey(this.currentLogId);
        switch (e.column.dataField) {
            case "expedieStation": {
                if (e.data.expedieStation === true) {
                    this.choixRaisonPopup.visible = true;
                } else {
                    this.saveGridField(this.currentRowIndex, "expedieStation", true);
                    this.onCheckCloturer();
                    break;
                }
            }
        }
    }

    reasonChosen(reasonId) {
        // Save uncloture
        this.saveGridField(this.currentRowIndex, "expedieStation", false);
        this.onCheckCloturer();

    }

    onCheckCloturer() {

        // f_details_exp_on_check_cloturer
        this.refreshGridLigneDetail.emit(true);
    }

}
