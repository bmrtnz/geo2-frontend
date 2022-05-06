import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import Ordre from "app/shared/models/ordre.model";
import { ArticlesService, AuthService } from "app/shared/services";
import { SummaryInput, SummaryType } from "app/shared/services/api.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService, SummaryOperation } from "app/shared/services/api/ordres-lignes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn, TotalItem } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ZoomArticlePopupComponent } from "../zoom-article-popup/zoom-article-popup.component";

enum InputField {
  dateMin = "dateMin",
  dateMax = "dateMax",
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-grid-lignes-historique",
  templateUrl: "./grid-lignes-historique.component.html",
  styleUrls: ["./grid-lignes-historique.component.scss"]
})
export class GridLignesHistoriqueComponent implements OnChanges, AfterViewInit {

  @Input() popupShown: boolean;
  @Input() public clientId: string;
  @Input() public fournisseurLigneCode: string;
  @Output() public articleLigneId: string;
  @Output() public ordreLigne: OrdreLigne;
  @Output() selectChange = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false }) zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;

  public certifMDDS: DataSource;
  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public totalItems: TotalItem[] = [];
  private gridConfig: Promise<GridConfig>;
  public env = environment;
  public nbInsertedArticles: number;
  public newArticles: number;
  public newNumero: number;
  public SelectBoxPopupWidth: number;
  public dataField: string;
  public idLigne: string;
  public hintClick: string;
  public hintNotValid: string;
  public periodes: string[];
  toRefresh: boolean;
  public formGroup = new FormGroup({
    dateMin: new FormControl(),
    dateMax: new FormControl(),
  } as Inputs<FormControl>);

  constructor(
    public ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService,
    private dateManagementService: DateManagementService,
    private gridRowStyleService: GridRowStyleService,
    private articlesService: ArticlesService,
    public authService: AuthService,
    public functionsService: FunctionsService,
    public localizeService: LocalizationService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreLigneHistorique);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    this.hintClick = this.localizeService.localize("hint-click-file");
    this.hintNotValid = this.localizeService.localize("hint-not-valid-article");
    this.periodes = this.dateManagementService.periods();
  }

  ngAfterViewInit() {
    this.setDefaultPeriod("Mois à cheval");
  }

  ngOnChanges() {
    this.toRefresh = true;
    if (this.clientId && this.popupShown) this.enableFilters();
  }

  refreshGrid() {
    this.datagrid.instance.refresh();
  }

  async enableFilters() {

    this.toRefresh = false;

    const fields = this.columns.pipe(map(cols => cols.map(column => {
      return column.dataField;
    })));
    const gridFields = await fields.toPromise();
    this.dataSource = this.ordreLignesService.getDataSource_v2(gridFields);

    const values: Inputs = {
      ...this.formGroup.value,
    };

    this.dataSource.filter([
      ["ordre.client.id", "=", this.clientId],
      "and",
      ["ordre.dateDepartPrevue", ">=", values.dateMin],
      "and",
      ["ordre.dateDepartPrevue", "<=", values.dateMax],
    ]);
    this.datagrid.dataSource = this.dataSource;

  }

  onCellClick(e) {
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      if (!e.data.article.valide) e.rowElement.classList.add("highlight-datagrid-row");
    }
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {

      // Descript. article
      if (e.column.dataField === "article.id") {
        const infoArt = this.articlesService.concatArtDescript(e.data.article);
        e.cellElement.innerText = infoArt.concatDesc;
        e.cellElement.title = infoArt.concatDesc.substring(2);
        if (!e.data.article.valide) e.cellElement.title += + "\r\n" + this.hintNotValid;
        // Bio en vert
        if (infoArt.bio) e.cellElement.classList.add("bio-article");
      }

      // Descript. article abrégée
      if (e.column.dataField === "article.description") {
        const infoArt = this.articlesService.concatArtDescriptAbregee(e.data.article);
        e.cellElement.innerText = infoArt.concatDesc;
        e.cellElement.title = infoArt.concatDesc.substring(2);
        if (!e.data.article.valide) e.cellElement.title += + "\r\n" + this.hintNotValid;
        // Bio en vert
        if (infoArt.bio) e.cellElement.classList.add("bio-article");
      }

      // Clic sur loupe
      if (e.column.dataField === "article.matierePremiere.origine.id") e.cellElement.title = this.hintClick;

      // Palettes
      if (e.column.dataField === "nombrePalettesCommandees") {
        e.cellElement.innerText = e.cellElement.innerText + "/" + (e.data.nombrePalettesCommandees ?? 0);
      }

      // Colis
      if (e.column.dataField === "nombreColisCommandes") {
        e.cellElement.innerText = e.cellElement.innerText + "/" + (e.data.nombreColisExpedies ?? 0);
      }

      // Prix
      if (e.column.dataField === "ventePrixUnitaire") {
        if (!e.data?.ventePrixUnitaire || !e.data?.venteUnite?.description) {
          e.cellElement.innerText = "";
        } else {
          e.cellElement.innerText =
            e.cellElement.innerText + " " + e.data.venteUnite.description;
        }
      }
      if (e.column.dataField === "achatDevisePrixUnitaire") {
        if (!e.data?.achatDevisePrixUnitaire || !e.data?.achatUnite?.description) {
          e.cellElement.innerText = "";
        } else {
          e.cellElement.innerText =
            e.cellElement.innerText + " " + e.data.achatUnite.description;
        }
      }

    }
  }

  openFilePopup(cell, e) {
    e.event.stopImmediatePropagation(); // To avoid row selection
    if (cell.column?.dataField === "article.matierePremiere.origine.id") {
      this.articleLigneId = cell.data.article.id;
      this.zoomArticlePopup.visible = true;
    }
  }

  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    this.onFieldValueChange();

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.formGroup.get("dateMin").value);
    const fin = new Date(this.formGroup.get("dateMax").value);
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains("dateStart")) {
        this.formGroup
          .get("dateMax")
          .patchValue(this.dateManagementService.endOfDay(deb));
      } else {
        this.formGroup
          .get("dateMin")
          .patchValue(this.dateManagementService.startOfDay(fin));
      }
    }
    this.periodeSB.value = null;
  }

  setDates(e) {
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;

    this.onFieldValueChange();

    const datePeriod = this.dateManagementService.getDates(e);

    this.formGroup.patchValue({
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin
    });
  }

  setDefaultPeriod(periodeName) {
    const myPeriod = this.periodes[this.periodes.indexOf(periodeName)];
    if (!myPeriod) return;
    this.periodeSB.instance.option("value", myPeriod);
    const datePeriod = this.dateManagementService.getDates({ value: myPeriod });
    this.formGroup.patchValue({ dateMin: datePeriod.dateDebut, dateMax: datePeriod.dateFin });
  }

  onFieldValueChange() {
    this.toRefresh = true;
  }

  onSelectionChanged(e) {

    if (!e.selectedRowsData?.length) return;

    if (!e.selectedRowsData[e.selectedRowsData.length - 1].article?.valide) {
      notify(this.hintNotValid, "warning", 3000);
      e.component.deselectRows(e.currentSelectedRowKeys);
      return;
    }

    this.selectChange.emit(e);
  }

}

