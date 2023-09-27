import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { GridsService } from "app/pages/ordres/grids.service";
import { Statut } from "app/shared/models/ordre.model";
import {
  AuthService,
  ClientsService,
  EntrepotsService,
} from "app/shared/services";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn } from "basic";
import {
  DxDataGridComponent,
  DxSelectBoxComponent,
  DxSwitchComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ZoomClientArticlePopupComponent } from "../zoom-client-article-popup/zoom-client-article-popup.component";

enum InputField {
  valide = "valide",
  dateMin = "dateMin",
  dateMax = "dateMax",
  secteur = "secteur",
  client = "client",
  entrepot = "entrepot",
  bureauAchat = "bureauAchat"
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-grid-order-history",
  templateUrl: "./grid-order-history.component.html",
  styleUrls: ["./grid-order-history.component.scss"],
})
export class GridOrderHistoryComponent implements OnChanges, AfterViewInit {
  @Input() popupShown: boolean;
  @Input() public clientId: string;
  @Input() public entrepotId: string;
  @Input() public secteurId: string;
  @Input() public fournisseurLigneCode: string;
  @Input() public gridSelectionEnabled: boolean;
  @Input() public comingFrom: string;
  @Output() public articleLigneId: string;
  @Output() hidePopup = new EventEmitter<any>();
  @Output() openOrder = new EventEmitter<any>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild(ZoomClientArticlePopupComponent, { static: false })
  zoomArticlePopup: ZoomClientArticlePopupComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("switchDepartLivraison", { static: false })
  switchLivraison: DxSwitchComponent;

  public secteurs: DataSource;
  public clients: DataSource;
  public entrepots: DataSource;
  public bureauxAchat: DataSource;
  public certifMDDS: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
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
  public periodes: any[];
  public formGroup = new UntypedFormGroup({
    valide: new UntypedFormControl(),
    dateMin: new UntypedFormControl(),
    dateMax: new UntypedFormControl(),
    secteur: new UntypedFormControl(),
    client: new UntypedFormControl(),
    entrepot: new UntypedFormControl(),
    bureauAchat: new UntypedFormControl(),
  } as Inputs<UntypedFormControl>);

  public summaryFields = ["nombreColisCommandes"];

  constructor(
    public ordreLignesService: OrdreLignesService,
    public entrepotsService: EntrepotsService,
    public clientsService: ClientsService,
    public secteursService: SecteursService,
    public bureauxAchatService: BureauxAchatService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService,
    public dateManagementService: DateManagementService,
    public authService: AuthService,
    public gridsService: GridsService,
    public functionsService: FunctionsService,
    private router: Router,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreLigneHistorique
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.hintClick = this.localizeService.localize("hint-click-file");
    this.hintNotValid = this.localizeService.localize("hint-not-valid-article");
    this.periodes = this.dateManagementService.periods();
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      ["societes", "contains", this.currentCompanyService.getCompany().id],
    ]);
    this.clients = clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "valide",
    ]);
    this.entrepots = entrepotsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "valide",
    ]);
    this.bureauxAchat = bureauxAchatService.getDataSource_v2([
      "id",
      "raisonSocial",
    ]);
    this.bureauxAchat.filter(["valide", "=", true]);
  }

  ngAfterViewInit() {
    this.setDefaultPeriod(this.authService.currentUser?.periode ?? "MAC");
  }



  ngOnChanges() {
    if (this.clientId && this.popupShown) {
      this.clients.filter(["secteur.id", "=", this.secteurId]);
      this.entrepots.filter(["client.id", "=", this.clientId]);
      this.formGroup.get("valide").patchValue(true);
      this.formGroup.patchValue({
        client: { id: this.clientId },
        entrepot: { id: this.entrepotId },
        secteur: { id: this.secteurId },
      });
      this.enableFilters();
    }
  }

  refreshGrid() {
    this.datagrid.instance.refresh();
  }

  async enableFilters() {
    let dateType = "dateDepartPrevue";

    const fields = this.columns.pipe(
      map((cols) =>
        cols.map((column) => {
          return column.dataField;
        })
      )
    );
    const gridFields = await fields.toPromise();
    const dataSource = this.ordreLignesService.getListDataSource([
      ...gridFields,
      "ordre.id",
      "ordre.statut",
    ]);

    const values: Inputs = {
      ...this.formGroup.value,
    };

    // Change date criteria
    if (this.switchLivraison?.value) dateType = "dateLivraisonPrevue";

    const filter = [
      ["ordre.societe.id", "=", this.currentCompanyService.getCompany().id],
      "and",
      ["ordre.secteurCommercial.id", "=", values.secteur.id],
      "and",
      [`ordre.${dateType}`, ">=", this.dateManagementService.startOfDay(values.dateMin)],
      "and",
      [`ordre.${dateType}`, "<=", this.dateManagementService.endOfDay(values.dateMax)],
      // "and",
      // [[`nombreColisCommandes`, "<>", 0], "and", [`nombreColisExpedies`, "<>", 0]] // Colis cdés et exp à 0: pas d'affichage de la ligne
      // Lignes commentées 21-08-2023 suite volonté BW d'avoir accès ouvertures de calibre (0 colis exp, 0 colis cdés)
    ];
    if (values.client?.id) {
      filter.push("and", ["ordre.client.id", "=", values.client.id]);
    }
    if (values.entrepot?.id) {
      filter.push("and", ["ordre.entrepot.id", "=", values.entrepot?.id]);
    }
    if (values.bureauAchat?.id) {
      filter.push("and", ["bureauAchat.id", "=", values.bureauAchat.id]);
    }
    dataSource.filter(filter);
    this.datagrid.dataSource = dataSource;
  }

  switchDateType() {
    // Change grouping + sorting depending on #switchDepartLivraison
    const liv = this.switchLivraison.value;
    this.datagrid.instance.columnOption(
      "ordre.dateDepartPrevue",
      "groupIndex",
      liv ? null : 0
    );
    this.datagrid.instance.columnOption(
      "ordre.dateDepartPrevue",
      "sortIndex",
      liv ? null : 0
    );
    this.datagrid.instance.columnOption(
      "ordre.dateLivraisonPrevue",
      "groupIndex",
      liv ? 0 : null
    );
    this.datagrid.instance.columnOption(
      "ordre.dateLivraisonPrevue",
      "sortIndex",
      liv ? 0 : null
    );
    this.enableFilters();
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      if (!e.data.article.valide)
        e.rowElement.classList.add("highlight-datagrid-row");
    }
  }

  // Open selected ordre on group/line row double-click
  public onRowDblClick({ data, rowType }: { rowType: "group"; data: any }) {
    let numero, campagneId;
    if (rowType === "group") {
      if (!data.items && !data.collapsedItems) return;
      const dataItems = data.items ? data.items[0] : data.collapsedItems[0];
      if (!dataItems.ordre) return;
      numero = dataItems.ordre.numero;
      campagneId = dataItems.ordre.campagne.id;
    } else {
      numero = data.ordre.numero;
      campagneId = data.ordre.campagne.id;
    }
    if (numero && campagneId) {
      if (this.comingFrom === "zoomClient") {
        this.openOrder.emit({ campagne: { id: campagneId }, numero: numero });
      } else {
        window.sessionStorage.setItem(
          "openOrder",
          [numero, campagneId].join("|")
        );
        this.hidePopup.emit();
        setTimeout(() => this.router.navigateByUrl("pages/ordres")); // Timeout to let the popup close
      }
    }
  }

  calculateGroupeOrdreLibelle(data) {
    // Ajout code entrep. + réf client + (code transp.) + ...
    let numeroContainerArray = [];
    let numeroContainer;
    numeroContainerArray.push(data.logistique?.numeroContainer);
    numeroContainerArray = Array.from(new Set(numeroContainerArray.filter(el => el)));
    if (numeroContainerArray.length) numeroContainer = numeroContainerArray.join("/");

    data = data.ordre;

    return data.numero +
      " - " +
      (data.entrepot?.code ?? "") +
      (data.referenceClient ? " - " + data.referenceClient + " " : "") +
      (data.codeChargement ? " - " + data.codeChargement + " " : "") +
      (numeroContainer ? " - " + numeroContainer + " " : "") +
      (data.transporteur?.id
        ? " (Transporteur : " + data.transporteur.id + ")"
        : "") +
      ` - ${Statut[data.statut]}`;
  }

  onCellPrepared(e) {
    if (e.rowType === "group") {
      if (e.column.dataField === "ordre.dateDepartPrevue")
        e.cellElement.classList.add("first-group");
    }
    if (e.rowType === "data") {
      // Descript. article
      if (
        e.column.dataField ===
        "article.articleDescription.descriptionReferenceLongue"
      ) {
        e.cellElement.title = e.value;
        if (!e.data.article.valide)
          e.cellElement.title += +"\r\n" + this.hintNotValid;
        // Bio en vert
        if (e.data.article.articleDescription.bio)
          e.cellElement.classList.add("bio-article");
      }

      // Descript. article abrégée
      if (
        e.column.dataField ===
        "article.articleDescription.descriptionReferenceCourte"
      ) {
        e.cellElement.title = e.value;
        if (!e.data.article.valide)
          e.cellElement.title += +"\r\n" + this.hintNotValid;
        // Bio en vert
        if (e.data.article.articleDescription.bio)
          e.cellElement.classList.add("bio-article");
      }

      // Clic sur loupe
      if (e.column.dataField === "article.matierePremiere.origine.id")
        e.cellElement.title = this.hintClick;

      // Palettes
      if (e.column.dataField === "nombrePalettesCommandees") {
        e.cellElement.innerText =
          e.cellElement.innerText +
          "/" +
          (e.data.nombrePalettesCommandees ?? 0);
      }

      // Colis
      if (e.column.dataField === "nombreColisCommandes") {
        e.cellElement.innerText =
          e.cellElement.innerText + "/" + (e.data.nombreColisExpedies ?? 0);
      }

      // Prix
      if (e.column.dataField === "ventePrixUnitaire") {
        if (!e.data?.ventePrixUnitaire || !e.data?.venteUnite?.description) {
          e.cellElement.innerText = "";
        } else {
          e.cellElement.innerText =
            e.cellElement.innerText + " " + e.data.venteUnite?.description;
        }
      }
      if (e.column.dataField === "achatDevisePrixUnitaire") {
        if (
          !e.data?.achatDevisePrixUnitaire ||
          !e.data?.achatUnite?.description
        ) {
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

  onValideChanged(e) {
    if (!e.event) return; // Only user event
    this.formGroup.patchValue({
      client: null,
      entrepot: null,
    });
    this.clients = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "valide",
    ]);
    const filter: any = [
      ["secteur.id", "=", this.formGroup.get("secteur").value?.id],
      "and",
      ["societe.id", "=", this.currentCompanyService.getCompany().id],
    ];
    if (this.formGroup.get("valide").value)
      filter.push("and", ["valide", "=", true]);
    this.clients.filter(filter);
  }

  onSecteurChanged(e) {
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
    ];
    if (this.formGroup.get("valide").value)
      filter.push("and", ["valide", "=", true]);
    this.clients.filter(filter);
    // We check that this change is coming from the user
    if (!e.event) return;
    this.formGroup.patchValue({
      client: null,
      entrepot: null,
    });
  }

  onClientChanged(e) {
    this.entrepots = this.entrepotsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "valide",
    ]);

    const filter: any = [["client.id", "=", e.value?.id]];
    if (this.formGroup.get("valide").value)
      filter.push("and", ["valide", "=", true]);
    this.entrepots.filter(filter);

    this.entrepots.load().then((res) => {
      if (res?.length === 1)
        this.formGroup.get("entrepot").patchValue({ id: res[0].id });
    });
    // We check that this change is coming from the user
    if (!e.event) return;
    this.formGroup.patchValue({
      entrepot: null,
    });
  }

  onEntrepotFocus(e) {
    if (!this.formGroup.get("client").value) {
      notify("Veuillez sélectionner un client", "warning", 3000);
    }
  }

  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

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

    const datePeriod = this.dateManagementService.getDates(e);

    this.formGroup.patchValue({
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin,
    });
  }

  setDefaultPeriod(periodId) {
    let myPeriod = this.dateManagementService.getPeriodFromId(
      periodId,
      this.periodes
    );
    if (!myPeriod) return;
    this.periodeSB.instance.option("value", myPeriod);
    const datePeriod = this.dateManagementService.getDates({
      value: myPeriod,
    });
    this.formGroup.patchValue({
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin,
    });
  }

  displayCodeBefore(data) {
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
