import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent, DxSelectBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { AuthService, ClientsService, EntrepotsService, TransporteursService } from '../../../shared/services';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { Observable } from 'rxjs';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { GridSuiviComponent } from '../grid-suivi/grid-suivi.component';
import { DxoGridComponent } from 'devextreme-angular/ui/nested';
import { DatePipe, SlicePipe } from '@angular/common';
import { PersonnesService } from 'app/shared/services/api/personnes.service';

@Component({
  selector: 'app-ordres-indicateurs',
  templateUrl: './ordres-indicateurs.component.html',
  styleUrls: ['./ordres-indicateurs.component.scss']
})
export class OrdresIndicateursComponent implements OnInit {

  transporteurs: DataSource;
  options: {};
  secteurs: DataSource;
  clients: DataSource;
  commercial: DataSource;
  assistante: DataSource;
  entrepot: DataSource;
  dateStart: any;
  dateEnd: any;
  periodes: any;
  indicator: string;
  filter: any;
  a: any;
  basicFilter: any;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  rowSelected: boolean;
  
  // @ViewChild('toto', { static: false }) dxSelectBoxComponent: DxSelectBoxComponent;
  @ViewChild(GridSuiviComponent, { static: false }) gridSuiviComponent: GridSuiviComponent;

  public dataSource: DataSource;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public gridConfiguratorService: GridConfiguratorService,
    public secteursService: SecteursService,
    public personnesService: PersonnesService,
    public entrepotsService: EntrepotsService,
    public ordresService: OrdresService,
    public clientsService: ClientsService,
    public authService: AuthService,
    private ordresIndicatorsService: OrdresIndicatorsService,
  ) {
    // this.apiService = transporteursService;
    this.secteurs = secteursService.getDataSource();
    this.clients = clientsService.getDataSource();
    this.commercial = personnesService.getDataSource();
    this.assistante = personnesService.getDataSource();
    this.entrepot = entrepotsService.getDataSource();
    this.dataSource = ordresService.getDataSource();
    this.periodes = ['hier', 'aujourd\'hui', 'demain', 'semaine dernière', 'semaine en cours', 'semaine prochaine',
     '7 prochains jours', '30 prochains jours', 'mois à cheval', 'depuis 30 jours', 'depuis 1 mois',
     'depuis 2 mois', 'depuis 3 mois', 'depuis 12 mois', 'mois dernier', 'mois en cours', 'trimestre dernier',
     'trimestre en cours', 'année civile en cours', 'campagne en cours', 'même semaine année dernière',
    'même mois année dernière'];
   }

  ngOnInit() {
    this.transporteurs = this.transporteursService.getDataSource();
    this.detailedFields = this.transporteursService.model.getDetailedFields();

    // this.dateStart = this.datePipe.transform((new Date()).setDate((new Date()).getDate() + 1).valueOf(), 'yyyy-MM-dd');
    this.dateStart = this.datePipe.transform(Date.now(), 'yyyy-MM-dd');
    this.dateEnd = this.dateStart;

    this.route.queryParams.subscribe(res => {
      this.options = res;
      this.indicator = res.filtre;

      this.filter = this.ordresIndicatorsService.getIndicatorByName(this.indicator).filter;
      this.a = this.filter;

    });

    console.log(this.filter);
    
  }

  onRowClick(event) {
    this.rowSelected = true;
  }

  onRowDblClick(e) {
    window.localStorage.setItem('orderNumber', JSON.stringify(e));
    this.router.navigate([`/ordres/details`]);
  }

  onSecteurChange(e) {

    console.log('this.a : '+this.a)
    console.log('this.a.slice(0) : '+this.a.slice(0))
    console.log('this.filter before : '+this.filter);
    this.filter = this.a;

    if (e) {
      if (this.indicator === 'supervisionlivraison') {
        if (this.authService.currentUser.limitationSecteur) {
          this.filter.push('and');
          this.filter.push(['secteurCommercial.id', '=', e.id ? e.id : this.authService.currentUser.secteurCommercial.id]);
        } else {
          if (e.id) {
            this.filter.push('and');
            this.filter.push(['secteurCommercial.id', '=', e.id]);
          }
        }
      }
    }
    // this.filter.push(
    // 'and',
    // ['dateLivraisonPrevue', '>=', this.datePipe.transform(Date.now(), 'yyyy-MM-dd')],
    // 'and',
    // ['dateLivraisonPrevue', '<', this.datePipe.transform((new Date()).setDate((new Date()).getDate() + 1).valueOf(), 'yyyy-MM-dd')],

    console.log('this.filter after : '+this.filter);
    this.gridSuiviComponent.reload();

  }

  findDates(periode) {

    let deb, fin;
    const now = this.datePipe.transform(Date.now(), 'yyyy-MM-dd');
    
    switch(periode) {
      case 'hier': 	deb = this.datePipe.transform((new Date()).setDate((new Date()).getDate() - 1).valueOf(), 'yyyy-MM-dd');break;
      case 'aujourd\'hui': deb = now; break;
    }
    if (!fin) {fin = deb;}

    this.dateStart = deb;
    this.dateEnd = fin;

  }

  autoSendDeliveryNotes() {
  }

  onConfirm() {
  }

  onClose() {
  }

}
