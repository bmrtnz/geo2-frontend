import { Component, Input, ViewChild } from "@angular/core";
import type { Model } from "app/shared/models/model";
import { ModelFieldOptions } from "app/shared/models/model";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { OrdresFraisService } from "app/shared/services/api/ordres-frais.service";
import { GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ToggledGrid } from "../form/form.component";
import * as gridConfig from "assets/configurations/grids.json";
import { GridColumn } from "basic";

@Component({
    selector: "app-grid-frais",
    templateUrl: "./grid-frais.component.html",
    styleUrls: ["./grid-frais.component.scss"],
})
export class GridFraisComponent implements ToggledGrid {
    @Input() public ordre: Ordre;
    @ViewChild(DxDataGridComponent, { static: true })
    dataGrid: DxDataGridComponent;

    public dataSource: DataSource;
    public columnChooser = environment.columnChooser;
    public detailedFields: GridColumn[];

    constructor(
        private ordresFraisService: OrdresFraisService,
        public gridConfiguratorService: GridConfiguratorService,
        public localizeService: LocalizationService,
    ) {
        this.detailedFields = gridConfig["ordre-frais"].columns;
    }

    enableFilters() {
        if (this?.ordre?.id) {
            this.dataSource = this.ordresFraisService.getDataSource_v2(
                this.detailedFields.map((property) => property.dataField),
            );
            this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
            this.dataGrid.dataSource = this.dataSource;
        }
    }

    onToggling(toggled: boolean) {
        toggled ? this.enableFilters() : (this.dataSource = null);
    }
}
