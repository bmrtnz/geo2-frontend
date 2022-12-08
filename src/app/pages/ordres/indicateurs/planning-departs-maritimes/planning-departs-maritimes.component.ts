import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, NgForm } from "@angular/forms";
import { LocalizationService } from "app/shared/services";
import { PlanningDepartMaritimeService } from "app/shared/services/api/planning-depart-maritime.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
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

export class PlanningDepartsMaritimesComponent implements OnInit, AfterViewInit {

  private gridConfig: Promise<GridConfig>;
  public periodes: any;
  public titleElement: HTMLInputElement;

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
    public planningDepartMaritimeService: PlanningDepartMaritimeService,
    public localizeService: LocalizationService,
    public gridUtilsService: GridUtilsService,
    public currentCompanyService: CurrentCompanyService,
    public dateManagementService: DateManagementService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.PlanningDepartsMaritimes,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );

    this.periodes = this.dateManagementService.periods();
  }

  ngOnInit() {
    this.formGroup.valueChanges.subscribe((_) => this.enableFilters());
    this.enableFilters();
  }

  ngAfterViewInit() {
    this.titleElement = this.datagrid.instance.$element()[0].querySelector(
      ".dx-toolbar .dx-placeholder",
    ) as HTMLInputElement;
    // Customizing grid title with period/date
    this.titleElement.innerHTML = this.gridUtilsService
      .customGridPlanningTitle("grid-situation-depart-maritime-title");
  }

  async enableFilters() {

    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField)),
    );

    const values: Inputs = {
      ...this.formGroup.value
    };

    // Customizing grid title with period/date
    if (this.titleElement)
      this.titleElement.innerHTML = this.gridUtilsService
        .customGridPlanningTitle("grid-situation-depart-maritime-title", values.dateMin, values.dateMax);

    this.ordresDataSource =
      this.planningDepartMaritimeService.getDataSource(
        {
          societeCode: this.currentCompanyService.getCompany().id,
          dateMin: values.dateMin,
          dateMax: values.dateMax
        },
        new Set(await fields.toPromise()),
      );
    this.datagrid.dataSource = this.ordresDataSource;
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {

      // Higlight important column
      if (e.column.dataField === "dateDepartPrevueFournisseur")
        e.cellElement.classList.add("grey-normal-depart");

      // Higlight important column
      if (e.column.dataField === "dateDepartPrevueFournisseurRaw")
        e.cellElement.classList.add("grey-light-depart");

      // No palette
      if (e.column.dataField === "nombrePalettesCommandees" && !e.value)
        e.cellElement.classList.add("bold-text");

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

}

export default PlanningDepartsMaritimesComponent;
