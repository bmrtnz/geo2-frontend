import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import Ordre from "app/shared/models/ordre.model";
import { ArticlesService, AuthService, FournisseursService } from "app/shared/services";
import { SummaryInput, SummaryType } from "app/shared/services/api.service";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { CertificationsModesCultureService } from "app/shared/services/api/certifications-modes-culture.service";
import { CodesPromoService } from "app/shared/services/api/codes-promo.service";
import { DefCodesPromoService } from "app/shared/services/api/def-codes-promo.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { TypesPaletteService } from "app/shared/services/api/types-palette.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { Change, GridColumn, TotalItem } from "basic";
import CustomStore from "devextreme/data/custom_store";
import { DxDataGridComponent, DxLoadIndicatorComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import dxDataGrid from "devextreme/ui/data_grid";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable, PartialObserver } from "rxjs";
import { concatMapTo, first, map, tap } from "rxjs/operators";
import { ArticleCertificationPopupComponent } from "../article-certification-popup/article-certification-popup.component";
import { ArticleOriginePopupComponent } from "../article-origine-popup/article-origine-popup.component";
import { GridLogistiquesComponent } from "../grid-logistiques/grid-logistiques.component";
import { GridOrdreLigneLogistiqueComponent } from "../grid-ordre-ligne-logistique/grid-ordre-ligne-logistique.component";
import { ZoomArticlePopupComponent } from "../zoom-article-popup/zoom-article-popup.component";
import { ZoomFournisseurPopupComponent } from "../zoom-fournisseur-popup/zoom-fournisseur-popup.component";

@Component({
  selector: "app-grid-lignes",
  templateUrl: "./grid-lignes.component.html",
  styleUrls: ["./grid-lignes.component.scss"]
})
export class GridLignesComponent implements OnChanges, OnInit {

  @Input() public ordre: Ordre;
  @Input() public gridLignesLogistique: GridOrdreLigneLogistiqueComponent;
  @Input() public gridLogistiques: GridLogistiquesComponent;
  @Input() public fournisseurLigneCode: string;
  @Output() public articleLigneId: string;
  @Output() public ordreLigne: OrdreLigne;
  @Output() public fournisseurLigneId: string;
  @Output() public fournisseurCode: string;
  @Output() refreshGridLigneDetail = new EventEmitter();
  @Output() swapRowArticle = new EventEmitter();

  public certifMDDS: DataSource;
  public dataSource: DataSource;
  public proprietaireMarchandiseSource: DataSource;
  public fournisseurSource: DataSource;
  public achatUniteSource: DataSource;
  public fraisUniteSource: DataSource;
  public venteUniteSource: DataSource;
  public typePaletteSource: DataSource;
  public paletteInterSource: DataSource;
  public codePromoSource: DataSource;
  public defCodePromoSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public totalItems: TotalItem[] = [];
  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false }) zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild(ArticleOriginePopupComponent, { static: false }) articleOriginePopup: ArticleOriginePopupComponent;
  @ViewChild(ArticleCertificationPopupComponent, { static: false }) articleCertificationPopup: ArticleCertificationPopupComponent;
  @ViewChild(ZoomFournisseurPopupComponent, { static: false }) zoomFournisseurPopup: ZoomFournisseurPopupComponent;
  @ViewChild("smallMarginLoader", { static: false }) smallMarginLoader: DxLoadIndicatorComponent;

  private gridConfig: Promise<GridConfig>;
  public allowMutations = false;
  public currentfocusedRow: number;
  public gridRowsTotal: number;
  public lastRowFocused: boolean;
  public currNumero: string;
  public switchNumero: string;
  public itemsWithSelectBox: string[];
  public noCodeBeforeSelectBox: string[];
  public CodeBeforeInSelectBox: string[];
  public env = environment;
  public nbInsertedArticles: number;
  public newArticles: number;
  public newNumero: number;
  public hintDblClick: string;
  public certifsMD: any;
  public certificationText: string;
  public originText: string;
  public SelectBoxPopupWidth: number;
  public dataField: string;
  public idLigne: string;
  private gridFields: any[];
  public changes: Change<Partial<OrdreLigne>>[] = [];
  public marginText: string;
  public marginBtnVisible = false;

  constructor(
    public ordreLignesService: OrdreLignesService,
    public articlesService: ArticlesService,
    public gridConfiguratorService: GridConfiguratorService,
    public proprietaireMarchandiseService: FournisseursService,
    public fournisseurService: FournisseursService,
    public achatUniteService: BasesTarifService,
    public venteUniteService: BasesTarifService,
    public fraisUniteService: BasesTarifService,
    public codePromoService: CodesPromoService,
    public defCodePromoService: DefCodesPromoService,
    public currentCompanyService: CurrentCompanyService,
    public typePaletteService: TypesPaletteService,
    public paletteInterService: TypesPaletteService,
    public certificationsModesCultureService: CertificationsModesCultureService,
    public authService: AuthService,
    public formUtilsService: FormUtilsService,
    public gridUtilsService: GridUtilsService,
    public functionsService: FunctionsService,
    public localizeService: LocalizationService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreLigne);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    this.moveRowUpDown = this.moveRowUpDown.bind(this);
    this.itemsWithSelectBox = [
      "fournisseur",
      "achatUnite",
      "venteUnite",
      "fraisUnite",
      "typePalette",
      "paletteInter",
      "proprietaireMarchandise",
      "codePromo"
    ];
    this.noCodeBeforeSelectBox = [
      "codePromo"
    ];
    this.newArticles = 0;
    this.newNumero = 0;
    this.hintDblClick = this.localizeService.localize("hint-dblClick-file");
    this.certificationText = this.localizeService.localize("btn-certification");
    this.originText = this.localizeService.localize("btn-origine");
  }

  async ngOnInit() {

    const fields = this.columns.pipe(map(columns => columns.map(column => {
      return (this.addKeyToField(column.dataField));
    })));
    this.gridFields = await fields.toPromise();
    this.dataSource = this.ordreLignesService.getDataSource_v2(this.gridFields);
    this.filterFournisseurDS();
    this.filterProprietaireDS([["valide", "=", true], "and", ["natureStation", "<>", "F"]]);
    this.achatUniteSource = this.achatUniteService.getDataSource_v2(["id", "description"]);
    this.achatUniteSource.filter([
      ["valide", "=", true],
      "and",
      ["valideLig", "=", true]
    ]);
    this.fraisUniteSource = this.achatUniteSource;
    this.venteUniteSource = this.achatUniteSource;
    this.typePaletteSource = this.typePaletteService.getDataSource_v2(["id", "description"]);
    this.typePaletteSource.filter([
      ["valide", "=", true],
    ]);
    this.paletteInterSource = this.typePaletteSource;

    this.certifMDDS = this.certificationsModesCultureService.getDataSource_v2(["id", "description", "type"], 100);
    this.certifMDDS.filter(["type", "=", "CERTIF"]);
    this.certifMDDS.load().then(res => {
      this.certifsMD = res; // Store certifications Mode culture
    });
    this.codePromoSource = this.codePromoService.getDataSource_v2(["id", "description"]);
  }

  ngOnChanges() {
    this.allowMutations = !this.env.production && !Ordre.isCloture(this.ordre);
    this.enableFilters();
  }

  filterFournisseurDS(filters?) {
    const myFilter: any[] = [["valide", "=", true]];
    if (filters?.length) myFilter.push("and", filters);
    this.fournisseurSource = this.fournisseurService.getDataSource_v2(["id", "code", "raisonSocial"]);
    this.fournisseurSource.filter(myFilter);
  }
  filterProprietaireDS(filters) {
    this.proprietaireMarchandiseSource = this.fournisseurService
      .getDataSource_v2(["id", "code", "raisonSocial", "listeExpediteurs"]);
    this.proprietaireMarchandiseSource.filter(filters);
  }
  filterDefCodesPromoDS(filters?) {
    this.SelectBoxPopupWidth = 0; // To avoid flash effect until fully updated
    const myFilter: any[] = [["valide", "=", true]];
    if (filters?.length) myFilter.push("and", filters);
    this.defCodePromoSource = this.defCodePromoService.getDataSource_v2(
      ["codePromo.id", "codePromo.description", "espece.id", "variete.id"]
    );
    this.defCodePromoSource.filter(myFilter);
    let filter = [];
    this.defCodePromoSource.load().then(res => {
      res.map(promo => filter.push(["id", "=", promo.codePromo.id], "or"));
      filter.pop();
      if (!filter.length) filter = ["id", "=", ""];
      this.codePromoSource = this.codePromoService.getDataSource_v2(["id", "description"]);
      this.codePromoSource.filter(filter);
      this.codePromoSource.load().then(() => this.SelectBoxPopupWidth = 180);
    });
  }

  refreshGrid() {
    this.datagrid.instance.refresh();
  }

  async enableFilters() {

    const summaryInputs: SummaryInput[] = [
      { selector: "nombrePalettesCommandees", summaryType: SummaryType.SUM },
      { selector: "nombreColisCommandes", summaryType: SummaryType.SUM }
    ];

    const columns = await this.columns.toPromise();
    const fields = columns.map(column => column.dataField).map(field => {
      return this.addKeyToField(field);
    });

    this.totalItems = summaryInputs
      .map(({ selector: column, summaryType }) => ({
        column,
        summaryType,
        displayFormat: "{0}",
        valueFormat: columns
          ?.find(({ dataField }) => dataField === column)
          ?.format,
      }));

    if (this?.ordre?.id) {
      this.dataSource = this.ordreLignesService
        .getDataSource_v2(this.gridFields);
      // .getSummarisedDatasource(SummaryOperation.Totaux, fields, summaryInputs);
      this.dataSource.filter([
        ["ordre.id", "=", this.ordre.id],
        "and",
        ["valide", "=", true],
        "and",
        ["article.id", "isnotnull", "null"]
      ]);
      this.datagrid.dataSource = this.dataSource;
    } else {
      this.datagrid.dataSource = null;
    }

  }

  addKeyToField(field) {
    if (this.itemsWithSelectBox.includes(field)) {
      field += `.${this[field + "Service"].model.getKeyField()}`;
    }
    return field;
  }

  onCellPrepared(e) {

    if (e.rowType === "totalFooter") {
      // Show order lines number
      const numberOfLines = this.datagrid.instance.getVisibleRows()?.length;
      if (numberOfLines) {
        if (e.column.dataField === "numero") {
          e.cellElement.textContent = numberOfLines;
          e.cellElement.classList.add("text-align-right");
        }
        if (e.columnIndex === 1) {
          e.cellElement.textContent = numberOfLines < 2 ?
            this.localizeService.localize("ligne") :
            this.localizeService.localize("lignes");
          e.cellElement.classList.add("order-line-text");
        }
        this.marginBtnVisible = true;
      }
    }

    if (e.rowType === "data") {
      // e.cellElement.find(".dx-select-checkbox").dxCheckBox("instance").option("disabled", true);
      if (e.column.dataField === "article.id") {
        // Descript. article
        const infoArt = this.articlesService.concatArtDescript(e.data.article);
        e.cellElement.innerText = infoArt.concatDesc;
        e.cellElement.title = infoArt.concatDesc.substring(2) + "\r\n"
          + this.hintDblClick;
        e.cellElement.classList.add("cursor-pointer");
        // Bio en vert
        if (infoArt.bio) e.cellElement.classList.add("bio-article");
      }
      // Title double-click to see specific file: doesn't work, find out why!
      if (["fournisseur", "proprietaireMarchandise"].includes(e.column?.dataField)) {
        if (e.value?.id) {
          e.cellElement.classList.add("cursor-pointer");
        }
      }
      if (e.column.dataField === "article.description") {
        // Descript. article
        const infoArt = this.articlesService.concatArtDescriptAbregee(e.data.article);
        e.cellElement.innerText = infoArt.concatDesc;
        e.cellElement.title = infoArt.concatDesc.substring(2) + "\r\n"
          + this.hintDblClick;
        e.cellElement.classList.add("cursor-pointer");
        // Bio en vert
        if (infoArt.bio) e.cellElement.classList.add("bio-article");
      }
      if (e.column.dataField === "nombrePalettesCommandees") {
        let tauxEncombrement;
        if (e.data.nombreColisPalette && e.data.nombreColisCommandes) {
          tauxEncombrement = e.data.nombreColisCommandes / e.data.nombreColisPalette;
          tauxEncombrement /= (e.data.nombrePalettesIntermediaires ? e.data.nombrePalettesIntermediaires + 1 : 1);
          e.cellElement.title = tauxEncombrement + "\r\n" + "(Taux encombrement au sol)";
        }
      }
    }
  }

  displayCodeBefore(data) {
    return data ?
      ((data.code ? data.code : data.id) + " - " + (data.nomUtilisateur ? data.nomUtilisateur :
        (data.raisonSocial ? data.raisonSocial : data.description)))
      : null;
  }

  defineTemplate(field) {

    let templ;
    if (this.itemsWithSelectBox.includes(field)) templ = "selectBoxEditTemplate";
    if (field === "article.matierePremiere.espece.id") templ = "origineTemplate";
    if (field === "ordre.client.id") templ = "certificationTemplate";
    if (field === "valide") templ = "swapButtonTemplate";
    return templ ? templ : false;
  }

  showOriginButton(cell) {
    return cell.data.article.matierePremiere.origine.id === "F";
  }

  showOriginCheck(data) {
    return this.originText + (data.origineCertification ? " ✓" : "");
  }

  swapArticle(cell) {
    this.swapRowArticle.emit(cell.id);
  }

  showCertificationCheck(data) {
    let isCert = false;
    if (data.listeCertifications) { // Already recorded
      this.certifsMD.map(certType => {
        if (data.listeCertifications?.split(",").includes(certType.id.toString())) isCert = true;
      });
    } else { // Default certifications from customer file
      isCert = this.ordre.client.certifications?.length > 0;
    }
    return this.certificationText + (isCert ? " ✓" : "");
  }

  onFocusedRowChanged(e) {
    this.gridRowsTotal = this.datagrid.instance.getVisibleRows().length;
    this.currentfocusedRow = e.row?.rowIndex;
    this.lastRowFocused = (this.currentfocusedRow === (this.gridRowsTotal - 1));
  }

  moveRowUpDown(e) {
    const moveDirection = e.element.classList.contains("up-move-button") ? -1 : 1;
    this.currNumero = this.datagrid.instance.getVisibleRows()[this.currentfocusedRow].data.numero;
    this.switchNumero = this.datagrid.instance.getVisibleRows()[this.currentfocusedRow + moveDirection].data.numero;
    this.datagrid.instance.cellValue(this.currentfocusedRow + moveDirection, "numero", this.currNumero);
    this.datagrid.instance.cellValue(this.currentfocusedRow, "numero", this.switchNumero);
    this.datagrid.instance.saveEditData();
  }

  onSelectBoxCellValueChanged(event, cell) {
    if (event.value.id === event.previousValue.id) return;
    if (cell.setValue) {
      cell.setValue(event.value);
      // this.cellValueChange(event);
      this.idLigne = cell.data.id;
      this.dataField = cell.column.dataField;
    }
  }

  onCellClick(e) {
    // Way to avoid Dx Selectbox list to appear when cell is readonly
    this.SelectBoxPopupWidth = e.cellElement.classList.contains("dx-datagrid-readonly") ? 0 : 400;

    switch (e.column.dataField) {
      case "fournisseur": this.updateFilterFournisseurDS(e.data.proprietaireMarchandise); break;
      // Different approach for checkboxes - Force edit mode
      case "gratuit": e.component.editCell(e.rowIndex, e.column.dataField); break;
      case "codePromo": {
        this.filterDefCodesPromoDS([
          ["variete.id", "=", e.data.article.matierePremiere.variete.id],
          "and",
          ["espece.id", "=", e.data.article.matierePremiere.espece.id],
        ]);
        break;
      }
    }

  }

  openFilePopup(e) {
    if (e.column?.dataField === "article.id") {
      this.articleLigneId = e.data.article.id;
      this.zoomArticlePopup.visible = true;
    }
    if (["fournisseur", "proprietaireMarchandise"].includes(e.column?.dataField)) {
      const idFour = e.data[e.column.dataField].id;
      if (idFour === null) return;
      this.fournisseurLigneId = idFour;
      this.fournisseurCode = e.data[e.column.dataField].code;
      this.zoomFournisseurPopup.visible = true;
    }
  }

  openOriginePopup(ligne) {
    this.ordreLigne = ligne;
    this.articleOriginePopup.visible = true;
  }

  openCertificationPopup(ligne) {
    this.ordreLigne = ligne;
    this.articleCertificationPopup.visible = true;
  }

  onEditingStart(e) {
    if (!e.column || !e.data.numero) return;
    this.ordreLignesService.lockFields(e);
  }

  createStringNumero(num) {
    return ("0" + num.toString()).slice(-2);
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

  onEditorPreparing(e) {
    // Saving cell main info
    if (e.parentType === "dataRow") {
      e.editorOptions.onFocusIn = (elem) => {
        this.dataField = e.dataField;
        this.idLigne = e.row?.data?.id;
        if (e.dataField !== "numero")
          this.formUtilsService.selectTextOnFocusIn(elem);
      };
    }
  }

  /**
   * Handle dynamic saving on cell change
   */
  onSaving(event: {
    cancel: boolean,
    changes: Array<any>,
    component: dxDataGrid,
    element: HTMLElement,
    promise: Promise<void>,
  }) {
    if (event.component.hasEditData()) {
      if (event?.changes[0]?.type !== "update") return;

      event.cancel = true;
      event.promise = new Promise((rsv, rjt) => {

        // resolve early so DX doesn't block cell change too long
        rsv();

        // push input cell changes
        (this.dataSource.store() as CustomStore).push(event.changes);
        /* tslint:disable-next-line:prefer-const */
        let [name, value]: [string, string | number | Record<string, any>] = Object
          .entries(event.changes[0].data)[0];
        this.changes = []; // clear changes, or DX won't let us pass

        // update "fournisseur" field when "proprietaire" value changed
        if (name === "proprietaireMarchandise") {
          const [id, code] = this.updateFilterFournisseurDS(event.changes[0].data.proprietaireMarchandise);
          event.component.cellValue(
            event.component.getRowIndexByKey(event.changes[0].key),
            "fournisseur",
            { id, code },
          );
          this.changes = [{
            ...event.changes[0],
            data: { fournisseur: { id } },
          }];
        }

        // map object value
        if (typeof value === "object")
          value = value.id;

        // request mutation
        this.ordreLignesService.updateField(
          name,
          value,
          event.changes[0].key,
          this.currentCompanyService.getCompany().id,
          this.gridFields,
        )
          .pipe(first())
          .subscribe({

            // build and push response data
            next: ({ data }) => {
              (this.dataSource.store() as CustomStore).push([{
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

            // optionnal chaining
            complete: () => {
              this.datagrid.instance.saveEditData();
            },
          });
      });
    }
  }

  onContentReady() {
    // Grid is loaded with new articles: save order row numbers
    if (this.newArticles === this.nbInsertedArticles) {
      let info = this.nbInsertedArticles + " ";
      info += " " + this.localizeService.localize("article-ajoutes");
      info = info.split("&&").join(this.nbInsertedArticles > 1 ? "s" : "");
      notify(info, "success", 3000);
      this.gridUtilsService.resetGridScrollBar(this.datagrid);
      this.newArticles = 0;
      this.newNumero = 0;
      this.nbInsertedArticles = null;
      this.datagrid.instance.option("focusedRowIndex", this.gridRowsTotal); // Focus on 1st added item
      this.datagrid.instance.saveEditData();
    }
  }

  updateFilterFournisseurDS(proprietaireMarchandise) {

    let newFourId = null;
    let newFourCode = null;
    const filters = [];

    if (this.currentCompanyService.getCompany().id !== "BUK" || proprietaireMarchandise?.code.substring(0, 2) !== "BW") {
      const listExp = proprietaireMarchandise?.listeExpediteurs;
      if (listExp) {
        listExp.split(",").map(exp => {
          filters.push(["code", "=", exp], "or");
          // Automatically selected when included in the list
          if (exp === proprietaireMarchandise.code) {
            newFourId = proprietaireMarchandise?.id;
            newFourCode = proprietaireMarchandise?.code;
          }
        });
        filters.pop();
      } else {
        newFourId = proprietaireMarchandise?.id;
        newFourCode = proprietaireMarchandise?.code;
        if (newFourId !== null) filters.push(["id", "=", newFourId]);
      }
    }
    this.filterFournisseurDS(filters);
    return [newFourId, newFourCode];

  }

  onRowRemoved() {
    // Refresh 2 other grids
    this.gridLignesLogistique.refresh();
    this.refreshGridLigneDetail.emit(true);
  }

  copyPaste(e, field) {
    e.event.stopImmediatePropagation();
    let refValue;
    const rows = this.datagrid.instance.getVisibleRows();
    if (rows?.length < 2) return;
    rows.map((res, index) => {
      if (!index) {
        refValue = res.data.libelleDLV;
      } else {
        this.datagrid.instance.cellValue(res.rowIndex, field, refValue);
      }
    });
    setTimeout(() => this.datagrid.instance.saveEditData());
    notify("Report DLUO effectué", "success", 3000);
  }

  private handleCellChangeEventResponse<T>(): PartialObserver<T> {
    return {
      next: v => {
        this.refreshGrid();
        this.refreshGridLigneDetail.emit(true);
      },
      error: (message: string) => {
        notify({ message }, "error", 7000);
        console.log(message);
      }
    };
  }

  calculMargePrev() {

    this.smallMarginLoader.visible = true;
    this.marginText = "";
    this.functionsService.fCalculMargePrevi(this.ordre.id, this.currentCompanyService.getCompany().id)
      .valueChanges
      .subscribe({
        next: res => {
          const margin = res.data.fCalculMargePrevi.data.result;
          this.smallMarginLoader.visible = false;
          if (margin !== null) this.marginText = ": " + margin + " %";
        },
        error: (message: string) => {
          this.smallMarginLoader.visible = false;
          notify({ message }, "error", 7000);
          console.log(message);
        }
      });
  }

  oldCellValueChange(data) {

    this.marginText = "";
    if (!data.changes) return;
    if (data.changes.some(c => c.type !== "update")) return;
    if (!this.dataField) return;

    const dataField = this.dataField;
    const idLigne = this.idLigne;
    console.log(dataField, "has been changed");

    switch (dataField) {

      case "nombrePalettesCommandees": {
        this.functionsService.onChangeCdeNbPal(idLigne, this.ordre.secteurCommercial.id)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
      // case "????": {
      //   this.functionsService.onChangeDemipalInd(idLigne, this.authService.currentUser.nomUtilisateur)
      //     .valueChanges.subscribe(this.handleCellChangeEventResponse());
      //   break;
      // }
      case "nombreColisPalette": {
        this.functionsService.onChangePalNbCol(idLigne, this.authService.currentUser.nomUtilisateur)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
      case "nombreColisCommandes": {
        this.functionsService.onChangeCdeNbCol(idLigne, this.authService.currentUser.nomUtilisateur)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
      case "proprietaireMarchandise": { // Adjust fournisseurs list & other stuff
        this.dataField = null;
        const proprietaireMarchandise = data.changes[0].data.data.saveOrdreLigne.proprietaireMarchandise;
        const [newFourId, newFourCode] = this.updateFilterFournisseurDS(proprietaireMarchandise);
        data.component.cellValue(data.component.getRowIndexByKey(data.changes[0].key),
          "fournisseur",
          { id: newFourId, code: newFourCode });
        setTimeout(() => {
          from(this.datagrid.instance.saveEditData())
            .pipe(
              concatMapTo(
                this.functionsService
                  .fVerifLogistiqueOrdre(this.ordre.id)
                  .valueChanges
              ),
              tap(res => {
                this.gridLignesLogistique.refresh();
                this.gridLogistiques.refresh();
              }),
            ).subscribe(this.handleCellChangeEventResponse());
        });
        this.functionsService
          .onChangeProprCode(idLigne, this.currentCompanyService.getCompany().id, this.authService.currentUser.nomUtilisateur)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
      case "fournisseur": {
        from(this.datagrid.instance.saveEditData())
          .pipe(
            concatMapTo(this.functionsService
              .fVerifLogistiqueOrdre(this.ordre.id)
              .valueChanges),
            concatMapTo(this.functionsService
              .onChangeFouCode(
                idLigne,
                this.currentCompanyService.getCompany().id,
                this.authService.currentUser.nomUtilisateur,
              )
              .valueChanges),
            tap(res => {
              this.gridLignesLogistique.refresh();
              this.gridLogistiques.refresh();
            }),
          )
          .subscribe(this.handleCellChangeEventResponse());
        break;
      }
      case "ventePrixUnitaire": { // Unckeck 'gratuit' when an unit price is set
        this.functionsService.onChangeVtePu(idLigne)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
      case "gratuit": { // Set unit price to zero when 'gratuit' is checked
        this.functionsService.onChangeIndGratuit(idLigne)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
      case "achatDevisePrixUnitaire": { // Recalculate PU
        this.functionsService.onChangeAchDevPu(idLigne, this.currentCompanyService.getCompany().id)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
      case "typePalette": {
        this.functionsService
          .onChangePalCode(idLigne, this.ordre.secteurCommercial.id, this.authService.currentUser.nomUtilisateur)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
      case "paletteInter": {
        this.functionsService
          .onChangePalinterCode(idLigne)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
      case "nombrePalettesIntermediaires": {
        this.functionsService
          .onChangePalNbPalinter(idLigne, this.authService.currentUser.nomUtilisateur)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
    }

  }

}
