import {
    Component,
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
    public dataField: string;
    public idLigne: string;
    @Input() public ordre: Ordre;
    @Output() public ordreLogistique: OrdreLogistique;
    @Input() public ligneLogistiqueId: string;
    @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
    @ViewChild(ChoixRaisonDecloturePopupComponent, { static: false }) choixRaisonPopup: ChoixRaisonDecloturePopupComponent;
    @ViewChild(HistoriqueModifDetailPopupComponent, { static: false }) histoDetailPopup: HistoriqueModifDetailPopupComponent;

    constructor(
        public ordresLogistiquesService: OrdresLogistiquesService,
        public gridConfiguratorService: GridConfiguratorService,
        public dateManagementService: DateManagementService,
        private functionsService: FunctionsService,
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

    private handleCellChangeEventResponse<T>(): PartialObserver<T> {
        return {
            next: v => this.refresh(),
            error: (message: string) => {
                notify({ message }, "error", 7000);
                console.log(message);
            }
        };
    }

    showHistoDetail(cell) {
        this.ligneLogistiqueId = cell.data.id;
        this.histoDetailPopup.visible = true;
    }

    onEditorPreparing(e) {
        // Saving cell main info
        if (e.parentType === "dataRow") {
            e.editorOptions.onFocusIn = (elem) => {
                this.dataField = e.dataField;
                this.idLigne = e.row?.data?.id;
                elem.element.querySelector(".dx-texteditor-input")?.select();
            };
        }
    }

    onCellClick(e) {
        switch (e.column.dataField) {
            // Conditionnal save
            case "expedieStation": {
                if (e.data.expedieStation === true) {
                    this.choixRaisonPopup.visible = true;
                }
                this.saveGridField(e, "expedieStation");
                break;
            }
        }
    }

    saveGridField(e, field) {
        e.component.cellValue(e.component.getRowIndexByKey(e.data.id), field, !e.data.expedieStation);
        this.datagrid.instance.saveEditData();
    }

}
