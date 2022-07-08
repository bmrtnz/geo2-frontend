import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ColumnsSettings } from "app/shared/components/entity-cell-template/entity-cell-template.component";
import { Fournisseur } from "app/shared/models";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import Ordre from "app/shared/models/ordre.model";
import { FournisseursService, LocalizationService } from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { CertificationsModesCultureService } from "app/shared/services/api/certifications-modes-culture.service";
import { CodesPromoService } from "app/shared/services/api/codes-promo.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { TypesPaletteService } from "app/shared/services/api/types-palette.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { Change, GridColumn, OnSavingEvent } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import dxDataGrid from "devextreme/ui/data_grid";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { Observable, of } from "rxjs";
import { concatMap, filter, first, map, tap } from "rxjs/operators";
import { ArticleCertificationPopupComponent } from "../article-certification-popup/article-certification-popup.component";
import { ArticleOriginePopupComponent } from "../article-origine-popup/article-origine-popup.component";
import { GridsService } from "../grids.service";
import { ZoomArticlePopupComponent } from "../zoom-article-popup/zoom-article-popup.component";
import { ZoomFournisseurPopupComponent } from "../zoom-fournisseur-popup/zoom-fournisseur-popup.component";

@Component({
  selector: "app-grid-commandes",
  templateUrl: "./grid-commandes.component.html",
  styleUrls: ["./grid-commandes.component.scss"]
})
export class GridCommandesComponent implements OnInit, OnChanges, AfterViewInit {

  constructor(
    public injector: Injector,
    private gridConfigurator: GridConfiguratorService,
    private ordresService: OrdresService,
    private ordreLignesService: OrdreLignesService,
    private route: ActivatedRoute,
    private currentCompanyService: CurrentCompanyService,
    private fournisseursService: FournisseursService,
    private basesTarifService: BasesTarifService,
    private codesPromoService: CodesPromoService,
    private formUtilsService: FormUtilsService,
    private typesPaletteService: TypesPaletteService,
    public localizeService: LocalizationService,
    private gridsService: GridsService,
  ) {
    const fournisseursDataSource = this.fournisseursService
      .getDataSource_v2(["id", "code", "raisonSocial"]);
    fournisseursDataSource.filter(["valide", "=", true]);
    const proprietairesDataSource = this.fournisseursService
      .getDataSource_v2(["id", "code", "raisonSocial"]);
    proprietairesDataSource.filter(["valide", "=", true]);
    const sharedBaseTarifDatasource = this.basesTarifService
      .getDataSource_v2(["id", "description"]);
    const sharedTypePaletteDatasource = this.typesPaletteService
      .getDataSource_v2(["id", "description"]);
    this.columnsSettings = {
      "proprietaireMarchandise.id": {
        dataSource: proprietairesDataSource,
        displayExpression: "code",
      },
      "fournisseur.id": {
        dataSource: fournisseursDataSource,
        displayExpression: "code",
      },
      "venteUnite.id": {
        dataSource: sharedBaseTarifDatasource,
        displayExpression: "description",
      },
      "codePromo.id": {
        dataSource: this.codesPromoService
          .getDataSource_v2(["id", "description"]),
        displayExpression: "description",
      },
      "achatUnite.id": {
        dataSource: sharedBaseTarifDatasource,
        displayExpression: "description",
      },
      "typePalette.id": {
        dataSource: sharedTypePaletteDatasource,
        displayExpression: "description",
      },
      "paletteInter.id": {
        dataSource: sharedTypePaletteDatasource,
        displayExpression: "description",
      },
      "fraisUnite.id": {
        dataSource: sharedBaseTarifDatasource,
        displayExpression: "description",
      },
    };
    this.constructorFeatures();
  }

  public readonly FEATURE = {
    margePrevisionelle: true,
    columnCertifications: true,
    columnOrigine: true,
    highlightBio: true,
    rowOrdering: true,
    quickSwitch: true,
    reportDLUO: true,
    zoom: true,
  };

  public readonly gridID = Grid.LignesCommandes;
  public columns: Observable<GridColumn[]>;
  public allowMutations = false;
  public changes: Change<Partial<OrdreLigne>>[] = [];
  public columnsSettings: ColumnsSettings;

  @Input() ordreID: string;
  @ViewChild(DxDataGridComponent) grid: DxDataGridComponent;

  // legacy features properties
  public certifsMD: any;
  public certifMDDS: DataSource;
  public ordre: Partial<Ordre>;
  public certificationText: string;
  public originText: string;
  public lastRowFocused: boolean;
  public gridRowsTotal: number;
  public currentfocusedRow: number;
  public currNumero: string;
  public switchNumero: string;
  public newArticles = 0;
  public nbInsertedArticles: number;
  public newNumero = 0;
  public hintDblClick: string;

  @Output() public ordreLigne: OrdreLigne;
  @Output() swapRowArticle = new EventEmitter();
  @Output() public articleLigneId: string;
  @Output() public fournisseurLigneId: string;
  @Output() public fournisseurCode: string;
  @ViewChild(ArticleCertificationPopupComponent) articleCertificationPopup: ArticleCertificationPopupComponent;
  @ViewChild(ArticleOriginePopupComponent) articleOriginePopup: ArticleOriginePopupComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false }) zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild(ZoomFournisseurPopupComponent, { static: false }) zoomFournisseurPopup: ZoomFournisseurPopupComponent;

  public gridConfigHandler = event =>
    this.gridConfigurator.init(this.gridID, {
      ...event,
      title: "Lignes de commande",
      onColumnsChange: this.onColumnsConfigurationChange.bind(this),
      toolbarItems: [{
        location: "after",
        widget: "dxButton",
        options: {
          icon: "sorted",
          hint: "Renuméroter les lignes",
          onClick: () => {
            this.reindexing();
            this.grid.instance.saveEditData();
          },
        },
      }],
    })

  ngOnInit(): void {
    this.route.paramMap
      .pipe(filter(params => params.has("ordre_id")))
      .subscribe({
        next: params => {
          this.ordreID = params.get("ordre_id");
          this.updateRestrictions();
        },
      });
    this.columns = this.gridConfigurator.fetchColumns(this.gridID);
    this.hintDblClick = this.localizeService.localize("hint-dblClick-file");

    if (this.FEATURE.columnCertifications) this.initFeatures();
  }

  ngOnChanges() {
    if (this.ordreID) this.updateRestrictions();
  }

  ngAfterViewInit() {
    this.gridsService.register("Commande", this.grid);
  }

  displaySummaryFormat(data) {
    if (!data?.value) return;
    return data.value + " ligne" + (data.value > 1 ? "s" : "");
  }

  focusedCellChanging(e) {
    if (e.isHighlighted && e.prevColumnIndex !== e.newColumnIndex)
      setTimeout(() => this.grid.instance.saveEditData());
  }

  onSaving(event: OnSavingEvent) {

    if (event.component.hasEditData()) {

      event.cancel = true;
      return this.handleMutations();

    }
  }

  public onContentReady(event) {
    if (this.FEATURE.rowOrdering) this.handleNewArticles();
    this.gridRowsTotal = this.grid.instance.getVisibleRows()?.length;
  }

  // Reload grid data after external update
  public async update() {
    await (this.grid.dataSource as DataSource).reload();
    this.reindexing();
    this.grid.instance.saveEditData();
  }

  public calultateSortValue(event) {
    if (!event.numero) return Infinity;
    return parseFloat(event.numero);
  }

  private onColumnsConfigurationChange({ current }: { current: GridColumn[] }) {
    this.refreshData(current);
  }

  private handleMutations() {
    if (!this.changes.length) return;

    const source = this.grid.dataSource as DataSource;
    const store = source.store() as CustomStore;
    const change = this.changes.shift();

    if (change.type === "remove") {
      return store.remove(change.key)
        .then(() => {
          store.push([change]);
          this.gridsService.reload("SyntheseExpeditions", "DetailExpeditions");
          return this.handleMutations();
        });
    }

    if (change.type === "update")
      return new Promise((rsv, rjt) => {

        /* tslint:disable-next-line:prefer-const */
        let [name, value] = Object.entries(change.data)[0];

        // update "fournisseur" field when "proprietaire" value changed
        if (name === "proprietaireMarchandise") {
          const fournisseur = this.updateFilterFournisseurDS(change.data.proprietaireMarchandise);
          this.grid.instance.cellValue(
            this.grid.instance.getRowIndexByKey(change.key),
            "fournisseur",
            fournisseur,
          );
          this.changes.push({
            key: change.key,
            type: "update",
            data: { fournisseur: { id: fournisseur.id } } as Partial<OrdreLigne>,
          });
        }

        // map object value
        if (typeof value === "object")
          value = value.id;

        // request mutation
        this.columns
          .pipe(
            GridConfiguratorService.getVisible(),
            GridConfiguratorService.getFields(),
            concatMap(fields => this.ordreLignesService.updateField(
              name,
              value,
              change.key,
              this.currentCompanyService.getCompany().id,
              ["id", ...fields],
            )),
            first(),
          )
          .subscribe({

            // build and push response data
            next: ({ data }) => {
              if (data.updateField)
                store.push([change, {
                  key: data.updateField.id,
                  type: "update",
                  data: data.updateField,
                }]);
            },

            // reject on error
            error: err => {
              notify(err.message, "error", 5000);
              rjt(err);
            },

            complete: () => {
              rsv();
              if (name === "fournisseur")
                this.gridsService.reload("SyntheseExpeditions", "DetailExpeditions");
              this.handleMutations();
            },
          });
      });

    return Promise.resolve();

  }

  private refreshData(columns: GridColumn[]) {
    if (this.ordreID)
      of(columns)
        .pipe(
          GridConfiguratorService.getVisible(),
          GridConfiguratorService.getFields(),
          map(fields => this.ordreLignesService.getListDataSource([
            OrdreLigne.getKeyField() as string,
            // grid config + visible
            ...fields,

            // display expressions
            ...Object
              .entries(this.columnsSettings)
              .map(([keyField, column]) => {
                const members = keyField.split(".");
                members.splice(-1, 1, column.displayExpression);
                return members.join(".");
              }),

            // extra features
            ...this.FEATURE.columnCertifications ? ["listeCertifications"] : [],
            ...this.FEATURE.columnOrigine ? [
              "article.matierePremiere.origine.id",
              "origineCertification",
            ] : [],
            ...this.FEATURE.highlightBio ? [
              "article.matierePremiere.modeCulture.description",
              "article.articleDescription.bio"
            ] : [],
            ...this.FEATURE.zoom ? [
              "article.id",
              "proprietaireMarchandise.code",
              "fournisseur.code",
            ] : [],
            // Used to lock fields
            ...[
              "ordre.type.id",
              "ordre.societe.id",
              "ordre.venteACommission",
              "ordre.entrepot.modeLivraison",
              "ordre.commentaireUsageInterne",
              "indicateurPalette",
              "logistique.expedieStation",
              "ordre.ordreEDI.id",
              "ordre.secteurCommercial.id",
              "ordre.bonAFacturer",
              "ordre.societe.id"
            ]
          ])),
          tap(datasource => datasource.filter([
            ["ordre.id", "=", this.ordreID],
            "and",
            ["valide", "=", true],
            "and",
            ["article.id", "isnotnull", "null"],
          ])),
        )
        .subscribe(datasource => {
          this.grid.dataSource = datasource;
        });
  }

  private async updateRestrictions() {
    const isCloture = await this.ordresService.isCloture({ id: this.ordreID });
    this.allowMutations = !environment.production && !isCloture;
  }

  /**
   * Recalculate rows numero and push changes
   */
  private reindexing() {
    const datasource = this.grid.dataSource as DataSource;
    if (!datasource) return;
    notify(this.localizeService.localize("renumerotation-lignes-ordre"), "info", 3000);
    (datasource.items() as Partial<OrdreLigne>[])
      .sort((a, b) => parseInt(a.numero, 10) - parseInt(b.numero, 10))
      .forEach((item, index) => {
        const numero = (index + 1).toString().padStart(2, "0");
        if (item.numero !== numero)
          this.changes.push({
            key: item.id,
            type: "update",
            data: { numero },
          });
      });
  }

  // OLD codebase beyond this point (grid-lignes.component)

  private updateFilterFournisseurDS(proprietaireMarchandise?: Partial<Fournisseur>) {

    let fournisseur: Partial<Fournisseur>;
    const filters = [];

    if (
      this.currentCompanyService.getCompany().id !== "BUK"
      || proprietaireMarchandise?.code.substring(0, 2) !== "BW"
    ) {
      const listExp = proprietaireMarchandise?.listeExpediteurs;
      console.log(listExp);
      if (listExp) {
        listExp.split(",").map(exp => {
          filters.push(["code", "=", exp], "or");
          // Automatically selected when included in the list
          if (exp === proprietaireMarchandise.code) {
            fournisseur = proprietaireMarchandise;
          }
        });
        filters.pop();
      } else {
        fournisseur = proprietaireMarchandise;
        if (proprietaireMarchandise.id !== null)
          filters.push(["id", "=", proprietaireMarchandise.id]);
      }
    }
    this.columnsSettings["fournisseur.id"].dataSource.filter(filters);
    return fournisseur;

  }

  // legacy features methods

  constructorFeatures() {
    this.certificationText = this.injector
      .get(LocalizationService)
      .localize("btn-certification");
    this.originText = this.injector
      .get(LocalizationService)
      .localize("btn-origine");
  }

  initFeatures() {
    this.certifMDDS = this.injector
      .get(CertificationsModesCultureService)
      .getDataSource_v2(["id", "description", "type"], 100);
    this.certifMDDS.filter(["type", "=", "CERTIF"]);
    this.certifMDDS.load().then(res => {
      this.certifsMD = res; // Store certifications Mode culture
    });
  }

  showCertificationCheck(data) {
    let isCert = false;
    if (data.listeCertifications) { // Already recorded
      this.certifsMD?.map(certType => {
        if (data.listeCertifications?.split(",").includes(certType.id.toString()))
          isCert = true;
      });
    } else { // Default certifications from customer file
      isCert = this.ordre?.client?.certifications?.length > 0;
    }
    return this.certificationText + (isCert ? " ✓" : "");
  }

  openCertificationPopup(ligne) {
    this.ordreLigne = ligne;
    this.articleCertificationPopup.visible = true;
  }

  showOriginButton(cell) {
    return cell.data.article.matierePremiere.origine.id === "F";
  }

  showOriginCheck(data) {
    return this.originText + (data.origineCertification ? " ✓" : "");
  }

  openOriginePopup(ligne) {
    this.ordreLigne = ligne;
    this.articleOriginePopup.visible = true;
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      if ([
        "article.articleDescription.descriptionReferenceLongue",
        "article.articleDescription.descriptionReferenceCourte"]
        .includes(e.column?.dataField)) {
        e.cellElement.title = e.value + "\r\n" + this.hintDblClick;
        // Bio en vert
        e.cellElement.classList.add("cursor-pointer");
        if (e.data.article.articleDescription.bio) e.cellElement.classList.add("bio-article");
      }
      // Taux encombrement
      if (e.column.dataField === "nombrePalettesCommandees") {
        let tauxEncombrement;
        if (e.data.nombreColisPalette && e.data.nombreColisCommandes) {
          tauxEncombrement = e.data.nombreColisCommandes / e.data.nombreColisPalette;
          tauxEncombrement /= (e.data.nombrePalettesIntermediaires ? e.data.nombrePalettesIntermediaires + 1 : 1);
          e.cellElement.title = tauxEncombrement + "\r\n(Taux encombrement au sol)";
        }
      }
      // Tooltip prix achat
      if (e.column.dataField === "achatDevisePrixUnitaire") {
        if (e.data.achatDeviseTaux) e.cellElement.title = `Taux : ${e.data.achatDeviseTaux}\r\nP.U. : ${e.data.achatPrixUnitaire}`;
      }
    }
  }

  onDataChanged(data: Partial<OrdreLigne>) {
    const ds = this.grid.dataSource as DataSource;
    const store = ds.store() as CustomStore;
    store.push([{ key: data.id, type: "update", data }]);
  }

  onFocusedRowChanged(e) {
    // this.gridRowsTotal = this.grid.instance.getVisibleRows().length;
    this.currentfocusedRow = e.row?.rowIndex;
    this.lastRowFocused = (this.currentfocusedRow === (this.gridRowsTotal - 1));
  }

  onReorder(e: {
    component: dxDataGrid,
    itemData: Partial<OrdreLigne>, // dragged item
    fromIndex: number,
    toIndex: number,
  }) {
    // set moved row
    e.component.cellValue(e.fromIndex, "numero", OrdreLigne.formatNumero(e.toIndex + 1));

    // set offseted rows
    const offset = Math.sign(e.fromIndex - e.toIndex);
    const range = new Array(Math.abs(e.toIndex - e.fromIndex))
      .fill(null)
      .map((_, index) => [
        index + Math.min(e.fromIndex, e.toIndex) + (offset > 0 ? 0 : 1),
        index + Math.min(e.fromIndex, e.toIndex) + (offset > 0 ? 2 : 1),
      ]);
    range
      .forEach(([index, value]) => {
        e.component.cellValue(index, "numero", OrdreLigne.formatNumero(value));
      });

    e.component.saveEditData();
  }

  handleNewArticles() {
    // Grid is loaded with new articles: save order row numbers
    if (this.newArticles === this.nbInsertedArticles) {
      let info = this.nbInsertedArticles + " ";
      info += " " + this.injector.get(LocalizationService).localize("article-ajoutes");
      info = info.split("&&").join(this.nbInsertedArticles > 1 ? "s" : "");
      notify(info, "success", 3000);
      this.injector.get(GridUtilsService).resetGridScrollBar(this.grid);
      this.newArticles = 0;
      this.newNumero = 0;
      this.nbInsertedArticles = null;
      this.grid.instance.option("focusedRowIndex", this.gridRowsTotal); // Focus on 1st added item
      this.grid.instance.saveEditData();
    }
  }

  onEditorPrepared(e) {
    // Define new order rows numbers
    if (e.dataField === "numero" && this.newArticles < this.nbInsertedArticles) {
      if (e.value === null) {
        this.newNumero++;
        const newNumero = this.createStringNumero(this.newNumero);
        e.component.cellValue(e.row.rowIndex, "numero", newNumero);
        this.newArticles++;
      } else {
        this.newNumero = parseInt(e.value, 10);
      }
    }
  }

  onEditingStart(e) {
    console.log(e);
    if (!e.column || !e.data.numero || !this.gridRowsTotal) return;
    this.ordreLignesService.lockFields(e);
  }


  // onEditorPreparing(e) {
  //   if (e.parentType === "dataRow") {
  //     e.editorOptions.onFocusIn = (elem) => {
  // this.formUtilsService.selectTextOnFocusIn(elem);
  //     };
  //   }
  // }

  // onFocusedCellChanged(e) {
  //   if (e.allowEditing === false) return;
  //   const editingEl = e.component.getCellElement(e.rowIndex, e.column.dataField);
  //   if (editingEl) setTimeout(() => this.grid.instance.focus(editingEl), 10);
  // }

  createStringNumero(num) {
    return ("0" + num.toString()).slice(-2);
  }

  swapArticle(cell) {
    this.swapRowArticle.emit(cell.id);
  }

  copyPaste(e, field) {
    e.event.stopImmediatePropagation();
    let refValue;
    const rows = this.grid.instance.getVisibleRows();
    if (rows?.length < 2) return;
    rows.map((res, index) => {
      if (!index) {
        refValue = res.data.libelleDLV;
      } else {
        this.grid.instance.cellValue(res.rowIndex, field, refValue);
      }
    });
    setTimeout(() => this.grid.instance.saveEditData());
    notify("Report DLUO effectué", "success", 3000);
  }

  openFilePopup(e) {
    if ([
      "article.articleDescription.descriptionReferenceLongue",
      "article.articleDescription.descriptionReferenceCourte"]
      .includes(e.column?.dataField)) {
      this.articleLigneId = e.data.article.id;
      this.zoomArticlePopup.visible = true;
    }
    if (["fournisseur.id", "proprietaireMarchandise.id"].includes(e.column?.dataField)) {
      const { id: idFour, code } = e.data[e.column.dataField.split(".")[0]];
      if (idFour === null) return;
      this.fournisseurLigneId = idFour;
      this.fournisseurCode = code;
      this.zoomFournisseurPopup.visible = true;
    }
  }

}
