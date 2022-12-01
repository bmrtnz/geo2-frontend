import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, NgForm } from "@angular/forms";
import { Statut } from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { PlanningTransporteursService } from "app/shared/services/api/planning-transporteurs.service";
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
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

enum FormInput {
  dateMin = "dateDepartPrevueFournisseur",
  dateMax = "dateDepartPrevueFournisseur"
}

type Inputs<T = any> = { [key in keyof typeof FormInput]: T };

@Component({
  selector: "app-planning-departs-maritimes",
  templateUrl: "./planning-departs-maritimes.component.html",
  styleUrls: ["./planning-departs-maritimes.component.scss"]
})

export class PlanningDepartsMaritimesComponent implements OnInit {

  private gridConfig: Promise<GridConfig>;
  public periodes: any;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("filterForm") filterForm: NgForm;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresDataSource: DataSource;
  public formGroup = new FormGroup({
    dateMin: new FormControl(this.dateManagementService.startOfDay()),
    dateMax: new FormControl(this.dateManagementService.endOfDay()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public planningTransporteursService: PlanningTransporteursService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchConfig(
      Grid.PlanningDepartsMaritimes,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
    this.periodes = this.dateManagementService.periods();
  }

  async ngOnInit() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField)),
    );

    this.ordresDataSource =
      this.planningTransporteursService.getDataSource_v2(
        await fields.toPromise(),
      );

    this.formGroup.valueChanges.subscribe((_) => this.enableFilters());
  }

  enableFilters() {
    // const values: Inputs = {
    //   ...this.formGroup.value
    // };

    // this.planningTransporteursService.setPersisantVariables({
    //   dateMin: values.dateMin,
    //   dateMax: values.dateMax,
    //   societeCode: "%", // All companies
    // } as Inputs);

    // this.datagrid.dataSource = this.ordresDataSource;
  }

  onRowDblClick(e) {
    // if (data.ordre?.societe.id === this.currentCompanyService.getCompany().id)
    //   this.tabContext.openOrdre(data.numero, data.ordre.campagne.id);
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

}

export default PlanningDepartsMaritimesComponent;
