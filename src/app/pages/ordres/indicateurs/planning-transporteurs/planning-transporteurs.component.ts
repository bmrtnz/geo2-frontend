import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import Ordre from 'app/shared/models/ordre.model';
import { AuthService, LocalizationService, TransporteursService } from 'app/shared/services';
import { NativeOperation, OrdresService } from 'app/shared/services/api/ordres.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DateManagementService } from 'app/shared/services/date-management.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { GridColumn } from 'basic';
import { DxButtonComponent, DxDataGridComponent, DxSelectBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TabContext } from '../../root/root.component';

enum InputField {
  transporteur = 'transporteur.id',
  from = 'logistiques.dateDepartPrevueFournisseur',
  to = 'logistiques.dateDepartPrevueFournisseur',
}

enum validField {
  client = 'client.valide',
  entrepot = 'entrepot.valide',
  fournisseur = 'logistiques.fournisseur.valide',
}

type Inputs<T = any> = {[key in keyof typeof InputField]: T};

type PlanningTransporteursVariables = {
  dateMin: string,
  dateMax: string,
  societeCode: string,
  transporteurCode: string,
};

@Component({
  selector: 'app-planning-transporteurs',
  templateUrl: './planning-transporteurs.component.html',
  styleUrls: ['./planning-transporteurs.component.scss']
})
export class PlanningTransporteursComponent implements OnInit {
  readonly INDICATOR_NAME = 'PlanningTransporteurs';

  private indicator = this.ordresIndicatorsService
  .getIndicatorByName(this.INDICATOR_NAME);
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
    transporteur: new FormControl(),
    from: new FormControl(this.dateManagementService.startOfDay()),
    to: new FormControl(this.dateManagementService.endOfDay()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public ordresService: OrdresService,
    public transporteursService: TransporteursService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private ordresIndicatorsService: OrdresIndicatorsService,
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

    this.ordresDataSource = this.ordresService
    .getNativeDataSource(await fields.toPromise(), NativeOperation.PlanningTransporteurs);

    // Only way found to validate and show Warning icon
    this.formGroup.get('transporteur').setValue('');
    this.formGroup.get('transporteur').reset();
    // A VIRER !!!
    const date = new Date('2020/08/03');
    const date2 = new Date('2020/08/04');
    this.formGroup.get('from').setValue(this.dateManagementService.startOfDay(date));
    this.formGroup.get('to').setValue(this.dateManagementService.endOfDay(date2));


    this.formGroup.valueChanges.subscribe(_ => this.enableFilters());
    // A VIRER !!!
    this.formGroup.get('transporteur').setValue({id: 'VERAY'});

  }

  enableFilters() {
    if (!this.formGroup.get('transporteur').value) {
      notify('Veuillez spécifier un transporteur', 'error');
    } else {
      const values: Inputs = this.formGroup.value;

      this.ordresService.setPersisantVariables({
        dateMin: values.from,
        dateMax: values.to,
        societeCode: this.currentCompanyService.getCompany().id,
        transporteurCode: values.transporteur,
      } as PlanningTransporteursVariables);

      const filters = [];
      if (!this.validClient.instance.element().classList.contains('lowOpacity'))
        filters.push('and', ['client.valide', '=', true]);
      if (!this.validEntrepot.instance.element().classList.contains('lowOpacity'))
        filters.push('and', ['entrepot.valide', '=', true]);
      this.ordresDataSource.filter(filters.length ? filters.slice(1) : null);

      this.datagrid.dataSource = this.ordresDataSource;
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
    const deb = new Date(this.formGroup.get('from').value);
    const fin = new Date(this.formGroup.get('to').value);
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains('dateStart')) {
        this.formGroup.get('to').patchValue(this.dateManagementService.endOfDay(deb));
      } else {
        this.formGroup.get('from').patchValue(this.dateManagementService.startOfDay(fin));
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

  private buildFormFilter(values: Inputs): any[] {
    const filter = [];

    // Valid entities
    Object.keys(validField).map(entity => {
      if (this.validRequiredEntity[entity]) {
        filter.push([validField[entity], '=', 'true']);
      }
    });

    if (values.transporteur)
      filter.push([InputField.transporteur, '=', values.transporteur]);

    if (values.from)
      filter.push([InputField.from, '>=', values.from]);

    if (values.to)
      filter.push([InputField.to, '<=', values.to]);

    if (values.to)
    filter.push([InputField.to, '<=', values.to]);

    return filter.length
       ? filter.reduce((crt, acm) => [crt, 'and', acm])
       : null;

  }
}

export default PlanningTransporteursComponent;
