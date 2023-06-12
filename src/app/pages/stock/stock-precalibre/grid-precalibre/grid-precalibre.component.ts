import { Component, EventEmitter, Input, ViewChild } from "@angular/core";
import { AuthService, LocalizationService } from "app/shared/services";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
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
  @Input() public especeId: string;
  @Input() public corrPommeKiwi: string[];

  contentReadyEvent = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, { static: true })
  datagrid: DxDataGridComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private localizationService: LocalizationService,
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

  caption(column) {
    // KEEP THIS! We need to use a correspondence table as POMME calibres are
    // also used for KIWI but with different names!
    const name =
      this.localizationService.localize(
        "ordrePreca-" + column.dataField?.split(".").join("-")
      ) || column.name;
    if (this.especeId === "KIWI") {
      let switchName;
      this.corrPommeKiwi.some((corr) => {
        if (corr.split("|")[0] === column.dataField) {
          switchName = corr.split("|")[1];
          return;
        }
      });
      return switchName ?? name;
    } else return name;
  }
}
