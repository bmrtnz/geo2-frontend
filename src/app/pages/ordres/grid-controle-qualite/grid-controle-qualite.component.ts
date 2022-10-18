import { Component, Input, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { CQLignesService } from "app/shared/services/api/cq-lignes.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import * as gridConfig from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { ToggledGrid } from "../form/form.component";

@Component({
  selector: "app-grid-controle-qualite",
  templateUrl: "./grid-controle-qualite.component.html",
  styleUrls: ["./grid-controle-qualite.component.scss"],
})
export class GridControleQualiteComponent implements ToggledGrid {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];

  constructor(
    private cqLignesService: CQLignesService,
    public localization: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService,
  ) {
    this.detailedFields = gridConfig["controle-qualite"].columns;
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource = this.cqLignesService.getDataSource_v2(
        this.detailedFields.map((property) => property.dataField),
      );
      this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
      this.dataGrid.dataSource = this.dataSource;
    }
  }

  onCellPrepared(e) {
    // Adjusting displayed values
    if (e.rowType === "data") {
      if (e.column.dataField === "lotConforme") {
        let valCell = e.data[e.column.dataField];
        if (valCell !== null) {
          if (valCell === true) {
            valCell = "OK";
          } else {
            valCell = "NON";
          }
        } else {
          valCell = "N/A";
        }
        e.cellElement.innerText = valCell;
      }
      if (e.column.dataField === "isExp") {
        let valCell = e.data[e.column.dataField];
        if (valCell !== -2) {
          if (valCell === 0) {
            valCell = "OK";
          } else {
            valCell = "NON";
          }
        } else {
          valCell = "N/A";
        }
        e.cellElement.innerText = valCell;
      }
    }
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : (this.dataSource = null);
  }

  showPhotosButton(cell) {
    return true;
  }

  openPhotos(cell) {
    console.log("open photos");
  }

  openCQReport(cell) {
    console.log("open CQ");
  }

}
