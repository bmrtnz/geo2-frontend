import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import {
  AuthService,
  LocalizationService,
  FournisseursService,
  ArticlesService,
} from "app/shared/services";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { OrdresIndicatorsService } from "app/shared/services/ordres-indicators.service";
import { GridColumn } from "basic";
import {
  DxDataGridComponent,
  DxSelectBoxComponent,
  DxCheckBoxComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../root/root.component";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";

enum InputField {
  bureauAchat = "logistique.fournisseur.bureauAchat",
  secteurCommercial = "ordre.secteurCommercial",
  fournisseur = "logistique.fournisseur",
  from = "logistique.dateDepartPrevueFournisseur",
  to = "logistique.dateDepartPrevueFournisseur",
}

enum validField {
  client = "ordre.client.valide",
  entrepot = "ordre.entrepot.valide",
  fournisseur = "logistique.fournisseur.valide",
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-planning-fournisseurs",
  templateUrl: "./planning-fournisseurs.component.html",
  styleUrls: ["./planning-fournisseurs.component.scss"],
})
export class PlanningFournisseursComponent implements OnInit, AfterViewInit {
  readonly INDICATOR_NAME = "PlanningFournisseurs";

  private indicator = this.ordresIndicatorsService.getIndicatorByName(
    this.INDICATOR_NAME
  );
  private gridConfig: Promise<GridConfig>;
  public periodes: any[];
  private priceColumns = [
    "ventePrixUnitaire",
    "venteUnite.description",
    "achatPrixUnitaire",
    "achatUnite.description",
    "ordre.devise.id"
  ];
  public validRequiredEntity: {};

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("prices", { static: false }) prices: DxCheckBoxComponent;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresLignesDataSource: DataSource;
  public secteurs: DataSource;
  public fournisseurs: DataSource;
  public bureauxAchat: DataSource;
  private oldOrderNumber: string;
  private alternateOrder: boolean;


  public formGroup = new UntypedFormGroup({
    bureauAchat: new UntypedFormControl(),
    secteurCommercial: new UntypedFormControl(),
    fournisseur: new UntypedFormControl(),
    from: new UntypedFormControl(this.dateManagementService.startOfDay()),
    to: new UntypedFormControl(this.dateManagementService.endOfDay()),
  } as Inputs<UntypedFormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public ordresLignesService: OrdreLignesService,
    public secteursService: SecteursService,
    public fournisseursService: FournisseursService,
    public bureauxAchatService: BureauxAchatService,
    public authService: AuthService,
    public dateManagementService: DateManagementService,
    public localizeService: LocalizationService,
    public articlesService: ArticlesService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    public currentCompanyService: CurrentCompanyService,
    private tabContext: TabContext
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.PlanningFournisseurs
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.secteurs = secteursService.getDataSource();
    this.filterFournisseurs(); // Initialize fournisseurs
    this.bureauxAchat = bureauxAchatService.getDataSource_v2([
      "id",
      "raisonSocial",
    ]);
    this.bureauxAchat.filter(["valide", "=", true]);
    this.validRequiredEntity = {
      client: true,
      entrepot: true,
      fournisseur: true,
    };

    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      ["societes", "contains", this.currentCompanyService.getCompany().id],
    ]);
    this.periodes = this.dateManagementService.periods();
  }

  async ngOnInit() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    this.ordresLignesDataSource = this.ordresLignesService.getDataSource_v2(
      await fields.toPromise()
    );
    this.formGroup.updateValueAndValidity();
  }

  ngAfterViewInit() {
    if (this.authService.currentUser.secteurCommercial) {
      this.formGroup.get("secteurCommercial").patchValue({
        id: this.authService.currentUser.secteurCommercial.id,
        description: this.authService.currentUser.secteurCommercial.description,
      });
    }
    this.setDefaultPeriod(this.authService.currentUser?.periode ?? "J");
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
      from: datePeriod.dateDebut,
      to: datePeriod.dateFin,
    });
  }

  enableFilters() {
    const values: Inputs = this.formGroup.value;
    const extraFilters = this.buildFormFilter(values);
    this.ordresLignesDataSource.filter([
      ...this.indicator.cloneFilterLignes(),
      ...(extraFilters.filter((v) => v != null).length
        ? ["and", ...extraFilters]
        : []),
    ]);
    this.datagrid.dataSource = this.ordresLignesDataSource;
  }

  calculateVentePrixUnitaire(data) {
    if (!data.ventePrixUnitaire || !data.venteUnite?.description) {
      return "";
    } else return data.ventePrixUnitaire;
  }

  calculateAchatPrixUnitaire(data) {
    if (!data.achatPrixUnitaire || !data.achatUnite?.description) {
      return "";
    } else return data.achatPrixUnitaire;
  }

  // calculateAchatUnite(data) {
  //   if (!data.achatUnite?.description) {
  //     return "";
  //   } else return data.ordre.devise?.id + " / " + data.achatUnite.description;
  // }

  // calculateVenteUnite(data) {
  //   if (!data.venteUnite?.description) {
  //     return "";
  //   } else return data.ordre.devise?.id + " / " + data.achatUnite.description;
  // }

  filterFournisseurs(bureauAchat?) {
    bureauAchat = bureauAchat?.value ? bureauAchat.value : null;
    this.fournisseurs = this.fournisseursService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
    ]);
    this.fournisseurs.filter(["valide", "=", true]);
    if (bureauAchat)
      this.fournisseurs.filter([
        ["valide", "=", true],
        "and",
        ["bureauAchat.id", "=", bureauAchat.id],
      ]);
  }

  validOrAll(e) {
    this.validRequiredEntity[e.element.dataset.entity] =
      !this.validRequiredEntity[e.element.dataset.entity];
    const Element = e.element as HTMLElement;
    Element.classList.toggle("lowOpacity");
    this.enableFilters();
  }

  onRowPrepared(e) {
    // Highlight canceled orders
    if (e.rowType === "data") {
      if (e.data?.ordre.flagAnnule === true) {
        e.rowElement.classList.add("canceled-orders");
        e.rowElement.title = this.localizeService.localize("ordre-annule");
      }
      if (e.data?.ordre?.numero !== this.oldOrderNumber) {
        this.alternateOrder = !this.alternateOrder;
        this.oldOrderNumber = e.data?.ordre?.numero;
        if (this.alternateOrder)
          e.rowElement.classList.add("alternate-row");
      }
    }
  }

  showHidePrices() {
    const prices = this.prices.instance.option("value");
    this.priceColumns.map((field) =>
      this.datagrid.instance.columnOption(field, "visible", prices)
    );
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

  onRowDblClick(e) {
    if (e.data.ordre?.societe.id === this.currentCompanyService.getCompany().id)
      this.tabContext.openOrdre(e.data.ordre.numero, e.data.ordre.campagne.id);
  }

  private buildFormFilter(values: Inputs): any[] {
    const filter = [];

    // Valid entities
    Object.keys(validField).map((entity) => {
      if (this.validRequiredEntity[entity]) {
        filter.push([validField[entity], "=", "true"]);
      }
    });

    if (values.bureauAchat)
      filter.push([InputField.bureauAchat, "=", values.bureauAchat]);

    if (values.secteurCommercial)
      filter.push([
        InputField.secteurCommercial,
        "=",
        values.secteurCommercial,
      ]);

    if (values.fournisseur)
      filter.push([InputField.fournisseur, "=", values.fournisseur]);

    if (values.from) filter.push([InputField.from, ">=", values.from]);

    if (values.to) filter.push([InputField.to, "<=", values.to]);

    return filter.length
      ? filter.reduce((crt, acm) => [crt, "and", acm])
      : null;
  }

  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.formGroup.get("from").value);
    const fin = new Date(this.formGroup.get("to").value);
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains("dateStart")) {
        this.formGroup
          .get("to")
          .patchValue(this.dateManagementService.endOfDay(deb));
      } else {
        this.formGroup
          .get("from")
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
      from: datePeriod.dateDebut,
      to: datePeriod.dateFin,
    });
  }
}

export default PlanningFournisseursComponent;
