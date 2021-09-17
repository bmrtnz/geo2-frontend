import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import {
  AuthService,
  LocalizationService,
  TransporteursService
} from 'app/shared/services';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import {
  Indicator,
  OrdresIndicatorsService
} from 'app/shared/services/ordres-indicators.service';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { DxoGridComponent } from 'devextreme-angular/ui/nested';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'ordres-non-clotures',
  templateUrl: './ordres-non-clotures.component.html',
  styleUrls: ['./ordres-non-clotures.component.scss'],
})
export class OrdresNonCloturesComponent implements OnInit, AfterViewInit {
  readonly INDICATOR_NAME = 'OrdresNonClotures';
  options: {};
  secteurs: DataSource;
  indicator: Indicator;
  filter: any;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;
  rowSelected: boolean;

  @ViewChild('gridORDRESNONCLOTURES', { static: false })
  gridSUPERVISIONComponent: DxoGridComponent;
  @ViewChild('secteurValue', { static: false }) secteurSB: DxSelectBoxComponent;

  public dataSource: DataSource;

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

  ngOnInit() {
    this.enableFilters();
  }

  ngAfterViewInit() {
    if (this.authService.currentUser.limitationSecteur) {
      this.secteurSB.value = this.authService.currentUser.secteurCommercial.id;
    }
  }

  enableFilters() {
    this.dataSource.filter(this.indicator.cloneFilter());
  }

  updateFilters() {
    const filters = this.indicator.cloneFilter();

    if (this.secteurSB.value)
      filters.push('and', [
        'secteurCommercial.id',
        '=',
        this.secteurSB.value.id,
      ]);
    this.dataSource.filter(filters);
    this.dataSource.reload();
  }

  onRowClick() {
    this.rowSelected = true;
  }

  onRowDblClick(event) {
    window.sessionStorage.setItem('orderNumber', JSON.stringify(event));
    this.router.navigate([`/ordres/details`]);
  }
}
