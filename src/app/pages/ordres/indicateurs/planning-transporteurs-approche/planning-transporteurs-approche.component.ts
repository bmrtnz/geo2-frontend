import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, NgForm } from "@angular/forms";
import Ordre from "app/shared/models/ordre.model";
import {
  AuthService,
  LocalizationService,
  TransporteursService,
} from "app/shared/services";
import {
  Operation,
  OrdresService,
} from "app/shared/services/api/ordres.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
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
  DxFormComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../root/root.component";
import { DateManagementService } from "app/shared/services/date-management.service";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import notify from "devextreme/ui/notify";

enum InputField {
  bureauAchat = "logistiques.fournisseur.bureauAchat",
  transporteur = "transporteur.id",
  from = "logistiques.dateDepartPrevueFournisseur",
  to = "logistiques.dateDepartPrevueFournisseur",
}

enum validField {
  client = "client.valide",
  entrepot = "entrepot.valide",
  fournisseur = "logistiques.fournisseur.valide",
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-planning-transporteurs-approche",
  templateUrl: "./planning-transporteurs-approche.component.html",
  styleUrls: ["./planning-transporteurs-approche.component.scss"],
})
export class PlanningTransporteursApprocheComponent implements OnInit {
  readonly INDICATOR_NAME = "PlanningTransporteursApproche";

  private indicator = this.ordresIndicatorsService.getIndicatorByName(
    this.INDICATOR_NAME,
  );
  private gridConfig: Promise<GridConfig>;
  public periodes: any;
  public validRequiredEntity: {};

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("filterForm") filterForm: NgForm;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresDataSource: DataSource;
  public transporteursDataSource: DataSource;
  public bureauxAchat: DataSource;
  public formGroup = new UntypedFormGroup({
    bureauAchat: new UntypedFormControl(),
    transporteur: new UntypedFormControl(),
    from: new UntypedFormControl(this.dateManagementService.startOfDay()),
    to: new UntypedFormControl(this.dateManagementService.endOfDay()),
  } as Inputs<UntypedFormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public ordresService: OrdresService,
    public transporteursService: TransporteursService,
    public bureauxAchatService: BureauxAchatService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    private tabContext: TabContext,
    private formUtils: FormUtilsService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.PlanningTransporteurs,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
    this.transporteursDataSource =
      this.transporteursService.getDataSource_v2(["id", "raisonSocial"]);
    this.periodes = this.dateManagementService.periods();
    this.bureauxAchat = bureauxAchatService.getDataSource_v2([
      "id",
      "raisonSocial",
    ]);
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

    this.ordresDataSource = this.ordresService
      // .getDataSource_v2(await fields.toPromise(), Operation.PlanningTransporteursApproche);
      .getDataSource_v2(await fields.toPromise());
    // Only way found to validate and show Warning icon
    this.formGroup.get("transporteur").setValue("");
    this.formGroup.get("transporteur").reset();
    this.formGroup.valueChanges.subscribe((_) => this.enableFilters());
  }

  enableFilters() {
    // if (!this.formGroup.get('transporteur').value) {
    //   notify('Veuillez spécifier un transporteur', 'error');
    // } else {
    const values: Inputs = this.formGroup.value;
    const extraFilters = this.buildFormFilter(values);
    this.ordresDataSource.filter([
      ...this.indicator.cloneFilter(),
      ...(extraFilters.filter((v) => v != null).length
        ? ["and", ...extraFilters]
        : []),
    ]);
    this.datagrid.dataSource = this.ordresDataSource;
    // }
  }

  onRowDblClick({ data }: { data: Partial<Ordre> }) {
    this.tabContext.openOrdre(data.numero, data.campagne.id);
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

  validOrAll(e) {
    this.validRequiredEntity[e.element.dataset.entity] =
      !this.validRequiredEntity[e.element.dataset.entity];
    const Element = e.element as HTMLElement;
    Element.classList.toggle("lowOpacity");
    this.enableFilters();
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

  private buildFormFilter(values: Inputs): any[] {
    const filter = [];

    // Valid entities
    Object.keys(validField).map((entity) => {
      if (this.validRequiredEntity[entity]) {
        filter.push([validField[entity], "=", "true"]);
      }
    });

    if (values.transporteur)
      filter.push([InputField.transporteur, "=", values.transporteur]);

    if (values.from) filter.push([InputField.from, ">=", values.from]);

    if (values.to) filter.push([InputField.to, "<=", values.to]);

    if (values.to) filter.push([InputField.to, "<=", values.to]);

    return filter.length
      ? filter.reduce((crt, acm) => [crt, "and", acm])
      : null;
  }
}

export default PlanningTransporteursApprocheComponent;
