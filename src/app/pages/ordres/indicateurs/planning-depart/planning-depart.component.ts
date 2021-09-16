import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { LocalizePipe } from 'app/shared/pipes';
import {
  AuthService,
  LocalizationService,
  TransporteursService,
} from 'app/shared/services';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import {
  Indicator,
  OrdresIndicatorsService,
} from 'app/shared/services/ordres-indicators.service';
import {
  DxCheckBoxComponent,
  DxDataGridComponent,
  DxNumberBoxComponent,
  DxSelectBoxComponent,
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'planning-depart',
  templateUrl: './planning-depart.component.html',
  styleUrls: ['./planning-depart.component.scss'],
})
export class PlanningDepartComponent implements AfterViewInit {
  readonly INDICATOR_NAME = 'PlanningDepart';
  options: {};
  secteurs: DataSource;
  indicator: Indicator;
  filter: any;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;
  rowSelected: boolean;

  @ViewChild('gridPLANNINGDEPART', { static: false })
  gridPLANNINGDEPARTComponent: DxDataGridComponent;
  @ViewChild('secteurValue', { static: false }) secteurSB: DxSelectBoxComponent;
  @ViewChild('diffCheckBox', { static: false }) diffCB: DxCheckBoxComponent;
  @ViewChild('daysOfService', { static: false }) daysNB: DxNumberBoxComponent;

  public dataSource: DataSource;
  initialFilterLengh: number;
  public title: string;
  private dxGridElement: HTMLElement;
  readonly DAYSNB_DEFAULT = 1;

  constructor(
    private router: Router,
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public gridConfiguratorService: GridConfiguratorService,
    public secteursService: SecteursService,
    public currentCompanyService: CurrentCompanyService,
    public ordresService: OrdresService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    private ordresIndicatorsService: OrdresIndicatorsService,
    private datePipe: DatePipe,
    private localizePipe: LocalizePipe
  ) {
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ['valide', '=', true],
      'and',
      ['societes', 'contains', this.currentCompanyService.getCompany().id],
    ]);
    this.indicator = this.ordresIndicatorsService.getIndicatorByName(
      this.INDICATOR_NAME
    );
    this.detailedFields = this.indicator.detailedFields;
    this.dataSource = this.indicator.dataSource;
  }

  ngAfterViewInit() {
    this.dxGridElement =
      this.gridPLANNINGDEPARTComponent.instance.$element()[0];
    if (this.authService.currentUser.limitationSecteur) {
      this.secteurSB.value = this.authService.currentUser.secteurCommercial.id;
    }
  }

  enableFilters() {
    const filters = this.indicator.cloneFilter();
    this.initialFilterLengh = filters.length;

    filters.push('and', [
      'logistiques.dateDepartPrevueFournisseur',
      '>=',
      this.getDaysNB(),
    ]);

    this.dataSource.filter(filters);

    this.title = this.localizePipe.transform('grid-situation-depart-title-today');
  }

  updateFilters() {
    const filters = this.indicator.cloneFilter();
    if (this.secteurSB.value)
      filters.push('and', [
        'secteurCommercial.id',
        '=',
        this.secteurSB.value.id,
      ]);
    filters.push('and', [
      'logistiques.dateDepartPrevueFournisseur',
      '>=',
      this.getDaysNB(),
    ]);
    if (this.diffCB.value)
      filters.push('and', [
        ['versionDetail', 'isnull', 'null'],
        'or',
        ['versionDetail', '<', '001'],
      ]);
    this.ordresService.persistantVariables.onlyColisDiff = this.diffCB.value;

    this.dataSource.filter(filters);
    this.dataSource.reload();

    const from = this.datePipe.transform(
      new Date()
        .setDate(
          new Date().getDate() - this.daysNB.value ?? this.DAYSNB_DEFAULT
        )
        .valueOf());
    /* tslint:disable-next-line max-line-length */
    this.title = `${this.localizePipe.transform('grid-situation-depart-title')} ${this.localizePipe.transform('du')} ${from} ${this.localizePipe.transform('au')} ${this.datePipe.transform(
      Date.now()
    )}`;
    (
      this.dxGridElement.querySelector(
        '.dx-toolbar .dx-texteditor-input'
      ) as HTMLInputElement
    ).value = this.title;
  }

  onRowClick(event) {
    this.rowSelected = true;
  }

  onRowDblClick(e) {
    window.sessionStorage.setItem('orderNumber', JSON.stringify(e));
    this.router.navigate([`/ordres/details`]);
  }

  onDaysOfServiceInputReady() {
    this.enableFilters();
  }

  getDaysNB() {
    return this.datePipe.transform(
      new Date()
        .setDate(
          new Date().getDate() - this.daysNB.value ?? this.DAYSNB_DEFAULT
        )
        .valueOf(),
      'yyyy-MM-dd'
    );
  }
}
