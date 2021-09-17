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
  selector: 'app-clients-dep-encours',
  templateUrl: './clients-dep-encours.component.html',
  styleUrls: ['./clients-dep-encours.component.scss']
})
export class ClientsDepEncoursComponent implements AfterViewInit {
  readonly INDICATOR_NAME = 'ClientsDepEncours';

  secteurs: DataSource;
  indicator: Indicator;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  @ViewChild('secteurValue', { static: false }) secteurSB: DxSelectBoxComponent;

  public dataSource: DataSource;
  public title: string;

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
  }

  ngAfterViewInit() {
    if (this.authService.currentUser.limitationSecteur) {
      this.secteurSB.value = this.authService.currentUser.secteurCommercial.id;
    }
    this.enableFilters();
  }

  enableFilters() {
    const filters = this.indicator.cloneFilter();
    this.dataSource = this.indicator.dataSource;
    this.dataSource.filter(filters);
  }

  updateFilters() {
    const filters = this.indicator.cloneFilter();
    if (this.secteurSB.value)
      filters.push('and', [
        'clients.secteur.id',
        '=',
        this.secteurSB.value.id,
      ]);
    this.dataSource.filter(filters);
    this.dataSource.reload();
  }
}
