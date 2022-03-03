import { Component, Input, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { ToggledGrid } from "../form/form.component";
import * as gridConfig from "assets/configurations/grids.json";
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
export class GridLogistiquesComponent implements ToggledGrid {
    public dataSource: DataSource;
    public columnChooser = environment.columnChooser;
    public columns: Observable<GridColumn[]>;
    private gridConfig: Promise<GridConfig>;
    @Input() public ordre: Ordre;
    @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

    constructor(
        private ordresLogistiquesService: OrdresLogistiquesService,
        public gridConfiguratorService: GridConfiguratorService,
        public dateManagementService: DateManagementService,
        public localizeService: LocalizationService,
    ) {
        this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
            Grid.OrdreLogistique,
        );
        this.columns = from(this.gridConfig).pipe(
            map((config) => config.columns),
        );
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

    onToggling(toggled: boolean) {
        toggled ? this.enableFilters() : (this.dataSource = null);
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
        }
    }
}
