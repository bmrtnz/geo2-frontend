import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent, DxSelectBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { AuthService, TransporteursService } from '../../../shared/services';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { Observable } from 'rxjs';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { OrdresService } from 'app/shared/services/api/ordres.service';

@Component({
  selector: 'app-ordres-indicateurs',
  templateUrl: './ordres-indicateurs.component.html',
  styleUrls: ['./ordres-indicateurs.component.scss']
})
export class OrdresIndicateursComponent implements OnInit {

  transporteurs: DataSource;
  options: {};
  secteurs: DataSource;
  indicator: string;
  filter: any;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  rowSelected: boolean;
  
  @ViewChild('toto', { static: false }) dxSelectBoxComponent: DxSelectBoxComponent;
  refreshGrid = new EventEmitter();

  public dataSource: DataSource;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public gridConfiguratorService: GridConfiguratorService,
    public secteursService: SecteursService,
    public ordresService: OrdresService,
    public authService: AuthService,
  ) {
    // this.apiService = transporteursService;
    this.secteurs = secteursService.getDataSource();
    this.dataSource = ordresService.getDataSource();
   }

  ngOnInit() {
    this.transporteurs = this.transporteursService.getDataSource();
    this.detailedFields = this.transporteursService.model.getDetailedFields();

    this.route.queryParams.subscribe(res => {
      this.options = res;
      this.indicator = res.filtre;
      this.gridFilters(this.indicator);

    });
  }

  gridFilters(indicator, value?) {

    console.log('value : '+value+' indicator : '+indicator)

    if (indicator === 'bonsafacturer') {
      this.filter = [['bonAFacturer', '=', true]];
    }
    if (indicator === 'ordresnonclotures') {
      this.filter = [['livre', '=', false]];
    }
    if (indicator === 'supervisionlivraison') {
      this.filter = [['codeClient', '<>', 'PREORDRE%']];
      if (this.authService.currentUser.limitationSecteur) {
        this.filter.push('and');
        this.filter.push(['secteurCommercial.id', '=', value ? value : this.authService.currentUser.secteurCommercial.id]);
      } else {
        if (value) {
          this.filter.push('and');
          this.filter.push(['secteurCommercial.id', '=', value]);
        }
      }
    }

    // console.log(this.dxSelectBoxComponent.instance);

  }

  onRowClick(event) {
    this.rowSelected = true;
  }

  onRowDblClick(e) {
    window.localStorage.setItem('orderNumber', JSON.stringify(e));
    this.router.navigate([`/ordres/details`]);
  }

  onSecteurChange(e) {

    this.gridFilters('supervisionlivraison', e.id);
    this.refreshGrid.emit();

  }

  onConfirm() {
  }

  onClose() {
  }

}
