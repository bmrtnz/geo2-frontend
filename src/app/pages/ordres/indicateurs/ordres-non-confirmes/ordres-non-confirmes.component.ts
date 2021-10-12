import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { AuthService, LocalizationService, TransporteursService } from 'app/shared/services';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { Indicator, OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { DxoGridComponent } from 'devextreme-angular/ui/nested';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { TabContext } from '../../root/root.component';

@Component({
  selector: 'ordres-non-confirmes',
  templateUrl: './ordres-non-confirmes.component.html',
  styleUrls: ['./ordres-non-confirmes.component.scss'],
})
export class OrdresNonConfirmesComponent implements OnInit, AfterViewInit {
  readonly INDICATOR_NAME = 'OrdresNonConfirmes';
  options: {};
  secteurs: DataSource;
  indicator: Indicator;
  filter: any;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;
  rowSelected: boolean;

  @ViewChild('gridORDRESNONCONFIRMES', { static: false })
  gridSUPERVISIONComponent: DxoGridComponent;
  @ViewChild('secteurValue', { static: false }) secteurSB: DxSelectBoxComponent;

  public dataSource: DataSource;
  initialFilterLengh: number;

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
    private tabContext: TabContext,
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
    const filters = this.indicator.cloneFilter();
    this.initialFilterLengh = filters.length;

    this.dataSource.filter(filters);
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

  onRowDblClick({data}: {data: Ordre}) {
    this.tabContext.openOrdre(data.numero);
  }
}

export default OrdresNonConfirmesComponent;
