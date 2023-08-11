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
import notify from "devextreme/ui/notify";
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
import { ClientsArticleRefPopupComponent } from "app/shared/components/clients-article-ref-popup/clients-article-ref-popup.component";
import { RecapStockPopupComponent } from "../recap-stock-popup/recap-stock-popup.component";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { CampagnesService } from "app/shared/services/api/campagnes.service";
import { LoadResult } from "devextreme/data/custom_store";

let self;

@Component({
  selector: "app-grid-stock",
  templateUrl: "./grid-stock.component.html",
  styleUrls: ["./grid-stock.component.scss"],
})
export class GridStockComponent implements OnInit {
  @Input() public ordre: Ordre;
  @Input() public destock: boolean;
  @Input() public reserv: boolean;
  @Input() public recap: boolean;
  @Input() public clientsRef: boolean;
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
  @ViewChild("bureauAchatSB", { static: false }) bureauxAchatSB: DxSelectBoxComponent;
  @ViewChild("secteursSB", { static: false }) secteursSB: DxSelectBoxComponent;
  @ViewChild("clientsSB", { static: false }) clientsSB: DxSelectBoxComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false })
  zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild(ReservationPopupComponent)
  destockagePopup: ReservationPopupComponent;
  @ViewChild(OptionStockPopupComponent) optionPopup: OptionStockPopupComponent;
  @ViewChild(RecapStockPopupComponent) recapPopup: RecapStockPopupComponent;
  @ViewChild(PromptPopupComponent, { static: false })
  promptPopupComponent: PromptPopupComponent;
  @ViewChild(ClientsArticleRefPopupComponent, { static: false })
  clientsRefPopup: ClientsArticleRefPopupComponent;

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
  public clients: DataSource;
  public secteurs: DataSource;
  trueFalse: any;
  initialSpecy: any;
  calculate: boolean;
  allGridFilters: any;
  toRefresh: boolean;
  gridTitle: string;
  noEspeceSet: boolean;
  gridRowsTotal: number;

  public summaryFields = [
    "quantiteCalculee1",
    "quantiteCalculee2",
    "quantiteCalculee3",
    "quantiteCalculee4",
    "prevision3j",
    "prevision7j",
    "stock.quantiteTotale"
  ];
  public customSummaryFields = ["quantiteHebdomadaire"];

  readonly inheritedFields = new Set([
    "id",
    "articleID",
    "articleDescription",
    "valide",
    "stock.quantiteTotale",
    "age",
    "bio",
    "fournisseurCode",
    "proprietaireCode",
    "dateFabrication",
    "typePaletteID",
    "stockID",
    "quantiteCalculee1",
    "quantiteCalculee2",
    "quantiteCalculee3",
    "quantiteCalculee4",
    "quantiteReservee1",
    "quantiteReservee2",
    "quantiteReservee3",
    "quantiteReservee4",
    "quantiteHebdomadaire",
    "prevision3j",
    "prevision7j",
    "descriptionAbregee",
    "commentaire",
    "origineID",
    "varieteID",
    "especeID",
    "categorieID",
    "colisID",
    "calibreMarquageID",
    "calibreFournisseurID",
    "statut",
    "dateStatut",
  ]);

  constructor(
    public articlesService: ArticlesService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    public clientsService: ClientsService,
    public secteursService: SecteursService,
    public ordreLignesService: OrdreLignesService,
    public campagnesService: CampagnesService,
    public currentCompanyService: CurrentCompanyService,
    private stocksService: StocksService,
    public authService: AuthService,
    private stockConsolideService: StockConsolideService,
    public gridsService: GridsService
  ) {
    self = this;
    this.gridRowsTotal = 0;
    this.apiService = this.articlesService;
    this.especes = this.stocksService.getDistinctEntityDatasource(
      "article.cahierDesCharge.espece.id"
    );
    this.trueFalse = ["Tous", "Oui", "Non"];

    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      ["societes", "contains", this.currentCompanyService.getCompany().id],
    ]);
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
    this.gridTitle = this.localizeService.localize(
      "articles-catalogue-preFilter-stock-title"
    );
    this.onFieldValueChange(null, "espece"); // First run: setting filters values
    // setTimeout(() => this.refreshArticlesGrid(), 500) // A VIRER !!!!
    // this.refreshArticlesGrid() // A VIRER !!!!
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
        }
      ];
      dataToLoad
        .filter((data) => !this[`${data.var}SB`].value)
        .forEach((data) => {
          // if (data.var === "emballages")
          //   sbFilters += ` and article.emballage.emballage.groupe.id == ${this.groupesSB.value?.key}`;
          this[data.var] = this.stocksService.getDistinctEntityDatasource(
            data.id,
            data.desc,
            sbFilters
          );
        });
    }
  }

  onSecteurChanged(e) {
    // We check that this change is coming from the user
    if (!e.event) return;
    this.clientsSB.value = null;
    if (!e.value?.id) {
      this.clients = null;
    } else {
      this.clients = this.clientsService.getDataSource_v2([
        "id",
        "code",
        "raisonSocial",
        "valide",
      ]);
      const filter: any = [
        ["secteur.id", "=", e.value?.id],
        "and",
        ["societe.id", "=", this.currentCompanyService.getCompany().id],
        "and",
        ["valide", "=", true]
      ];
      this.clients.filter(filter);
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
    // const message = (this.secteursSB.value?.id || this.clientsSB.value?.id) ? this.localizeService.localize("data-loading-process") : "";
    this.datagrid.instance.beginCustomLoading("");
    this.stocksService
      .allStockArticleList(
        this.inheritedFields,
        this.especeSB.value?.node?.key ?? this.especeSB.value?.key,
        this.varietesSB.value?.key,
        this.originesSB.value?.key,
        this.modesCultureSB.value?.key,
        this.emballagesSB.value?.key,
        this.bureauxAchatSB.value?.key
      )
      .subscribe((res) => {
        if (this.createAdditFilter(res) !== true) this.endDSLoading(res.data.allStockArticleList);
      });
  }

  endDSLoading(data) {
    this.datagrid.dataSource = data;
    this.datagrid.instance.refresh();
    this.datagrid.instance.endCustomLoading();
    this.calculate = false;
  }

  createAdditFilter(res) {
    const secteur = this.secteursSB.value?.id;
    const client = this.clientsSB.value?.id;
    const rawResults = res;

    if (!client && !secteur) return;

    this.datagrid.instance
      .beginCustomLoading(
        `${this.localizeService.localize("analysis")}
         ${this.localizeService.localize("tiers-clients-secteur").toLowerCase()}
        / ${this.localizeService.localize("tiers-client").toLowerCase()}…`
      );

    const campagneEnCours = this.currentCompanyService.getCompany().campagne?.id;
    this.campagnesService
      .getOne_v2((parseInt(campagneEnCours) - 1).toString(), new Set(["id"]))
      .subscribe(res => {
        // Search previous campaing & Filter/load all results
        let rawFilter = `(ordre.campagne.id=='${res.data.campagne.id}' or ordre.campagne.id=='${campagneEnCours}')`;
        rawFilter += ` and ordre.societe.id=='${this.currentCompanyService.getCompany().id}'`
        if (secteur) rawFilter += ` and ordre.secteurCommercial.id=='${secteur}'`;
        if (client) rawFilter += ` and ordre.client.id=='${client}'`;

        this.ordreLignesService.getDistinctEntityDatasource(
          "article.id",
          undefined,
          rawFilter
        ).subscribe(res => res.store().load().then((data: LoadResult<any>) => {
          // Compare with stock results and keep the ones the sector/client sold
          this.endDSLoading(rawResults.data.allStockArticleList.filter(r => data.map(d => d.node.key).includes(r.articleID)));
        }));
      });

    return true;

  }

  openFilePopup(data) {
    this.articleLigneId = data.collapsedItems
      ? data.collapsedItems[0]?.articleID
      : data.items[0]?.articleID;
    if (this.articleLigneId) this.zoomArticlePopup.visible = true;
  }

  openClientsPopup(data) {
    this.articleLigneId = data.collapsedItems
      ? data.collapsedItems[0]?.articleID
      : data.items[0]?.articleID;

    this.articlesService
      .getOne_v2(
        this.articleLigneId,
        new Set([
          "id",
          "description",
          "referencesClient.client.code",
          "referencesClient.client.secteur.id",
          "referencesClient.client.raisonSocial",
          "referencesClient.client.ville",
          "matierePremiere.variete.description",
          "matierePremiere.origine.description",
          "cahierDesCharge.categorie.description",
          "cahierDesCharge.coloration.description",
          "cahierDesCharge.sucre.description",
          "cahierDesCharge.penetro.description",
          "cahierDesCharge.cirage.description",
          "cahierDesCharge.rangement.description",
          "emballage.emballage.descriptionTechnique",
          "emballage.emballage.idSymbolique",
          "emballage.conditionSpecial.description",
          "emballage.alveole.description",
          "normalisation.etiquetteEvenementielle.description",
          "normalisation.etiquetteColis.description",
          "normalisation.etiquetteUc.description",
          "normalisation.gtinUc",
          "normalisation.gtinColis",
          "normalisation.produitMdd",
          "normalisation.articleClient",
          "normalisation.calibreMarquage.description",
          "normalisation.stickeur.description",
          "gtinUcBlueWhale",
          "gtinColisBlueWhale",
          "instructionStation",
        ])
      )
      .subscribe((res) => {
        this.article = res.data.article;
        if (!res.data.article.referencesClient?.length) {
          notify(
            this.localizeService.localize("no-client-ref-article"),
            "warning",
            4500
          );
        } else {
          this.clientsRefPopup.visible = true;
        }
      });
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

  openRecapPopup(data) {
    let info = data.items ?? data.collapsedItems;
    info = info[0];
    if (!info?.articleID) return;
    this.ligneStockArticle = info;
    this.articlesService.getOne(info.articleID).subscribe((res) => {
      this.article = res.data.article;
      this.recapPopup.visible = true;
    });
  }

  ajoutReservation() {
    this.selectChange.emit();
    this.datagrid.dataSource = [];
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

  onContentReady(e) {
    this.gridRowsTotal = this.datagrid.instance.getVisibleRows()?.length;
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
        const data = e.data.items ?? e.data.collapsedItems;
        if (data[0].origineID && data[0].origineID != "F") {
          e.cellElement.classList.add("not-france-origin");
        } else if (data[0].bio) e.cellElement.classList.add("bio-article");
      }
    } else if (e.rowType === "data") {
      if (e.column.dataField === "stock.quantiteTotale")
        e.cellElement.classList.add("grey-light");
      if (["quantiteHebdomadaire", "prevision3j", "prevision7j"].includes(e.column.dataField))
        e.cellElement.textContent = "";

    }

    if (["data", "group"].includes(e.rowType) && e.column.dataField) {

      // Soulignage des quantités réservées
      if (e.column.dataField.indexOf("quantiteCalculee") === 0) {
        const index = e.column.dataField[e.column.dataField.length - 1];
        let data = e.data;
        let underline = false;
        if (e.rowType === "group") {
          data = data.items ?? data.collapsedItems;
          data.map(d => {
            if (d["quantiteReservee" + index] > 0) underline = true;
          });
        } else {
          if (data["quantiteReservee" + index] > 0) underline = true;
        }
        if (underline) e.cellElement.classList.add("underlined-text");
      }

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
        if (
          e.column.dataField.indexOf("quantiteCalculee") === 0 ||
          (["prevision3j", "prevision7j"].includes(e.column.dataField) && e.rowType === "group")
        ) {
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

  refreshPrevStock() {
    this.calculate = true;
    this.datagrid.instance.beginCustomLoading(this.localizeService.localize("calculate-prev"));
    this.stocksService.refreshStockHebdo().subscribe(() => {
      this.refreshArticlesGrid();
    });
  }

  public calculateCustomSummary(options) {
    if (self.customSummaryFields.includes(options.name)) {
      if (options.summaryProcess === "calculate") {
        options.totalValue = options.value;
        options.value = null;
      }
    }
  }

}
