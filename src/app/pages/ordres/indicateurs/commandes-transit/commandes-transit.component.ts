import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { AuthService, LocalizationService, TransporteursService } from 'app/shared/services';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { DxoGridComponent } from 'devextreme-angular/ui/nested';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Grid, GridConfig } from 'app/shared/services/grid-configurator.service';
import { GridColumn } from 'basic';

@Component({
  selector: 'app-commandes-transit',
  templateUrl: './commandes-transit.component.html',
  styleUrls: ['./commandes-transit.component.scss']
})
export class CommandesTransitComponent implements OnInit, AfterViewInit {

  readonly INDICATOR_NAME = 'CommandesTransit';
  options: {};
  secteurs: DataSource;
  indicator: string;
  filter: any;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  rowSelected: boolean;

  @ViewChild('gridCOMMANDESTRANSIT', { static: false }) gridCOMMANDESTRANSITComponent: DxoGridComponent;
  @ViewChild('secteurValue', { static: false }) secteurSB: DxSelectBoxComponent;

  public dataSource: DataSource;
  initialFilterLengh: number;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
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
      ['societes', 'contains', this.currentCompanyService.getCompany().id]
    ]);
   }

  async ngOnInit() {
    this.enableFilters();
    const fields = this.columns.pipe(map( columns => columns.map( column => column.dataField )));
    this.dataSource = this.ordresService.getDataSource_v2(await fields.toPromise());
  }

  ngAfterViewInit() {

    if (this.authService.currentUser.limitationSecteur) {
      this.secteurSB.value = this.authService.currentUser.secteurCommercial.id;
    }

  }

  enableFilters() {
    const filters = this.ordresIndicatorsService.getIndicatorByName(this.INDICATOR_NAME).filter;
    this.initialFilterLengh = filters.length;
    this.dataSource.filter(filters);
    this.dataSource.reload();

  }

  updateFilters() {

    // Retrieves the initial filter while removing date criteria
    const filters = this.ordresIndicatorsService.getIndicatorByName(this.INDICATOR_NAME).filter;
    // filters.splice(-4,4);
    if (this.secteurSB.value)    filters.push('and', ['secteurCommercial.id', '=', this.secteurSB.value.id]);
    // filters.push(
    //   'and',
    //   ['dateLivraisonPrevue', '>=', this.ordresIndicatorsService.getFormatedDate(this.dateStartSB.value)],
    //   'and',
    //   ['dateLivraisonPrevue', '<=', this.ordresIndicatorsService.getFormatedDate(this.dateEndSB.value)],
    // )

    this.dataSource.filter(filters);
    this.dataSource.reload();

  }

  onRowClick(event) {
    this.rowSelected = true;
  }

  onRowDblClick(e) {
    window.sessionStorage.setItem('orderNumber', JSON.stringify(e));
    this.router.navigate([`/pages/ordres/suivi`]);
  }

  onConfirm() {

  }

}

export default CommandesTransitComponent;
