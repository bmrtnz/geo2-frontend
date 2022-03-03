import {
    Component,
    Input,
    OnChanges,
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
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
    GridConfiguratorService,
    Grid,
    GridConfig,
} from "app/shared/services/grid-configurator.service";
import { DateManagementService } from "app/shared/services/date-management.service";

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
    @Input() public ordre: Ordre;
    @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

    constructor(
        public ordresLogistiquesService: OrdresLogistiquesService,
        public gridConfiguratorService: GridConfiguratorService,
        public dateManagementService: DateManagementService,
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
        }
    }
}
