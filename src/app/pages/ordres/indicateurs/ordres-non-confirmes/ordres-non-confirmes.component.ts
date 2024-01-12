import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { Role } from "app/shared/models";
import { Model, ModelFieldOptions } from "app/shared/models/model";
import Ordre from "app/shared/models/ordre.model";
import {
  AuthService,
  LocalizationService,
  TransporteursService,
} from "app/shared/services";
import { GridsConfigsService } from "app/shared/services/api/grids-configs.service";
import { Indicateur } from "app/shared/services/api/indicateurs.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import {
  Indicator,
  OrdresIndicatorsService,
} from "app/shared/services/ordres-indicators.service";
import { GridColumn } from "basic";
import {
  DxCheckBoxComponent,
  DxDataGridComponent,
  DxSelectBoxComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../root/root.component";
import { DateManagementService } from "app/shared/services/date-management.service";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";

enum FormInput {
  secteur = "secteur",
  dateMin = "dateDepartPrevueFournisseur",
  dateMax = "dateDepartPrevueFournisseur",
}

type Inputs<T = any> = { [key in keyof typeof FormInput]: T };

@Component({
  selector: "app-ordres-non-confirmes",
  templateUrl: "./ordres-non-confirmes.component.html",
  styleUrls: ["./ordres-non-confirmes.component.scss"],
})
export class OrdresNonConfirmesComponent implements AfterViewInit {
  readonly INDICATOR_NAME = Indicateur.OrdresNonConfirmes;
  options: {};
  secteurs: DataSource;
  indicator: Indicator;
  filter: any;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;
  rowSelected: boolean;

  @ViewChild("secteurValue", { static: false }) secteurSB: DxSelectBoxComponent;
  @ViewChild("withSector") withSector: DxCheckBoxComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild(DxDataGridComponent) grid: DxDataGridComponent;


  public dataSource: DataSource;
  initialFilterLengh: number;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public periodes: any;
  public formGroup = new UntypedFormGroup({
    secteur: new UntypedFormControl(),
    dateMin: new UntypedFormControl(),
    dateMax: new UntypedFormControl(),
  } as Inputs<UntypedFormControl>);


  constructor(
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public gridConfiguratorService: GridConfiguratorService,
    public secteursService: SecteursService,
    public currentCompanyService: CurrentCompanyService,
    public ordresService: OrdresService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    public dateManagementService: DateManagementService,
    private tabContext: TabContext
  ) {
    this.periodes = this.dateManagementService.periods();
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      ["societes", "contains", this.currentCompanyService.getCompany().id],
    ]);
    this.indicator = this.ordresIndicatorsService.getIndicatorByName(
      this.INDICATOR_NAME
    );
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdresNonConfirmes
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  ngAfterViewInit() {
    if (this.authService.currentUser.secteurCommercial)
      this.secteurSB.value = this.authService.currentUser.secteurCommercial;
    this.withSector.value = !this.authService.isAdmin;
    this.secteurSB.disabled = !this.withSector.value;

    this.setDefaultPeriod("J");
    // this.enableFilters();
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

  enableFilters() {
    this.grid.dataSource = null;
    this.dataSource = this.indicator.dataSource;
    const values: Inputs = {
      ...this.formGroup.value,
    };
    const filters = this.indicator.cloneFilter();
    if (this.secteurSB.value?.id && this.withSector.value)
      filters.push("and", ["secteurCode", "=", this.secteurSB.value.id]);
    else if (!this.authService.isAdmin)
      filters.push(
        ...(this.authService.currentUser.personne?.role.toString() ===
          Role[Role.COMMERCIAL]
          ? [
            "and",
            [
              "commercial.id",
              "=",
              this.authService.currentUser.commercial.id,
            ],
          ]
          : []),
        ...(this.authService.currentUser.personne?.role.toString() ===
          Role[Role.ASSISTANT]
          ? [
            "and",
            [
              "assistante.id",
              "=",
              this.authService.currentUser.assistante.id,
            ],
          ]
          : [])
      );

    if (values?.dateMin) filters.push(
      "and",
      [`dateCreation`, ">=", this.dateManagementService.formatDate(values.dateMin)],
    );
    if (values?.dateMax) filters.push(
      "and",
      [`dateCreation`, "<=", this.dateManagementService.formatDate(values.dateMax)],
    );
    this.dataSource?.filter(filters);
    this.grid.dataSource = this.dataSource;
  }

  onRowClick() {
    this.rowSelected = true;
  }

  onRowDblClick({ data }: { data: Partial<Ordre> }) {
    this.tabContext.openOrdre(data.numero, data.campagneId);
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
          .patchValue(new Date(deb));
      } else {
        this.formGroup
          .get("dateMin")
          .patchValue(new Date(fin));
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

}

export default OrdresNonConfirmesComponent;
