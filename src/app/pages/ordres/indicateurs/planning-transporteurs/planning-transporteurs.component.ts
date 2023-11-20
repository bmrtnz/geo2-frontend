import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, NgForm } from "@angular/forms";
import { Statut } from "app/shared/models/ordre.model";
import {
  AuthService,
  LocalizationService,
  TransporteursService,
} from "app/shared/services";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { PlanningTransporteursService } from "app/shared/services/api/planning-transporteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import {
  DxButtonComponent,
  DxDataGridComponent,
  DxSelectBoxComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import Utils from "utils/Filter";
import { GridsService } from "../../grids.service";
import { TabContext } from "../../root/root.component";

let self;

enum FormInput {
  valide = "valide",
  transporteurCode = "transporteur",
  bureauAchatCode = "bureauAchat",
  dateMin = "dateDepartPrevueFournisseur",
  dateMax = "dateDepartPrevueFournisseur",
  // valideClient = 'valideClient',
  // valideEntrepot = 'valideEntrepot',
  // valideFournisseur = 'valideFournisseur',
  societeCode = "societe",
}

type Inputs<T = any> = { [key in keyof typeof FormInput]: T };

@Component({
  selector: "app-planning-transporteurs",
  templateUrl: "./planning-transporteurs.component.html",
  styleUrls: ["./planning-transporteurs.component.scss"],
})
export class PlanningTransporteursComponent implements OnInit, AfterViewInit {
  private gridConfig: Promise<GridConfig>;
  public periodes: any;
  public validRequiredEntity: {};

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("transporteurSB", { static: false }) transporteurSB: DxSelectBoxComponent;
  @ViewChild("filterForm") filterForm: NgForm;
  @ViewChild("validClient") validClient: DxButtonComponent;
  @ViewChild("validEntrepot") validEntrepot: DxButtonComponent;
  @ViewChild("validFournisseur") validFournisseur: DxButtonComponent;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresDataSource: DataSource;
  public transporteursDataSource: DataSource;
  public bureauxAchat: DataSource;
  public statut = Statut;
  public formGroup = new UntypedFormGroup({
    valide: new UntypedFormControl(),
    transporteurCode: new UntypedFormControl(),
    dateMin: new UntypedFormControl(this.dateManagementService.startOfDay()),
    dateMax: new UntypedFormControl(this.dateManagementService.endOfDay()),
    bureauAchatCode: new UntypedFormControl(),
  } as Inputs<UntypedFormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public planningTransporteursService: PlanningTransporteursService,
    public transporteursService: TransporteursService,
    public bureauxAchatService: BureauxAchatService,
    public authService: AuthService,
    public gridsService: GridsService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private tabContext: TabContext,
    private currentCompanyService: CurrentCompanyService
  ) {
    self = this;
    this.gridConfig = this.gridConfiguratorService.fetchConfig(
      Grid.PlanningTransporteurs
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));

    this.transporteursDataSource = this.transporteursService.getDataSource_v2([
      "id",
      "raisonSocial",
      "valide",
    ]);
    this.transporteursDataSource.filter(["valide", "=", true]);
    this.bureauxAchat = bureauxAchatService.getDataSource_v2([
      "id",
      "raisonSocial",
    ]);
    this.bureauxAchat.filter(["valide", "=", true]);
    this.periodes = this.dateManagementService.periods();
    this.validRequiredEntity = {
      client: true,
      entrepot: true,
      fournisseur: true,
    };
  }

  async ngOnInit() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    this.ordresDataSource = this.planningTransporteursService.getDataSource_v2(
      await fields.toPromise()
    );

    // Only way found to validate and show Warning icon
    this.formGroup.get("transporteurCode").setValue("");
    this.formGroup.get("transporteurCode").reset();
    this.transporteurSB.instance.focus();
    this.formGroup.get("valide").patchValue(true);
  }

  ngAfterViewInit() {
    this.authService.onUserChanged().subscribe(() =>
      this.setDefaultPeriod(this.authService.currentUser?.periode ?? "J"
      ));
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

  enableFilters() {
    const values: Inputs = {
      ...this.formGroup.value,
      // valideClient: !this.validClient.instance.element().classList.contains('lowOpacity'),
      // valideEntrepot: !this.validEntrepot.instance.element().classList.contains('lowOpacity'),
      // valideFournisseur: !this.validFournisseur.instance.element().classList.contains('lowOpacity'),
    };

    this.planningTransporteursService.setPersisantVariables({
      dateMin: values.dateMin,
      dateMax: values.dateMax,
      societeCode: "%", // All companies
      transporteurCode: values.transporteurCode || '%',
      bureauAchatCode: values.bureauAchatCode || '%',
      // valideClient: values.valideClient,
      // valideEntrepot: values.valideEntrepot,
      // valideFournisseur: values.valideFournisseur,
    } as Inputs);

    // Filtering vs company
    const societe = this.currentCompanyService.getCompany().id;
    const filter = [
      ["ordre.statut", "<>", Statut.NON_CONFIRME], "and"
    ];
    if (societe === "BUK") filter.push(["ordre.type.id", "<>", "RGP"], "and");
    if (societe === "SA") filter.push(["ordre.type.id", "<>", "ORI"], "and");
    filter.pop();
    if (filter.length) this.ordresDataSource.filter(filter);

    this.datagrid.dataSource = this.ordresDataSource;

  }

  onRowDblClick(e) {
    let data = e.data.items ?? e.data.collapsedItems?.items;
    if (!data || !data[0]) return;
    data = data[0];
    // Open order (if from the current company)
    if (data.ordre?.societe.id === this.currentCompanyService.getCompany().id)
      this.tabContext.openOrdre(data.numero, data.ordre.campagne.id);
  }

  validOrAll(e) {
    this.validRequiredEntity[e.element.dataset.entity] =
      !this.validRequiredEntity[e.element.dataset.entity];
    const Element = e.element as HTMLElement;
    Element.classList.toggle("lowOpacity");
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

  onCellPrepared(e) {
    if (e.rowType === "data") {

      // Groupage
      if (e.column.dataField === "groupage" && e.value)
        e.cellElement.classList.add("transporteur-grouping");

      // Ordre
      if (e.column.dataField === "numero")
        e.cellElement.classList += " bold";
    }

    // Entrepot et numéro ordre
    if (e.column.dataField === "entrepotRaisonSocial" && e.value)
      e.cellElement.classList.add("entrepot-planning-transporteurs");
    if (e.column.dataField === "numero" && e.value) {
      e.cellElement.classList.add("numero-planning-transporteurs");
      e.cellElement.title = this.localizeService.localize("hint-dblClick-ordre");
    }
  }

  onRowPrepared(e) {
    // Highlight canceled orders
    if (["data", "group"].includes(e.rowType)) {
      let data = e.data.items ?? e.data.collapsedItems;
      data = (e.rowType === "data") ? e.data : data[0];
      if (data?.ordre?.flagAnnule === true) {
        e.rowElement.classList.add("canceled-orders");
        e.rowElement.title = this.localizeService.localize("ordre-annule");
      }
    }
  }

  calculateGroupage(data) {
    if (data.groupage) {
      const textGroupage = self.localizeService.localize("ordresTransporteur-groupage-text")
        .replace("&T", data.groupage)
        .replace(
          "&D",
          self.dateManagementService.formatDate(
            data.dateDepartPrevueGroupage,
            "dd-MM-yyyy"
          )
        )
      return textGroupage;
    }
  }

  calculateEspece(data) {
    // Ajout type palette
    return data.espece + "/" + data.palette;
  }

  calculateStatut(data) {
    // Best expression for order status display
    return self.statut[data.ordre.statut] ?? "";
  }

  calculateNumero(data) {
    // Ajout version ordre
    return data.numero + (data.version ? " - " + data.version : "");
  }

  calculateEntrepot(data) {
    // Ajout CP, ville et pays au lieu de livraison
    let title = `(Transp. : ${data.transporteur})`;
    if (data.entrepotCodePostal) {
      title += `  ${data?.entrepotRaisonSocial} - ${data.entrepotCodePostal} ${data.entrepotVille} (${data.entrepotPays})`;
    }
    return title;
  }

  onValideChanged(e) {
    if (!e.event) return; // Only user event
    this.formGroup.patchValue({
      transporteurCode: null,
    });
    this.transporteursDataSource = this.transporteursService.getDataSource_v2([
      "id",
      "raisonSocial",
      "valide",
    ]);
    if (this.formGroup.get("valide").value)
      this.transporteursDataSource.filter(["valide", "=", true]);
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

  displayIDBefore(data) {
    return data ? data.id + " - " + data.raisonSocial : null;
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

  private buildFilter(values: Inputs): any[] {
    const Filter = Utils.Api.Filter;

    return Utils.pipe(
      Filter.create
      // Filter.mergeIfValue.with([FormInput.valideClient, '=', values.valideClient]),
      // Filter.andMergeIfValue.with([FormInput.valideEntrepot, '=', values.valideEntrepot]),
      // Filter.andMergeIfValue.with([FormInput.valideFournisseur, '=', values.valideFournisseur]),
    );
  }
}

export default PlanningTransporteursComponent;
