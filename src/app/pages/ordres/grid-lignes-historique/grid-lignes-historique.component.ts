import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import { ArticlesService, AuthService, ClientsService, EntrepotsService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
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
  secteur = "secteur",
  client = "client",
  entrepot = "entrepot"
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
  @Input() public entrepotId: string;
  @Input() public secteurId: string;
  @Input() public fournisseurLigneCode: string;
  @Input() public gridSelectionEnabled: boolean;
  @Output() public articleLigneId: string;
  @Output() public ordreLigne: OrdreLigne;
  @Output() selectChange = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false }) zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;

  public secteurs: DataSource;
  public clients: DataSource;
  public entrepots: DataSource;
  public certifMDDS: DataSource;
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
    secteur: new FormControl(),
    client: new FormControl(),
    entrepot: new FormControl()
  } as Inputs<FormControl>);

  constructor(
    public ordreLignesService: OrdreLignesService,
    public entrepotsService: EntrepotsService,
    public clientsService: ClientsService,
    public secteursService: SecteursService,
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
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      [
        "societes",
        "contains",
        this.currentCompanyService.getCompany().id,
      ],
    ]);
    this.clients = clientsService.getDataSource_v2(["id", "code", "raisonSocial"]);
    this.entrepots = entrepotsService.getDataSource_v2(["id", "code", "raisonSocial"]);
  }

  ngAfterViewInit() {
    this.setDefaultPeriod("Mois à cheval");
  }

  ngOnChanges() {
    this.toRefresh = true;
    if (this.clientId && this.popupShown) {
      this.clients.filter(["secteur.id", "=", this.secteurId]);
      this.entrepots.filter(["client.id", "=", this.clientId]);
      this.formGroup.patchValue({
        client: { id: this.clientId },
        entrepot: { id: this.entrepotId },
        secteur: { id: this.secteurId }
      });
      this.enableFilters();
    }
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
    const dataSource = this.ordreLignesService.getListDataSource(gridFields);

    const values: Inputs = {
      ...this.formGroup.value,
    };

    const filter = [
      ["ordre.secteurCommercial.id", "=", values.secteur.id],
      "and",
      ["ordre.client.id", "=", values.client.id],
      "and",
      ["ordre.dateDepartPrevue", ">=", values.dateMin],
      "and",
      ["ordre.dateDepartPrevue", "<=", values.dateMax]
    ];
    if (values.entrepot?.id) {
      filter.push(
        "and",
        ["ordre.entrepot.id", "=", values.entrepot?.id]
      );
    }
    dataSource.filter(filter);
    this.datagrid.dataSource = dataSource;

  }

  onCellClick(e) {
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      if (!e.data.article.valide) e.rowElement.classList.add("highlight-datagrid-row");
    }
  }

  onCellPrepared(e) {
    if (e.rowType === "group") {
      // Ajout code entrep. + réf client + (code transp.)
      if (e.column.dataField === "ordre.numero" && e.cellElement.textContent) {
        let data = e.data.items ?? e.data.collapsedItems;
        data = data[0].ordre;
        e.cellElement.textContent += " - " +
          (data.entrepot?.code ?? "") + " - " +
          (data.referenceClient ? data.referenceClient + " " : "") +
          (data.transporteur?.id ? "(Transporteur : " + data.transporteur.id + ")" : "");
      }
    }
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

  onSecteurChanged(e) {
    this.onFieldValueChange();
    this.clients = this.clientsService.getDataSource_v2(["id", "code", "raisonSocial"]);
    this.clients.filter(["secteur.id", "=", e.value?.id]);
    // We check that this change is coming from the user
    if (!e.event) return;
    this.formGroup.patchValue({
      client: null,
      entrepot: null
    });
    this.onFieldValueChange();
  }

  onClientChanged(e) {
    this.onFieldValueChange();
    this.entrepots = this.entrepotsService.getDataSource_v2(["id", "code", "raisonSocial"]);
    this.entrepots.filter(["client.id", "=", e.value?.id]);
    this.entrepots.load().then(res => {
      if (res?.length === 1) this.formGroup.get("entrepot").patchValue({ id: res[0].id });
    });
    // We check that this change is coming from the user
    if (!e.event) return;
    this.formGroup.patchValue({
      entrepot: null
    });
    this.onFieldValueChange();
  }

  onEntrepotChanged(e) {
    this.onFieldValueChange();
  }

  onEntrepotFocus(e) {
    if (!this.formGroup.get("client").value) {
      notify("Veuillez sélectionner un client", "warning", 3000);
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
    this.toRefresh = !!this.formGroup.get("client").value &&
      // !!this.formGroup.get("entrepot").value &&
      !!this.formGroup.get("secteur").value;
  }

  onSelectionChanged(e) {

    if (e.selectedRowsData?.length) {
      if (!e.selectedRowsData[e.selectedRowsData.length - 1].article?.valide) {
        notify(this.hintNotValid, "warning", 3000);
        e.component.deselectRows(e.currentSelectedRowKeys);
        return;
      }
    }

    this.selectChange.emit(e);
  }

  displayCodeBefore(data) {
    return data ?
      ((data.code ? data.code : data.id) + " - " + (data.nomUtilisateur ? data.nomUtilisateur :
        (data.raisonSocial ? data.raisonSocial : data.description)))
      : null;
  }

}

