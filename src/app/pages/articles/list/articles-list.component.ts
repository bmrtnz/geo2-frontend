import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NestedMain } from "app/pages/nested/nested.component";
import Ordre from "app/shared/models/ordre.model";
import { ClientsService, LocalizationService } from "app/shared/services";
import { ApiService } from "app/shared/services/api.service";
import { ArticlesService } from "app/shared/services/api/articles.service";
import { EmballagesService } from "app/shared/services/api/emballages.service";
import { EspecesService } from "app/shared/services/api/especes.service";
import { ModesCultureService } from "app/shared/services/api/modes-culture.service";
import { OriginesService } from "app/shared/services/api/origines.service";
import { VarietesService } from "app/shared/services/api/varietes.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-articles-list",
  templateUrl: "./articles-list.component.html",
  styleUrls: ["./articles-list.component.scss"]
})
export class ArticlesListComponent implements OnInit, NestedMain {

  @Output() selectChange = new EventEmitter<any>();
  @Input() public ordre: Ordre;

  articles: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  @ViewChild("especeSB", { static: false }) especeSB: DxSelectBoxComponent;
  @ViewChild("varieteSB", { static: false }) varieteSB: DxSelectBoxComponent;
  @ViewChild("modesCultureSB", { static: false }) modesCultureSB: DxSelectBoxComponent;
  @ViewChild("emballageSB", { static: false }) emballageSB: DxSelectBoxComponent;
  @ViewChild("origineSB", { static: false }) origineSB: DxSelectBoxComponent;
  @ViewChild("valideSB", { static: false }) valideSB: DxSelectBoxComponent;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  tagFilters: { [path: string]: string[] } = {};
  especes: DataSource;
  origines: DataSource;
  varietes: DataSource;
  emballages: DataSource;
  modesCulture: DataSource;
  trueFalse: any;
  initialSpecy: any;
  allGridFilters: any;
  toRefresh: boolean;

  constructor(
    public articlesService: ArticlesService,
    private router: Router,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    public clientsService: ClientsService,
    public especesService: EspecesService,
    public varietesService: VarietesService,
    public emballagesService: EmballagesService,
    public modesCultureService: ModesCultureService,
    public originesService: OriginesService,
  ) {
    this.apiService = this.articlesService;
    this.especes = this.especesService.getDistinctDataSource(["id"]);
    this.especes.filter(["valide", "=", true]);
    this.origines = this.originesService.getDistinctDataSource(["id", "description", "espece.id"]);
    this.origines.filter(["valide", "=", true]);
    this.varietes = this.varietesService.getDistinctDataSource(["id", "description"]);
    this.varietes.filter(["valide", "=", true]);
    this.emballages = this.emballagesService.getDistinctDataSource(["id", "description", "espece.id"]);
    this.emballages.filter(["valide", "=", true]);
    this.modesCulture = this.modesCultureService.getDataSource_v2(["id", "description"]);
    this.modesCulture.filter(["valide", "=", true]);
    this.trueFalse = ["Tous", "Oui", "Non"];
  }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.Article);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    const fields = this.columns.pipe(map(columns => columns.map(column => column.dataField)));
    this.articles = this.articlesService.getDataSource_v2(await fields.toPromise());
    this.toRefresh = true;
  }

  onSelectionChanged(e) {
    this.selectChange.emit(e);
  }

  refreshArticlesGrid() {
    if (this.dataGrid.dataSource === null
      || (Array.isArray(this.dataGrid.dataSource)
        && !this.dataGrid.dataSource.length))
      this.dataGrid.dataSource = this.articles;
    this.dataGrid.instance.refresh();
    this.dataGrid.instance.filter(this.allGridFilters);
    this.toRefresh = false;
  }

  onRowDblClick(e) {
    // If ordre is there, we're accessing from an order : no article file opening is possible
    if (!this.ordre) this.router.navigate([`/pages/articles/${e.data.id}`]);
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

  /**
   * Apply filters from tag boxs
   * @param event List of field values
   * @param dataField Field path
   */
  onFieldValueChange(event: string[], dataField: string) {

    this.toRefresh = true;

    // No value cases
    if (event !== null) {
      if (!event.length) {
        event = ["null"];
      }
    }

    // Changing values for Oui/Non select-box
    if (event.toString() === "Oui") { event = ["true"]; }
    if (event.toString() === "Non") { event = ["false"]; }
    if (event.toString() === "Tous") { event = ["null"]; }
    this.tagFilters[dataField] = event;

    try {
      this.allGridFilters = Object
        .entries(this.tagFilters)
        .filter(([, values]) => values.length)
        .filter(([, [value]]) => value !== "null")
        .map(([path, values]) => values
          .map(value => [path, value === "null" ? "isnotnull" : "=", value])
          .map(value => JSON.stringify(value))
          .join(`¤${JSON.stringify("or")}¤`)
          .split("¤")
          .map(v => JSON.parse(v))
        )
        .map(value => JSON.stringify(value))
        .join(`¤${JSON.stringify("and")}¤`)
        .split("¤")
        .map(v => JSON.parse(v));
    } catch (error) {
      console.warn("Failed to parse filter, resetted to empty");
      this.allGridFilters = null;
    }

    // Filtering variete, emballage & origine selectBox list depending on specy
    const filter = [];

    if (dataField === "matierePremiere.espece.id") {
      // Clear all dependent fields

      if (event.length) {
        event.forEach(element => {
          filter.push(["espece.id", "=", element]);
          filter.push("or");
        });
        filter.pop(); // Remove last 'or'

        this.varietes = this.varietesService.getDistinctDataSource(["id", "description"]);
        if (event[0] !== "null") this.varietes.filter(filter);
        this.emballages = this.emballagesService.getDistinctDataSource(["id", "description", "espece.id"]);
        if (event[0] !== "null") this.emballages.filter(filter);
        this.origines = this.originesService.getDistinctDataSource(["id", "description", "espece.id"]);
        if (event[0] !== "null") this.origines.filter(filter);
      }
    }

  }

  formatListItem(data) {
    if (data?.description)
      return `${data.id.toUpperCase()} - ${data.description?.toUpperCase()}`;
    if (data?.id)
      return data.id.toUpperCase();
    if (data?.key)
      return data.key.toUpperCase();
    return data.toString();
  }

}
