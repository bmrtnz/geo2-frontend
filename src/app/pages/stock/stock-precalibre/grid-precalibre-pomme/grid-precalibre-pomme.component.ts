import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Article } from "app/shared/models";
import Ordre from "app/shared/models/ordre.model";
import {
  AuthService,
  ClientsService,
  LocalizationService,
} from "app/shared/services";
import { ApiService } from "app/shared/services/api.service";
import { ArticlesService } from "app/shared/services/api/articles.service";
import { StocksService } from "app/shared/services/api/stocks.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "app/pages/ordres/grids.service";

@Component({
  selector: "app-grid-precalibre-pomme",
  templateUrl: "./grid-precalibre-pomme.component.html",
  styleUrls: ["./grid-precalibre-pomme.component.scss"],
})
export class GridPrecalibrePommeComponent {
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
    public articlesService: ArticlesService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    public gridsService: GridsService,
    public clientsService: ClientsService,
    private stocksService: StocksService,
    public authService: AuthService
  ) {
    this.apiService = this.articlesService;
  }

  async enableFilters() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreStock
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );
    this.articles = this.articlesService.getDataSource_v2(
      await fields.toPromise()
    );
    this.datagrid.dataSource = this.articles;
  }

  displayCodeBefore(data) {
    if (data?.__typename === "DistinctEdge") {
      return data ? `${data.node.key} - ${data.node.description}` : null;
    }

    return data
      ? (data.code ? data.code : data.id) +
          " - " +
          (data.nomUtilisateur
            ? data.nomUtilisateur
            : data.raisonSocial
            ? data.raisonSocial
            : data.description)
      : null;
  }
}
