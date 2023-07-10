import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
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
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map, tap } from "rxjs/operators";

@Component({
  selector: "app-grid-articles-ref-client",
  templateUrl: "./grid-articles-ref-client.component.html",
  styleUrls: ["./grid-articles-ref-client.component.scss"],
})
export class GridArticlesRefClientComponent
  implements OnInit, AfterViewInit, NestedMain {
  @Output() selectChange = new EventEmitter<any>();
  @Input() public ordre: Ordre;
  @Input() public preFilterTitle: string;
  @Input() public additionnalFilter: any;
  @Input() public fetchPolicy: string;

  articles: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild("especeSB", { static: false }) especesSB: DxSelectBoxComponent;
  @ViewChild("varieteSB", { static: false }) varietesSB: DxSelectBoxComponent;
  @ViewChild("modesCultureSB", { static: false })
  modesCultureSB: DxSelectBoxComponent;
  @ViewChild("groupeSB") groupesSB: DxSelectBoxComponent;
  @ViewChild("emballageSB", { static: false })
  emballagesSB: DxSelectBoxComponent;
  @ViewChild("origineSB", { static: false }) originesSB: DxSelectBoxComponent;
  @ViewChild("valideSB", { static: false }) valideSB: DxSelectBoxComponent;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  tagFilters: { [path: string]: any[] } = {};
  especes: Observable<DataSource>;
  varietes: Observable<DataSource>;
  modesCulture: Observable<DataSource>;
  groupes: Observable<DataSource>;
  emballages: Observable<DataSource>;
  origines: Observable<DataSource>;
  trueFalse: any;
  allGridFilters: any;

  constructor(
    public articlesService: ArticlesService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    public clientsService: ClientsService,
    public especesService: EspecesService,
    public varietesService: VarietesService,
    public groupesEmballageService: EmballagesService,
    public emballagesService: EmballagesService,
    public modesCultureService: ModesCultureService,
    public originesService: OriginesService
  ) {
    this.apiService = this.articlesService;
    this.trueFalse = ["Tous", "Oui", "Non"];
  }

  ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.Article
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  ngAfterViewInit() {
    // "POMME" as default
    this.loadPreFilters();
    this["especes"].subscribe((res) =>
      res.load().then((result) => {
        this["especesSB"].instance.option("value", [
          result.filter((r) => r.node.key === "POMME")[0].node,
        ]);
      })
    );
  }

  loadPreFilters() {
    const refCltFilter = `(referencesClient.client.id=='${this.ordre.client.id}') and (valide == true)`;
    const dataToLoad = [
      {
        var: "especes",
        id: "matierePremiere.espece.id",
        desc: "matierePremiere.espece.description",
      },
      {
        var: "varietes",
        id: "matierePremiere.variete.id",
        desc: "matierePremiere.variete.description",
      },
      {
        var: "groupes",
        id: "emballage.emballage.groupe.id",
        desc: "emballage.emballage.groupe.description",
      },
      {
        var: "emballages",
        id: "emballage.emballage.id",
        desc: "emballage.emballage.description",
      },
      {
        var: "origines",
        id: "matierePremiere.origine.id",
        desc: "matierePremiere.origine.description",
      },
      {
        var: "modesCulture",
        id: "matierePremiere.modeCulture.id",
        desc: "matierePremiere.modeCulture.description",
      },
    ];
    dataToLoad.forEach((data) => {
      let pimpedFilter;
      // filtering emballages by their groups
      if (data.var === "emballages" && this.groupesSB.value.length) {
        pimpedFilter = refCltFilter;
        for (const { key } of this.groupesSB.value)
          pimpedFilter = `${pimpedFilter} and emballage.emballage.groupe.id == ${key}`;
      }

      this[data.var] = this.articlesService.getDistinctEntityDatasource(
        data.id,
        data.desc,
        pimpedFilter ?? refCltFilter,
        "no-cache"
      );
    });
  }

  onSelectionChanged(e) {
    this.selectChange.emit(e);
  }

  async refreshArticlesGrid() {
    this.loadPreFilters();
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );
    this.articles = this.articlesService.getDataSource_v2(
      await fields.toPromise(),
      this.fetchPolicy
    );
    this.articles.filter(this.allGridFilters);
    this.dataGrid.dataSource = this.articles;
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

  onCellPrepared(e) {
    // Best expression for emballage display
    if (
      e.rowType === "data" &&
      e.column.dataField === "emballage.emballage.description"
    ) {
      e.cellElement.textContent =
        e.data.emballage.emballage.id + " - " + e.value;
    }
  }

  /**
   * Apply filters from tag boxs
   * @param event List of field values
   * @param dataField Field path
   */
  onFieldValueChange(event: any[], dataField: any) {

    // No value cases
    if (event !== null) {
      if (!event.length) {
        event = ["null"];
      }
    }

    // toggle emballages filtering by their groupes
    if (dataField === "emballage.emballage.groupe.id") this.loadPreFilters();

    // Changing values for Oui/Non select-box
    if (event.toString() === "Oui") {
      event = ["true"];
    }
    if (event.toString() === "Non") {
      event = ["false"];
    }
    if (event.toString() === "Tous") {
      event = ["null"];
    }
    this.tagFilters[dataField] = event;

    try {
      this.allGridFilters = Object.entries(this.tagFilters)
        .filter(([, values]) => values.length)
        .filter(([, [value]]) => value !== "null")
        .map(([path, values]) =>
          values
            .map((value) => [
              path,
              value === "null" ? "isnotnull" : "=",
              value.key ?? value,
            ])
            .map((value) => JSON.stringify(value))
            .join(`¤${JSON.stringify("or")}¤`)
            .split("¤")
            .map((v) => JSON.parse(v))
        )
        .map((value) => JSON.stringify(value))
        .join(`¤${JSON.stringify("and")}¤`)
        .split("¤")
        .map((v) => JSON.parse(v));
    } catch (error) {
      console.warn("Failed to parse filter, resetted to empty");
      return;
    }

    if (!this.allGridFilters) this.allGridFilters = [];
    if (this.additionnalFilter)
      this.additionnalFilter.map((addFilt) =>
        this.allGridFilters.push(addFilt)
      );
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
