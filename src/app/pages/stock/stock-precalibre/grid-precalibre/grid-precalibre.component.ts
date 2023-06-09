import { Component, EventEmitter, Input, ViewChild } from "@angular/core";
import { AuthService } from "app/shared/services";
import { ApiService } from "app/shared/services/api.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "app/pages/ordres/grids.service";

@Component({
  selector: "app-grid-precalibre",
  templateUrl: "./grid-precalibre.component.html",
  styleUrls: ["./grid-precalibre.component.scss"],
})
export class GridPrecalibreComponent {
  @Input() public fournisseurId: string;
  @Input() public especeId: string;
  @Input() public varieteId: string;
  @Input() public modeCultureId: string;

  articles: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true })
  datagrid: DxDataGridComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public gridsService: GridsService,
    public authService: AuthService
  ) {}

  setColumns() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.StockPreca
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.datagrid.instance.refresh();
  }
}
