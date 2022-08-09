import { Component, Input, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { CommentairesOrdresService } from "app/shared/services/api/commentaires-ordres.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import * as gridConfig from "assets/configurations/grids.json";
import { ToggledGrid } from "../form/form.component";
import { GridColumn } from "basic";
import { DateManagementService } from "app/shared/services/date-management.service";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "app/shared/services";
import CommentaireOrdre from "app/shared/models/commentaire-ordre.model";

@Component({
  selector: "app-grid-commentaire-ordre",
  templateUrl: "./grid-commentaire-ordre.component.html",
  styleUrls: ["./grid-commentaire-ordre.component.scss"],
})
export class GridCommentaireOrdreComponent implements ToggledGrid {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public commentaires: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;

  constructor(
    private dateManagementService: DateManagementService,
    private authService: AuthService,
    private commentairesOrdresService: CommentairesOrdresService,
    public gridConfiguratorService: GridConfiguratorService,
  ) {
    this.detailedFields = gridConfig["commentaire-ordre"].columns;
  }

  async updateGrid() {

    if (!this.dataGrid.dataSource) {
      this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.CommentaireOrdre);
      this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    }

    const fields = this.columns.pipe(map(columns => columns.map(column => {
      return column.dataField;
    })));
    this.commentaires = this.commentairesOrdresService.getDataSource_v2(await fields.toPromise());
    this.commentaires.filter([["ordre.id", "=", this.ordre.id]]);
    this.dataGrid.dataSource = null;
    this.dataGrid.dataSource = this.commentaires;

  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.updateGrid();
      // this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
      // this.dataGrid.dataSource = this.dataSource;
    }
  }

  onInitNewRow(e) {
    e.data.dateModification = "Maintenant";
    e.data.userModification = this.authService.currentUser.nomInterne;
    e.data.ordre = { id: this.ordre.id };
  }

  onRowClick({ rowIndex }) {
    this.dataGrid.instance.editRow(rowIndex);
  }

  onCellPrepared(e) {
    // Best expression for date/time
    if (e.rowType === "data" && e.column.dataField === "dateModification") {
      if (e.value !== "Maintenant") e.cellElement.innerText = this.dateManagementService.friendlyDate(e.value);
    }
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : (this.dataSource = null);
  }
}
