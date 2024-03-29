import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { LocalizePipe } from "app/shared/pipes";
import { AuthService, LocalizationService } from "app/shared/services";
import {
  PlanningMaritimeService,
  PlanningSide,
} from "app/shared/services/api/planning-maritime.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../root/root.component";

enum FormInput {
  dateMin,
  dateMax,
}

type Inputs<T = any> = { [key in keyof typeof FormInput]: T };

@Component({
  selector: "app-planning-maritime",
  templateUrl: "./planning-maritime.component.html",
  styleUrls: ["./planning-maritime.component.scss"],
})
export class PlanningMaritimeComponent implements OnInit, AfterViewInit {
  private gridConfig: Promise<GridConfig>;
  public periodes: any;
  public titleElement: HTMLInputElement;
  public side = PlanningSide.Depart;
  public dateColumns: string[];
  public currCompanyId: string;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresDataSource: DataSource;
  public formGroup = new UntypedFormGroup({
    dateMin: new UntypedFormControl(this.dateManagementService.startOfDay()),
    dateMax: new UntypedFormControl(this.dateManagementService.endOfDay()),
  } as Inputs<UntypedFormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public planningMaritimeService: PlanningMaritimeService,
    public localizeService: LocalizationService,
    public gridUtilsService: GridUtilsService,
    public currentCompanyService: CurrentCompanyService,
    public dateManagementService: DateManagementService,
    private localizePipe: LocalizePipe,
    public authService: AuthService,
    public tabContext: TabContext
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.PlanningMaritime
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.dateColumns = ["dateDepartPrevueFournisseur", "dateLivraisonPrevue"];
    this.periodes = this.dateManagementService.periods();
    this.currCompanyId = this.currentCompanyService.getCompany().id;
  }

  ngOnInit() {
    this.formGroup.valueChanges.subscribe((_) => this.enableFilters());
  }

  ngAfterViewInit() {
    this.titleElement = this.datagrid.instance
      .$element()[0]
      .querySelector(".dx-toolbar .dx-placeholder") as HTMLInputElement;
    this.setDefaultPeriod(this.authService.currentUser?.periode ?? "J");
    this.authService.onUserChanged().subscribe(() =>
      this.setDefaultPeriod(this.authService.currentUser?.periode ?? "J")
    );
    this.enableFilters();
  }

  setDefaultPeriod(periodId) {
    let myPeriod = this.dateManagementService.getPeriodFromId(
      periodId,
      this.periodes
    );
    if (!myPeriod) return;
    this.periodeSB?.instance.option("value", myPeriod);
    const datePeriod = this.dateManagementService.getDates({
      value: myPeriod,
    });
    this.formGroup.patchValue({
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin,
    });
  }

  async enableFilters() {
    if (this.datagrid) {
      this.datagrid.dataSource = null;
    } else {
      return;
    }

    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    const values: Inputs = { ...this.formGroup.value };

    this.ordresDataSource = this.planningMaritimeService.getDataSource(
      {
        societeCode: this.currentCompanyService.getCompany().id,
        dateMin: values.dateMin,
        dateMax: values.dateMax,
      },
      new Set(await fields.toPromise()),
      this.side
    );
    this.datagrid.dataSource = this.ordresDataSource;
    this.datagrid.dataSource.load().then(() => this.updateTitleAndColumns());
  }

  updateTitleAndColumns() {
    const values: Inputs = { ...this.formGroup.value };
    if (this.titleElement)
      this.titleElement.innerHTML =
        this.gridUtilsService.customGridPlanningTitle(
          `grid-situation-${this.side.toLowerCase()}-maritime-title`,
          values.dateMin,
          values.dateMax
        );
    if (this.datagrid) {
      const dep = this.side === PlanningSide.Depart;
      this.datagrid.instance.columnOption(this.dateColumns[0], "visible", dep);
      this.datagrid.instance.columnOption(
        this.dateColumns[0],
        "sortIndex",
        dep ? 0 : null
      );
      this.datagrid.instance.columnOption(this.dateColumns[1], "visible", !dep);
      this.datagrid.instance.columnOption(
        "heureDepartPrevueFournisseur",
        "visible",
        dep
      );
      this.datagrid.instance.columnOption(
        this.dateColumns[1],
        "sortIndex",
        !dep ? 0 : null
      );
    }
  }

  onSideChange(e) {
    this.side = e.value ? PlanningSide.Arrive : PlanningSide.Depart;
    this.enableFilters();
  }

  onContentReady(e) {
    // To override a SaveGridConfig side effect
    if (
      this.side === PlanningSide.Depart &&
      !this.datagrid.instance.columnOption(this.dateColumns[0], "visible")
    )
      this.updateTitleAndColumns();
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Higlight important column
      if (this.dateColumns.includes(e.column.dataField))
        e.cellElement.classList.add("grey-normal-maritime");

      // Higlight important column
      if (e.column.dataField === "heureDepartPrevueFournisseur")
        e.cellElement.classList.add("grey-light-maritime");

      // No palette
      if (e.column.dataField === "nombrePalettesCommandees" && !e.value)
        e.cellElement.classList.add("bold-text");
    }
  }

  onCellDblClick(e) {
    if (e.data?.ordre.societe?.id !== this.currCompanyId) return;
    if (e.data.numeroOrdre && e.data.ordre?.campagne?.id)
      this.tabContext.openOrdre(e.data.numeroOrdre, e.data.ordre.campagne.id);
  }

  onRowPrepared(e) {
    if (
      e.rowType === "data" &&
      e.data.ordre?.societe?.id === this.currCompanyId
    ) {
      e.rowElement.classList.add("cursor-pointer");
      e.rowElement.setAttribute(
        "title",
        this.localizePipe.transform("hint-dblClick-ordre")
      );
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

  public calculateTime(e) {
    return e.dateDepartPrevueFournisseur?.split("T")[1];
  }

}

export default PlanningMaritimeComponent;
