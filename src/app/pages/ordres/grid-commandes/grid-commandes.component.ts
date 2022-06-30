import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
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
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { Change, GridColumn, OnSavingEvent } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { Observable, of } from "rxjs";
import { concatMap, filter, first, map, tap } from "rxjs/operators";
import { ArticleCertificationPopupComponent } from "../article-certification-popup/article-certification-popup.component";
import { ArticleOriginePopupComponent } from "../article-origine-popup/article-origine-popup.component";

@Component({
  selector: "app-grid-commandes",
  templateUrl: "./grid-commandes.component.html",
  styleUrls: [
    "./grid-commandes.component.scss",
    "../grid-lignes/grid-lignes.component.scss", // legacy style
  ]
})
export class GridCommandesComponent implements OnInit, OnChanges {

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
    private typesPaletteService: TypesPaletteService,
  ) {
    const fournisseursDataSource = this.fournisseursService
      .getDataSource_v2(["id", "code", "raisonSocial"]);
    const sharedBaseTarifDatasource = this.basesTarifService
      .getDataSource_v2(["id", "description"]);
    const sharedTypePaletteDatasource = this.typesPaletteService
      .getDataSource_v2(["id", "description"]);
    this.columnsSettings = {
      "proprietaireMarchandise.id": {
        dataSource: this.fournisseursService
          .getDataSource_v2(["id", "code", "raisonSocial"]),
        displayExpression: "raisonSocial",
      },
      "fournisseur.id": {
        dataSource: fournisseursDataSource,
        displayExpression: "raisonSocial",
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

  @Output() public ordreLigne: OrdreLigne;
  @Output() swapRowArticle = new EventEmitter();
  @ViewChild(ArticleCertificationPopupComponent) articleCertificationPopup: ArticleCertificationPopupComponent;
  @ViewChild(ArticleOriginePopupComponent) articleOriginePopup: ArticleOriginePopupComponent;

  public gridConfigHandler = event =>
    this.gridConfigurator.init(this.gridID, {
      ...event,
      title: "Lignes de commande",
      onColumnsChange: this.onColumnsConfigurationChange.bind(this),
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

    if (this.FEATURE.columnCertifications) this.initFeatures();
  }

  ngOnChanges() {
    if (this.ordreID) this.updateRestrictions();
  }

  focusedColumnIndexChange() {
    this.grid.instance.saveEditData();
  }

  onSaving(event: OnSavingEvent) {

    if (event.component.hasEditData()) {

      event.cancel = true;
      return this.handleMutations();

    }
  }

  public onContentReady(event) {
    if (this.FEATURE.rowOrdering) this.handleNewArticles();
  }

  public async update() {
    await (this.grid.dataSource as DataSource).reload();
    this.reindexing();
    this.grid.instance.saveEditData();
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
            ] : [],
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
      if (e.column.dataField === "article.articleDescription.descriptionReferenceLongue") {
        // Bio en vert
        const isBio = e.data.article.matierePremiere?.modeCulture?.description?.toLowerCase().includes("bio");
        if (isBio) e.cellElement.classList.add("bio-article");
      }
    }
  }

  onDataChanged(data: Partial<OrdreLigne>) {
    const ds = this.grid.dataSource as DataSource;
    const store = ds.store() as CustomStore;
    store.push([{ key: data.id, type: "update", data }]);
  }

  onFocusedRowChanged(e) {
    this.gridRowsTotal = this.grid.instance.getVisibleRows().length;
    this.currentfocusedRow = e.row?.rowIndex;
    this.lastRowFocused = (this.currentfocusedRow === (this.gridRowsTotal - 1));
  }

  moveRowUpDown(e) {
    const moveDirection = e.element.classList.contains("up-move-button") ? -1 : 1;
    this.currNumero = this.grid.instance.getVisibleRows()[this.currentfocusedRow].data.numero;
    this.switchNumero = this.grid.instance.getVisibleRows()[this.currentfocusedRow + moveDirection].data.numero;
    this.grid.instance.cellValue(this.currentfocusedRow + moveDirection, "numero", this.currNumero);
    this.grid.instance.cellValue(this.currentfocusedRow, "numero", this.switchNumero);
    this.grid.instance.saveEditData();
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

}
