import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import Ordre from 'app/shared/models/ordre.model';
import { AuthService, LocalizationService, TransporteursService } from 'app/shared/services';
import { PlanningTransporteursService } from 'app/shared/services/api/planning-transporteurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DateManagementService } from 'app/shared/services/date-management.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridColumn } from 'basic';
import { DxButtonComponent, DxDataGridComponent, DxSelectBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Utils from 'Utils';
import { TabContext } from '../../root/root.component';

enum FormInput {
  transporteurCode = 'transporteur',
  dateMin = 'dateDepartPrevueFournisseur',
  dateMax = 'dateDepartPrevueFournisseur',
  // valideClient = 'valideClient',
  // valideEntrepot = 'valideEntrepot',
  // valideFournisseur = 'valideFournisseur',
  societeCode = 'societe',
}

type Inputs<T = any> = {[key in keyof typeof FormInput]: T};

@Component({
  selector: 'app-planning-transporteurs',
  templateUrl: './planning-transporteurs.component.html',
  styleUrls: ['./planning-transporteurs.component.scss']
})
export class PlanningTransporteursComponent implements OnInit {

  private gridConfig: Promise<GridConfig>;
  public periodes: any;
  public validRequiredEntity: {};

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild('periodeSB', { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild('filterForm') filterForm: NgForm;
  @ViewChild('validClient') validClient: DxButtonComponent;
  @ViewChild('validEntrepot') validEntrepot: DxButtonComponent;
  @ViewChild('validFournisseur') validFournisseur: DxButtonComponent;

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
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private tabContext: TabContext,
    private currentCompanyService: CurrentCompanyService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.PlanningTransporteurs);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
    this.transporteursDataSource = this.transporteursService
    .getDataSource_v2(['id', 'raisonSocial']);
    this.periodes = this.dateManagementService.periods();
    this.validRequiredEntity = {client: true, entrepot: true, fournisseur: true};
  }

  async ngOnInit() {
    const fields = this.columns
    .pipe(map( columns => columns.map( column => column.dataField )));

    this.ordresDataSource = this.planningTransporteursService
    .getDataSource_v2(await fields.toPromise());

    // Only way found to validate and show Warning icon
    this.formGroup.get('transporteurCode').setValue('');
    this.formGroup.get('transporteurCode').reset();
    this.formGroup.valueChanges.subscribe(_ => this.enableFilters());
  }

  enableFilters() {
    if (!this.formGroup.get('transporteurCode').value) {
      notify('Veuillez spécifier un transporteur', 'error');
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
        societeCode: this.currentCompanyService.getCompany().id,
        transporteurCode: values.transporteurCode,
        // valideClient: values.valideClient,
        // valideEntrepot: values.valideEntrepot,
        // valideFournisseur: values.valideFournisseur,
      } as Inputs);

      this.datagrid.dataSource = this.ordresDataSource;
      // this.ordresDataSource.filter(this.buildFilter(values));
    }
  }

  onRowDblClick({data}: {data: Ordre}) {
    this.tabContext.openOrdre(data.numero);
  }

  validOrAll(e) {
    this.validRequiredEntity[e.element.dataset.entity] = !this.validRequiredEntity[e.element.dataset.entity];
    const Element = e.element as HTMLElement;
    Element.classList.toggle('lowOpacity');
    this.enableFilters();
  }

  displayCodeBefore(data) {
    return data ?
    ((data.code ? data.code : data.id) + ' ' + (data.nomUtilisateur ? data.nomUtilisateur :
     (data.raisonSocial ? data.raisonSocial : data.description)))
     : null;
  }

  manualDate(e) {

    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.formGroup.get('dateMin').value);
    const fin = new Date(this.formGroup.get('dateMax').value);
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains('dateStart')) {
        this.formGroup.get('dateMax').patchValue(this.dateManagementService.endOfDay(deb));
      } else {
        this.formGroup.get('dateMin').patchValue(this.dateManagementService.startOfDay(fin));
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
      to: datePeriod.dateFin
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
