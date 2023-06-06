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
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PromptPopupComponent } from "../../../shared/components/prompt-popup/prompt-popup.component";
import { StockConsolideService } from "../../../shared/services/api/stock-consolide.service";
import { GridsService } from "../grids.service";
import { OptionStockPopupComponent } from "../option-stock-popup/option-stock-popup.component";
import { ZoomArticlePopupComponent } from "../zoom-article-popup/zoom-article-popup.component";
import { ReservationPopupComponent } from "./reservation-popup/reservation-popup.component";

@Component({
  selector: "app-grid-stock",
  templateUrl: "./grid-stock.component.html",
  styleUrls: ["./grid-stock.component.scss"],
})
export class GridStockComponent implements OnInit {
  @Input() public ordre: Ordre;
  @Input() public destock: boolean;
  @Input() public reserv: boolean;
  @Output() selectChange = new EventEmitter<any>();
  @Output() public articleLigneId: string;
  @Output() public article: Partial<Article>;
  @Output() public ligneStockArticle: any;

  articles: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true })
  datagrid: DxDataGridComponent;
  @ViewChild("especeSB", { static: false }) especeSB: DxSelectBoxComponent;
  @ViewChild("varieteSB", { static: false }) varietesSB: DxSelectBoxComponent;
  @ViewChild("modesCultureSB", { static: false })
  modesCultureSB: DxSelectBoxComponent;
  @ViewChild("groupesSB") groupesSB: DxSelectBoxComponent;
  @ViewChild("emballageSB", { static: false })
  emballagesSB: DxSelectBoxComponent;
  @ViewChild("origineSB", { static: false }) originesSB: DxSelectBoxComponent;
  @ViewChild("bureauAchatSB", { static: false })
  bureauxAchatSB: DxSelectBoxComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false })
  zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild(ReservationPopupComponent)
  destockagePopup: ReservationPopupComponent;
  @ViewChild(OptionStockPopupComponent) optionPopup: OptionStockPopupComponent;
  @ViewChild(PromptPopupComponent, { static: false })
  promptPopupComponent: PromptPopupComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  tagFilters: { [path: string]: string[] } = {};
  especes: Observable<DataSource>;
  varietes: Observable<DataSource>;
  modesCulture: Observable<DataSource>;
  groupes: Observable<DataSource>;
  emballages: Observable<DataSource>;
  origines: Observable<DataSource>;
  bureauxAchat: Observable<DataSource>;
  trueFalse: any;
  initialSpecy: any;
  allGridFilters: any;
  toRefresh: boolean;
  gridTitle: string;
  noEspeceSet: boolean;

  constructor(
    public articlesService: ArticlesService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    public clientsService: ClientsService,
    private stocksService: StocksService,
    public authService: AuthService,
    private stockConsolideService: StockConsolideService,
    public gridsService: GridsService
  ) {
    this.apiService = this.articlesService;
    this.especes = this.stocksService.getDistinctEntityDatasource(
      "article.cahierDesCharge.espece.id"
    );
    this.trueFalse = ["Tous", "Oui", "Non"];
  }

  async ngOnInit() {
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
    this.toRefresh = true;
    this.gridTitle = this.localizeService.localize(
      "articles-catalogue-preFilter-stock-title"
    );
    this.onFieldValueChange(null, "espece"); // First run: setting filters values
  }

  onFilterChange() {
    this.noEspeceSet = !this.especeSB.value;
    this.toRefresh = !this.noEspeceSet;
  }

  /**
   * Apply filters from tag boxs
   * @param event List of field values
   * @param dataField Field path
   */
  onFieldValueChange(event, dataField: string) {
    this.onFilterChange();

    // Filtering variete, emballage & origine selectBox list depending on specy
    if (
      [
        "espece",
        "variete",
        "origine",
        "emballage.emballage.groupe.id",
        "emballage",
        "modeCulture",
      ].includes(dataField)
    ) {
      if (["espece"].includes(dataField)) {
        this.varietesSB.value = null;
        this.groupesSB.value = null;
        this.emballagesSB.value = null;
        this.originesSB.value = null;
        this.modesCultureSB.value = null;
      }

      if (["emballage.emballage.groupe.id"].includes(dataField))
        this.emballagesSB.value = null;

      let sbFilters = `(article.cahierDesCharge.espece.id=='${this.especeSB.value?.node?.key ?? this.especeSB.value?.key
        }' and quantiteTotale > 0 and valide == true)`;
      if (this.varietesSB.value)
        sbFilters += ` and article.matierePremiere.variete.id == '${this.varietesSB.value?.key}'`;
      if (this.groupesSB.value)
        sbFilters += ` and article.emballage.emballage.groupe.id == '${this.groupesSB.value?.key}'`;
      if (this.emballagesSB.value)
        sbFilters += ` and article.emballage.emballage.id == '${this.emballagesSB.value?.key}'`;
      if (this.originesSB.value)
        sbFilters += ` and article.matierePremiere.origine.id == '${this.originesSB.value?.key}'`;
      if (this.modesCultureSB.value)
        sbFilters += ` article.matierePremiere.modeCulture.id == '${this.modesCultureSB.value?.key}'`;
      const dataToLoad = [
        {
          var: "varietes",
          id: "article.matierePremiere.variete.id",
          desc: "article.matierePremiere.variete.description",
        },
        {
          var: "groupes",
          id: "article.emballage.emballage.groupe.id",
          desc: "article.emballage.emballage.groupe.description",
        },
        {
          var: "emballages",
          id: "article.emballage.emballage.id",
          desc: "article.emballage.emballage.description",
        },
        {
          var: "origines",
          id: "article.matierePremiere.origine.id",
          desc: "article.matierePremiere.origine.description",
        },
        {
          var: "bureauxAchat",
          id: "fournisseur.bureauAchat.id",
          desc: "fournisseur.bureauAchat.raisonSocial",
        },
        {
          var: "modesCulture",
          id: "article.matierePremiere.modeCulture.id",
          desc: "article.matierePremiere.modeCulture.description",
        },
      ];
      dataToLoad
        .filter((data) => !this[`${data.var}SB`].value)
        .forEach((data) => {
          if (data.var === "emballages")
            sbFilters += ` and article.emballage.emballage.groupe.id == ${this.groupesSB.value?.key}`;
          this[data.var] = this.stocksService.getDistinctEntityDatasource(
            data.id,
            data.desc,
            sbFilters
          );
        });
    }
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

  refreshArticlesGrid() {
    this.datagrid.instance.beginCustomLoading("");
    this.stocksService
      .allStockArticleList(
        this.especeSB.value?.node?.key ?? this.especeSB.value?.key,
        this.varietesSB.value?.key,
        this.originesSB.value?.key,
        this.modesCultureSB.value?.key,
        this.emballagesSB.value?.key,
        this.bureauxAchatSB.value?.key
      )
      .subscribe((res) => {
        this.datagrid.dataSource = res.data.allStockArticleList;
        this.datagrid.instance.refresh();
        this.datagrid.instance.endCustomLoading();
        this.toRefresh = false;
      });
  }

  openFilePopup(data) {
    this.articleLigneId = data.collapsedItems
      ? data.collapsedItems[0]?.articleID
      : data.items[0]?.articleID;
    if (this.articleLigneId) this.zoomArticlePopup.visible = true;
  }

  openReservationPopup(data) {
    if (!data?.articleID) return;
    this.ligneStockArticle = data;
    this.articlesService.getOne(data.articleID).subscribe((res) => {
      this.article = res.data.article;
      this.optionPopup.visible = true;
    });
  }

  openDestockagePopup(data) {
    if (data?.articleID) this.destockagePopup.present(data, this.ordre);
  }

  ajoutReservation() {
    this.selectChange.emit();
    this.datagrid.dataSource = [];
    this.toRefresh = true;
    this.gridsService.reload("SyntheseExpeditions");
  }

  onCellClick(e) {
    if (e.rowType === "group" && e.column.dataField === "commentaire") {
      this.datagrid.instance.expandRow(e.key);
    }
  }

  onCellDblClick(e) {
    if (e.column.dataField === "articleDescription") {
      this.openFilePopup(e.data);
    }
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

  onCellPrepared(e) {
    if (e.rowType === "group") {
      if (
        e.column.dataField === "articleDescription" &&
        e.cellElement.textContent
      ) {
        e.cellElement.title =
          this.localizeService.localize("hint-dblClick-file");
        e.cellElement.classList.add("cursor-pointer");
        const data = e.data.items ?? e.data.collapsedItems;
        if (data[0].bio) e.cellElement.classList.add("bio-article");
      }
    }

    if (["data", "group"].includes(e.rowType) && e.column.dataField) {
      // Fond jaune pour les stocks J21
      if (e.column.dataField === "quantiteCalculee4") {
        e.cellElement.classList.add("highlight-stockJ21-cell");
      } else {
        // Comment report on group row
        if (e.column.dataField === "commentaire" && e.rowType === "group") {
          let data = e.data.items ?? e.data.collapsedItems;
          data = data[0].commentaire;
          e.cellElement.innerText = data;
        }
        if (e.column.dataField.indexOf("quantiteCalculee") === 0) {
          let neg = false;
          if (e.rowType === "data") {
            if (e.value) if (e.value < 0) neg = true;
          } else {
            if (e.summaryItems[0].value < 0) neg = true;
          }
          if (neg) e.cellElement.classList.add("highlight-negativeStock-cell");
        }
      }
    }
  }

  formatListItem(data) {
    if (data?.description)
      return `${data.id.toUpperCase()} - ${data.description?.toUpperCase()}`;
    if (data?.id) return data.id.toUpperCase();
    if (data?.key) return data.key.toUpperCase();
    return data.toString();
  }

  editComment(cell) {
    this.articleLigneId = cell.data.articleID;
    this.promptPopupComponent.show({ comment: cell.value });
  }

  validateComment(comment) {
    this.datagrid.instance.beginCustomLoading("");
    this.stockConsolideService
      .save({
        id: this.articleLigneId,
        commentaire: comment,
      })
      .subscribe(() => this.refreshArticlesGrid());
  }
}
