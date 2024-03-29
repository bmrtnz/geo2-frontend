import { AfterViewInit, Component, Input, OnInit, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { AuthService } from "app/shared/services";
import { CommentairesOrdresService } from "app/shared/services/api/commentaires-ordres.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import gridConfig from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../grids.service";

@Component({
  selector: "app-grid-commentaire-ordre",
  templateUrl: "./grid-commentaire-ordre.component.html",
  styleUrls: ["./grid-commentaire-ordre.component.scss"],
})
export class GridCommentaireOrdreComponent implements OnInit, AfterViewInit {
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
    public authService: AuthService,
    public gridsService: GridsService,
    private commentairesOrdresService: CommentairesOrdresService,
    public gridConfiguratorService: GridConfiguratorService
  ) {
    this.detailedFields = gridConfig["commentaire-ordre"].columns;
  }

  ngOnInit(): void {
    this.enableFilters();
  }

  ngAfterViewInit() {
    this.gridsService.register("Commentaires", this.dataGrid, this.gridsService.orderIdentifier(this.ordre));
  }


  async updateGrid() {
    if (!this.dataGrid.dataSource) {
      this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
        Grid.CommentaireOrdre
      );
      this.columns = from(this.gridConfig).pipe(
        map((config) => config.columns)
      );
    }

    const fields = this.columns.pipe(
      map((columns) =>
        columns.map((column) => {
          return column.dataField;
        })
      )
    );
    this.commentaires = this.commentairesOrdresService.getDataSource_v2(
      await fields.toPromise()
    );
    this.commentaires.filter([["ordre.id", "=", this.ordre.id]]);
    this.dataGrid.dataSource = null;
    this.dataGrid.dataSource = this.commentaires;
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.updateGrid();
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
      if (e.value !== "Maintenant")
        e.cellElement.innerText = this.dateManagementService.friendlyDate(
          e.value
        );
    }
  }

}
