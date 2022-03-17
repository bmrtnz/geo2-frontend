import { Component, Input, OnChanges, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import Ordre from "app/shared/models/ordre.model";
import * as gridConfig from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { LocalizationService } from "app/shared/services/localization.service";
import { DxDataGridComponent } from "devextreme-angular";
import { SummaryType } from "app/shared/services/api.service";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridConfiguratorService, Grid, GridConfig } from "app/shared/services/grid-configurator.service";


@Component({
    selector: "app-grid-lignes-details",
    templateUrl: "./grid-lignes-details.component.html",
    styleUrls: ["./grid-lignes-details.component.scss"]
})
export class GridLignesDetailsComponent implements AfterViewInit {

    public dataSource: DataSource;
    public columnChooser = environment.columnChooser;
    public columns: Observable<GridColumn[]>;
    private gridConfig: Promise<GridConfig>;
    public totalItems: { column: string, summaryType: SummaryType, displayFormat?: string }[] = [];
    @Input() public ordre: Ordre;
    @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

    constructor(
        public ordreLignesService: OrdreLignesService,
        public gridConfiguratorService: GridConfiguratorService,
        public localizeService: LocalizationService
    ) {
        this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreLigneDetails);
        this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    }

    ngAfterViewInit() {
        this.enableFilters();
    }

    async enableFilters() {
        if (!this.datagrid) return;
        if (this?.ordre?.id) {
            const fields = this.columns.pipe(map(columns => columns.map(column => column.dataField)));
            this.dataSource = this.ordreLignesService.getDataSource_v2(await fields.toPromise());
            this.dataSource.filter([
                ["ordre.id", "=", this.ordre.id],
            ]);
            this.datagrid.dataSource = this.dataSource;
        } else if (this.datagrid)
            this.datagrid.dataSource = null;
    }

    onCellPrepared(e) {
        if (e.rowType === "data") {
            // Descript. article
            if (e.column.dataField === "article.description") {
                e.cellElement.innerText = e.data.article.matierePremiere.variete.description + " " + e.cellElement.innerText;
            }
        }
    }

}
