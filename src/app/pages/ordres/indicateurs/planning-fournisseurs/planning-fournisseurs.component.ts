import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Ordre from 'app/shared/models/ordre.model';
import { AuthService, LocalizationService, TransporteursService } from 'app/shared/services';
import { Operation, OrdresService } from 'app/shared/services/api/ordres.service';
import { FormUtilsService } from 'app/shared/services/form-utils.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { GridColumn, ONE_DAY } from 'basic';
import { DxDataGridComponent, DxSelectBoxComponent, DxCheckBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TabContext } from '../../root/root.component';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DateManagementService } from 'app/shared/services/date-management.service';

enum InputField {
  transporteur = 'transporteur.id',
  from = 'logistiques.dateDepartPrevueFournisseur',
  to = 'logistiques.dateDepartPrevueFournisseur',
}

type Inputs<T = any> = {[key in keyof typeof InputField]: T};

@Component({
  selector: 'app-planning-fournisseurs',
  templateUrl: './planning-fournisseurs.component.html',
  styleUrls: ['./planning-fournisseurs.component.scss']
})
export class PlanningFournisseursComponent implements OnInit, AfterViewInit {
  readonly INDICATOR_NAME = 'PlanningFournisseurs';

  private indicator = this.ordresIndicatorsService
  .getIndicatorByName(this.INDICATOR_NAME);
  private gridConfig: Promise<GridConfig>;
  public periodes: any;
  public dateStart: any;
  public dateEnd: any;

  public planningFournisseursTypes = [{
      id: 1,
      name: 'Résumé'
  }];

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild('secteurValue', { static: false }) secteurSB: DxSelectBoxComponent;
  @ViewChild('dateStartValue', { static: false }) dateStartSB: DxSelectBoxComponent;
  @ViewChild('dateEndValue', { static: false }) dateEndSB: DxSelectBoxComponent;
  @ViewChild('periodeValue', { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild('prices', { static: false }) prices: DxCheckBoxComponent;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresDataSource: DataSource;
  public secteurs: DataSource;
  public transporteursDataSource: DataSource;
  public formGroup = new FormGroup({
    transporteur: new FormControl(),
    from: new FormControl(new Date(Date.now() - ONE_DAY).toISOString()),
    to: new FormControl(new Date().toISOString()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public ordresService: OrdresService,
    public transporteursService: TransporteursService,
    public secteursService: SecteursService,
    public authService: AuthService,
    public dateManagementService: DateManagementService,
    public localizeService: LocalizationService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    public currentCompanyService: CurrentCompanyService,
    private tabContext: TabContext,
    private formUtils: FormUtilsService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.PlanningFournisseurs);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
    this.transporteursDataSource = this.transporteursService
    .getDataSource_v2(['id', 'raisonSocial']);
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ['valide', '=', true],
      'and',
      ['societes', 'contains', this.currentCompanyService.getCompany().id]
    ]);
    this.periodes = this.dateManagementService.periods();
    this.dateStart = this.dateManagementService.formatDate(Date.now());
    this.dateEnd = this.dateStart;
  }

  async ngOnInit() {
    const fields = this.columns
    .pipe(map( columns => columns.map( column => column.dataField )));

    this.ordresDataSource = this.ordresService
    .getDataSource_v2(await fields.toPromise(), Operation.PlanningFournisseurs);
    this.formGroup.valueChanges.subscribe(_ => this.enableFilters());
    this.formGroup.updateValueAndValidity();
  }

  ngAfterViewInit() {

    this.secteurSB.value = {
      id : this.authService.currentUser.secteurCommercial.id,
      description : this.authService.currentUser.secteurCommercial.description
    };

  }

  enableFilters() {
    const values: Inputs = this.formGroup.value;
    const extraFilters = this.buildFormFilter(values);
    this.ordresDataSource.filter([
      ...this.indicator.cloneFilter(),
      ...extraFilters.filter(v => v != null).length
        ? ['and', ...extraFilters]
        : [],
    ]);
    this.datagrid.dataSource = this.ordresDataSource;
  }

  onSecteurChange() {
    this.updateFilters();
  }

  updateFilters() {}

  showPrices() {
    console.log(this.prices.instance.option('value'));
  }

  onRowDblClick({data}: {data: Ordre}) {
    this.tabContext.openOrdre(data.numero);
  }

  private buildFormFilter(values: Inputs): any[] {
    const filter = [];

    if (values.transporteur)
      filter.push([InputField.transporteur, '=', values.transporteur]);

    if (values.from)
      filter.push([InputField.from, '>=', values.from]);

    if (values.to)
      filter.push([InputField.to, '<=', values.to]);

    return filter.length
       ? filter.reduce((crt, acm) => [crt, 'and', acm])
       : null;
  }

  manualDate(e) {

    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.dateStartSB.value);
    const fin = new Date(this.dateEndSB.value);
    const diffJours = fin.getDate() - deb.getDate();

    if (diffJours < 0) {
      if (e.element.classList.contains('dateStart')) {
        this.dateEndSB.value = this.dateStartSB.value;
      } else {
        this.dateStartSB.value = this.dateEndSB.value;
      }
    }

    this.periodeSB.value = null;
    this.updateFilters();

  }

  setDates(e) {

    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;
    const datePeriod = this.dateManagementService.getDates(e);

    this.dateStartSB.value = datePeriod.dateDebut;
    this.dateEndSB.value = datePeriod.dateFin;

    this.updateFilters();

  }

}

export default PlanningFournisseursComponent;
