import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Ordre from 'app/shared/models/ordre.model';
import { AuthService, LocalizationService, TransporteursService } from 'app/shared/services';
import { Operation, OrdresService } from 'app/shared/services/api/ordres.service';
import { FormUtilsService } from 'app/shared/services/form-utils.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { GridColumn, ONE_DAY } from 'basic';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TabContext } from '../../root/root.component';

enum InputField {
  transporteur = 'transporteur.id',
  from = 'logistiques.dateDepartPrevueFournisseur',
  to = 'logistiques.dateDepartPrevueFournisseur',
}

type Inputs<T = any> = {[key in keyof typeof InputField]: T};

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

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  public ordresDataSource: DataSource;
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
    public authService: AuthService,
    public localizeService: LocalizationService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    private tabContext: TabContext,
    private formUtils: FormUtilsService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.PlanningTransporteurs);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
    this.transporteursDataSource = this.transporteursService
    .getDataSource_v2(['id', 'raisonSocial']);
  }

  async ngOnInit() {
    const fields = this.columns
    .pipe(map( columns => columns.map( column => column.dataField )));

    this.ordresDataSource = this.ordresService
    .getDataSource_v2(await fields.toPromise(), Operation.PlanningTransporteurs);
    this.formGroup.valueChanges.subscribe(_ => this.enableFilters());
    this.formGroup.updateValueAndValidity();
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
}

export default PlanningTransporteursComponent;
