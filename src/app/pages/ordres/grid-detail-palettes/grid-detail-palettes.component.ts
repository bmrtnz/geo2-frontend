import { Component, Input, OnInit, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { TracabiliteLignesService } from "app/shared/services/api/tracabilite-lignes.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-grid-detail-palettes",
  templateUrl: "./grid-detail-palettes.component.html",
  styleUrls: ["./grid-detail-palettes.component.scss"],
})
export class GridDetailPalettesComponent implements OnInit {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;

  constructor(
    private tracabiliteLignesService: TracabiliteLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreDetailPalettes
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }
  ngOnInit(): void {
    this.enableFilters();
  }

  async enableFilters() {
    if (this?.ordre?.id) {
      const fields = this.columns.pipe(
        map((cols) =>
          cols.map((column) => {
            return column.dataField;
          })
        )
      );
      const gridFields = await fields.toPromise();
      this.dataSource =
        this.tracabiliteLignesService.getDataSource_v2(gridFields);

      this.dataSource.filter([
        ["tracabiliteDetailPalette.ordre.id", "=", this.ordre.id],
      ]);
      this.dataGrid.dataSource = this.dataSource;
    }
  }

  refresh() {
    this.dataGrid.instance.refresh();
  }

}
