import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, NgForm } from "@angular/forms";
import {
  FournisseursService,
  LocalizationService,
  TransporteursService
} from "app/shared/services";
import { RepartitionOrdresRegroupementService } from "app/shared/services/api/repartition-ordres-regroupement.service"
import { PersonnesService } from "app/shared/services/api/personnes.service";
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
import {concat, from, lastValueFrom, Observable} from "rxjs";
import { map } from "rxjs/operators";

enum FormInput {
  dateMin = "dateDepartPrevueFournisseur",
  dateMax = "dateDepartPrevueFournisseur",
  transporteurCode = "transporteur",
  stationCode = "station",
  commercialCode = "commercial",
}

type Inputs<T = any> = { [key in keyof typeof FormInput]: T };

@Component({
  selector: "app-repartition-ordres-regroupement",
  templateUrl: "./repartition-ordres-regroupement.component.html",
  styleUrls: ["./repartition-ordres-regroupement.component.scss"],
})
export class RepartitionOrdresRegroupementComponent {
  private gridConfig: Promise<GridConfig>;
  public periodes: any;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("filterForm") filterForm: NgForm;
  @ViewChild("validFournisseur") validFournisseur: DxButtonComponent;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresRegroupementDataSource: DataSource;
  public formGroup = new UntypedFormGroup({
  transporteurCode: new UntypedFormControl(),
  stationCode: new UntypedFormControl(),
  commercialCode: new UntypedFormControl(),
  dateMin: new UntypedFormControl(this.dateManagementService.startOfDay()),
  dateMax: new UntypedFormControl(this.dateManagementService.endOfDay()),
} as Inputs<UntypedFormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public dateManagementService: DateManagementService,
    public localizeService: LocalizationService,

    private repartitionOrdresRegroupement: RepartitionOrdresRegroupementService,
    private transporteursService: TransporteursService,
    private personnesService: PersonnesService,
    private stationsService: FournisseursService,

  ) {
    this.gridConfig = this.gridConfiguratorService.fetchConfig(
      Grid.OrdresRegroupement
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  async ngOnInit() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    this.ordresRegroupementDataSource = this.repartitionOrdresRegroupement.getDataSource_v2(
      await lastValueFrom(fields)
    );
  }

  public transporteursDataSource = this.transporteursService.getDataSource_v2([
    "id",
    "raisonSocial",
    "valide",
  ]);

  public stationsDataSource = this.stationsService.getDataSource_v2([
    "id",
    "code"
  ]);

  public commerciauxDataSource = this.personnesService.getDataSource_v2([
    "id",
    "nomUtilisateur",
  ]);

  // ngAfterViewInit() {
  //   //this.setDefaultPeriod(this.authService.currentUser?.periode ?? "J");
  // }

  async enableFilters() {

      const values: Inputs = {
        ...this.formGroup.value,
      };

      const fields =
        this.columns.pipe(
          map((columns) => columns.map((column) => column.dataField))
        );

      console.log(values);

      this.repartitionOrdresRegroupement.setPersisantVariables({
        dateMin: values.dateMin,
        dateMax: values.dateMax,
        transporteurCode: values.transporteurCode,
        stationCode: values.stationCode,
        commercialCode: values.commercialCode
      } as Inputs);

      this.datagrid.dataSource = this.ordresRegroupementDataSource;

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
  }

  displayIDBefore(data) {
    return data ? data.id + " - " + data.raisonSocial : null;
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

export default RepartitionOrdresRegroupementComponent;
