import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, NgForm } from "@angular/forms";
import { Statut } from "app/shared/models/ordre.model";
import {
  AuthService,
  LocalizationService,
  TransporteursService,
} from "app/shared/services";
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

enum FormInput {
  transporteurCode = "transporteur",
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
export class PlanningTransporteursComponent implements OnInit {
  private gridConfig: Promise<GridConfig>;
  public periodes: any;
  public validRequiredEntity: {};

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("filterForm") filterForm: NgForm;
  @ViewChild("validClient") validClient: DxButtonComponent;
  @ViewChild("validEntrepot") validEntrepot: DxButtonComponent;
  @ViewChild("validFournisseur") validFournisseur: DxButtonComponent;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresDataSource: DataSource;
  public transporteursDataSource: DataSource;
  public formGroup = new FormGroup({
    transporteurCode: new FormControl(),
    dateMin: new FormControl(this.dateManagementService.startOfDay()),
    dateMax: new FormControl(this.dateManagementService.endOfDay()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public planningTransporteursService: PlanningTransporteursService,
    public transporteursService: TransporteursService,
    public authService: AuthService,
    public gridsService: GridsService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private tabContext: TabContext,
    private currentCompanyService: CurrentCompanyService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchConfig(
      Grid.PlanningTransporteurs,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
    this.transporteursDataSource =
      this.transporteursService.getDataSource_v2(["id", "raisonSocial"]);
    this.periodes = this.dateManagementService.periods();
    this.validRequiredEntity = {
      client: true,
      entrepot: true,
      fournisseur: true,
    };
  }

  async ngOnInit() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField)),
    );

    this.ordresDataSource =
      this.planningTransporteursService.getDataSource_v2(
        await fields.toPromise(),
      );

    // Only way found to validate and show Warning icon
    this.formGroup.get("transporteurCode").setValue("");
    this.formGroup.get("transporteurCode").reset();
    this.formGroup.valueChanges.subscribe((_) => this.enableFilters());
  }

  enableFilters() {
    if (!this.formGroup.get("transporteurCode").value) {
      notify("Veuillez spécifier un transporteur", "error");
    } else {
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
        // societeCode: this.currentCompanyService.getCompany().id,
        transporteurCode: values.transporteurCode,
        // valideClient: values.valideClient,
        // valideEntrepot: values.valideEntrepot,
        // valideFournisseur: values.valideFournisseur,
      } as Inputs);

      this.datagrid.dataSource = this.ordresDataSource;
      this.ordresDataSource.filter(["sommeColisPaletteBis", "<>", 0]);
    }
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
    this.enableFilters();
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

      // Best expression for order status display
      if (e.column.dataField === "ordre.statut") {
        if (Statut[e.value]) e.cellElement.innerText = Statut[e.value];
      }

      // Ajout CP, ville et pays au lieu de livraison
      if (e.column.dataField === "entrepotRaisonSocial") {
        if (e.data.entrepotCodePostal) {
          e.cellElement.innerText +=
            " - " +
            e.data.entrepotCodePostal +
            " " +
            e.data.entrepotVille +
            " (" +
            e.data.entrepotPays +
            ")";
        }
      }
      // Ajout version ordre
      if (e.column.dataField === "numero") {
        e.cellElement.innerText += (e.data.version ? " - " + e.data.version : "");
        e.cellElement.classList += " bold";
      }
      // Ajout type colis
      if (e.column.dataField === "sommeColisCommandes") {
        e.cellElement.innerText += " / " + e.data.colis;
      }
      // Ajout type palette
      if (e.column.dataField === "espece") {
        e.cellElement.innerText += " / " + e.data.palette;
      }
      // Best expression for date
      if (
        e.column.dataField === "dateLivraisonPrevue" ||
        e.column.dataField === "dateDepartPrevueFournisseur"
      ) {
        if (e.value)
          e.cellElement.innerText =
            this.dateManagementService.formatDate(
              e.value,
              "dd-MM-yyyy",
            );
      }
    }

    // Ajout CP, ville et pays au lieu de livraison nom groupe
    if (e.rowType === "group") {
      if (e.data.items && e.column.dataField === "entrepotRaisonSocial") {
        if (e.data.items[0]?.entrepotCodePostal) {
          e.cellElement.innerText +=
            " - " +
            e.data.items[0].entrepotCodePostal +
            " " +
            e.data.items[0].entrepotVille +
            " (" +
            e.data.items[0].entrepotPays +
            ")";
        }
        e.cellElement.classList.add("entrepot-planning-transporteurs");
      }
      if (e.data.items && e.column.dataField === "numero") {
        e.cellElement.classList.add("numero-planning-transporteurs");
      }
    }
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      e.rowElement.classList.add("highlight-order-row");
    }
    // Highlight canceled orders
    if (["data", "group"].includes(e.rowType)) {
      if (e.data?.flagAnnule === true) {
        e.rowElement.classList.add("canceled-orders");
        e.rowElement.title = this.localizeService.localize("ordre-annule");
      }
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
      Filter.create,
      // Filter.mergeIfValue.with([FormInput.valideClient, '=', values.valideClient]),
      // Filter.andMergeIfValue.with([FormInput.valideEntrepot, '=', values.valideEntrepot]),
      // Filter.andMergeIfValue.with([FormInput.valideFournisseur, '=', values.valideFournisseur]),
    );
  }
}

export default PlanningTransporteursComponent;
