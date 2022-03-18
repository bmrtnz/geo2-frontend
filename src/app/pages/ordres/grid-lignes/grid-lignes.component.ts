import { Component, Input, OnChanges, OnInit, ViewChild, Output } from "@angular/core";
import { GridConfiguratorService, Grid, GridConfig } from "app/shared/services/grid-configurator.service";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { OrdreLignesService, SummaryOperation } from "app/shared/services/api/ordres-lignes.service";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services/localization.service";
import { DxDataGridComponent } from "devextreme-angular";
import { GridColumn, TotalItem } from "basic";
import { SummaryType, SummaryInput } from "app/shared/services/api.service";
import { from, Observable, PartialObserver } from "rxjs";
import { map } from "rxjs/operators";
import { FournisseursService, ArticlesService, AuthService } from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { TypesPaletteService } from "app/shared/services/api/types-palette.service";
import { ZoomArticlePopupComponent } from "../zoom-article-popup/zoom-article-popup.component";
import { ZoomFournisseurPopupComponent } from "../zoom-fournisseur-popup/zoom-fournisseur-popup.component";
import notify from "devextreme/ui/notify";
import { ArticleOriginePopupComponent } from "../article-origine-popup/article-origine-popup.component";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { ArticleCertificationPopupComponent } from "../article-certification-popup/article-certification-popup.component";
import { CertificationsModesCultureService } from "app/shared/services/api/certifications-modes-culture.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { cpuUsage } from "process";
import { Fournisseur } from "app/shared/models";

@Component({
  selector: "app-grid-lignes",
  templateUrl: "./grid-lignes.component.html",
  styleUrls: ["./grid-lignes.component.scss"]
})
export class GridLignesComponent implements OnChanges, OnInit {

  @Input() public ordre: Ordre;
  @Input() public fournisseurLigneCode: string;
  @Output() public articleLigneId: string;
  @Output() public ordreLigne: OrdreLigne;
  @Output() public fournisseurLigneId: string;
  @Output() public fournisseurCode: string;

  public certifMDDS: DataSource;
  public dataSource: DataSource;
  public proprietaireMarchandiseSource: DataSource;
  public fournisseurSource: DataSource;
  public achatUniteSource: DataSource;
  public fraisUniteSource: DataSource;
  public venteUniteSource: DataSource;
  public typePaletteSource: DataSource;
  public paletteInterSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public totalItems: TotalItem[] = [];
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false }) zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild(ArticleOriginePopupComponent, { static: false }) articleOriginePopup: ArticleOriginePopupComponent;
  @ViewChild(ArticleCertificationPopupComponent, { static: false }) articleCertificationPopup: ArticleCertificationPopupComponent;
  @ViewChild(ZoomFournisseurPopupComponent, { static: false }) zoomFournisseurPopup: ZoomFournisseurPopupComponent;
  private gridConfig: Promise<GridConfig>;
  public currentfocusedRow: number;
  public gridRowsTotal: number;
  public lastRowFocused: boolean;
  public currNumero: string;
  public switchNumero: string;
  public itemsWithSelectBox: string[];
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

  constructor(
    public ordreLignesService: OrdreLignesService,
    public articlesService: ArticlesService,
    public gridConfiguratorService: GridConfiguratorService,
    public proprietaireMarchandiseService: FournisseursService,
    public fournisseurService: FournisseursService,
    public achatUniteService: BasesTarifService,
    public venteUniteService: BasesTarifService,
    public fraisUniteService: BasesTarifService,
    public currentCompanyService: CurrentCompanyService,
    public typePaletteService: TypesPaletteService,
    public paletteInterService: TypesPaletteService,
    public certificationsModesCultureService: CertificationsModesCultureService,
    public authService: AuthService,
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
      "proprietaireMarchandise"
    ];
    this.newArticles = 0;
    this.newNumero = 0;
    this.hintDblClick = this.localizeService.localize("hint-DblClick-file");
    this.certificationText = this.localizeService.localize("btn-certification");
    this.originText = this.localizeService.localize("btn-origine");
  }

  async ngOnInit() {

    const fields = this.columns.pipe(map(columns => columns.map(column => {
      return (this.addKeyToField(column.dataField));
    })));
    const gridFields = await fields.toPromise();
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
      this.dataSource = this.ordreLignesService.getDataSource_v2(gridFields);
    });
  }

  ngOnChanges() {
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

  refreshGrid() {
    this.datagrid.instance.refresh();
  }

  async enableFilters() {

    if (!this.dataSource) return;

    const summaryInputs: SummaryInput[] = [
      { selector: "nombrePalettesCommandees", summaryType: SummaryType.SUM },
      { selector: "nombreColisCommandes", summaryType: SummaryType.SUM }
    ];

    const columns = await this.columns.toPromise();
    const fields = columns.map(column => column.dataField).map(field => {
      return this.addKeyToField(field);
    });

    this.totalItems = summaryInputs
      .map(({ selector: column, summaryType }, index) => ({
        column,
        summaryType,
        displayFormat: !index ? this.localizeService.localize("totaux") + " : {0}" : "{0}",
        valueFormat: columns
          ?.find(({ dataField }) => dataField === column)
          ?.format,
      }));

    if (this?.ordre?.id) {
      this.dataSource = this.ordreLignesService
        .getSummarisedDatasource(SummaryOperation.Totaux, fields, summaryInputs);
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
        let volumetrie;
        if (e.data.nombreColisPalette && e.data.nombreColisCommandes) {
          volumetrie = e.data.nombreColisCommandes / e.data.nombreColisPalette;
          volumetrie /= (e.data.nombrePalettesIntermediaires ? e.data.nombrePalettesIntermediaires + 1 : 1);
          e.cellElement.title = volumetrie;
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
    if (field === "article.matierePremiere.origine.id") templ = "origineTemplate";
    if (field === "ordre.client.id") templ = "certificationTemplate";
    return templ ? templ : false;
  }

  showOriginButton(cell) {
    return cell.value === "F";
  }

  showOriginCheck(data) {
    return this.originText + (data.origineCertification ? " ✓" : "");
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

  hintFournisseur(field) {
    const hint = ["fournisseur", "proprietaireMarchandise"].includes(field) ? this.hintDblClick : "";
    return hint;
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

  onValueChanged(event, cell) {
    if (cell.setValue) {
      cell.setValue(event.value);
      this.cellValueChange(event);
      this.idLigne = cell.data.id;
      this.dataField = cell.column.dataField;
    }
  }

  onCellClick(e) {
    // Way to avoid Dx Selectbox list to appear when cell is readonly
    this.SelectBoxPopupWidth = e.cellElement.classList.contains("dx-datagrid-readonly") ? 0 : 400;
    if (e.column.dataField === "fournisseur") {
      this.updateFfilterFournisseurDS(e.data.proprietaireMarchandise);
    }
    // Different approach for checkboxes - Force edit mode
    if (e.column.dataField === "gratuit") {
      e.component.editCell(e.rowIndex, e.column.dataField);
    }
  }

  openFilePopup(e) {
    if (e.column?.dataField === "article.id") {
      this.articleLigneId = e.data.article.id;
      this.zoomArticlePopup.visible = true;
    }
    if (["fournisseur", "proprietaireMarchandise"].includes(e.column?.dataField)) {
      const idFour = e.data[e.column.dataField].id;
      if (!idFour) return;
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
      e.editorOptions.onFocusIn = () => {
        this.dataField = e.dataField;
        this.idLigne = e.row?.data?.id;
      };
    }
  }

  onContentReady() {
    // Grid is loaded with new articles: save order row numbers
    if (this.newArticles === this.nbInsertedArticles) {
      let info = this.nbInsertedArticles + " ";
      info += " " + this.localizeService.localize("article-ajoutes");
      info = info.split("&&").join(this.nbInsertedArticles > 1 ? "s" : "");
      notify(info, "success", 3000);
      this.datagrid.instance.getScrollable().scrollTo(0); // Reset scrollbar
      this.newArticles = 0;
      this.newNumero = 0;
      this.nbInsertedArticles = null;
      this.datagrid.instance.option("focusedRowIndex", this.gridRowsTotal); // Focus on 1st added item
      this.datagrid.instance.saveEditData();
    }
  }

  updateFfilterFournisseurDS(proprietaireMarchandise) {

    const newFourId = proprietaireMarchandise?.id;
    const newFourCode = proprietaireMarchandise?.code;
    const filters = [];

    if (this.currentCompanyService.getCompany().id !== "BUK" || newFourCode.substring(0, 2) !== "BW") {
      const listExp = proprietaireMarchandise?.listeExpediteurs;
      if (listExp) {
        listExp.split(",").map(exp => filters.push(["code", "=", exp], "or"));
        filters.pop();
      } else {
        filters.push(["id", "=", newFourId]);
      }
    }
    this.filterFournisseurDS(filters);

  }

  cellValueChange(data) {

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
      case "nombrePalettesIntermediaires": {
        this.functionsService.onChangeDemipalInd(idLigne, this.authService.currentUser.nomUtilisateur)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
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
        this.updateFfilterFournisseurDS(proprietaireMarchandise);
        data.component.cellValue(data.component.getRowIndexByKey(data.changes[0].key),
          "fournisseur",
          { id: null, code: null });
        setTimeout(() => this.datagrid.instance.saveEditData());
        this.functionsService
          .onChangeProprCode(idLigne, this.currentCompanyService.getCompany().id, this.authService.currentUser.nomUtilisateur)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
        break;
      }
      case "fournisseur": {
        this.functionsService
          .onChangeFouCode(idLigne, this.currentCompanyService.getCompany().id, this.authService.currentUser.nomUtilisateur)
          .valueChanges.subscribe(this.handleCellChangeEventResponse());
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

    }

  }

  private handleCellChangeEventResponse<T>(): PartialObserver<T> {
    return {
      next: v => this.refreshGrid(),
      error: (message: string) => notify({
        message,
      }, "error", 3000),
    };
  }

}
