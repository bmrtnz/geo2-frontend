import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { AuthService, ClientsService, EntrepotsService, TransporteursService } from '../../../shared/services';
import { GridSuiviComponent } from '../grid-suivi/grid-suivi.component';

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
    // ['dateLivraisonPrevue', '>=', this.datePipe.transform(this.dateStart, 'yyyy-MM-dd')],
    // 'and',
    // ['dateLivraisonPrevue', '<', this.datePipe.transform(this.dateEnd, 'yyyy-MM-dd')],
    // )
    
    console.log('this.filter after : '+this.filter);
    this.gridSuiviComponent.reload();

  }

  findDates(periode) {

    let deb, fin, temp;
    // const dateNow = new Date(2021, 11, 31);
    const dateNow = new Date();
    const now = this.datePipe.transform(dateNow, 'yyyy-MM-dd');
    const year = dateNow.getFullYear();
    const month = dateNow.getMonth() + 1;
    const date = dateNow.getDate();
    
    const day = dateNow.getDay();
    const quarter = Math.floor((month + 2) / 3); // Current quarter
    const quarterStart = 1 + ((quarter - 1) * 3); // Current quarter first month
    const prevQuarterStart = quarter === 1 ? 10 : quarterStart - 3; // Current quarter first month

    switch(periode) {
      case 'hier': 	deb = this.findDate(-1); break;
      case 'aujourd\'hui': deb = now; break;
      case 'demain': deb = this.findDate(1); break;
      case 'semaine dernière': deb = year + '-' + month + '-' + (date - day - 6); fin = year + '-' + month + '-' + (date - day); break;
      case 'semaine en cours': deb = year + '-' + month + '-' + (date - day + 1); fin = year + '-' + month + '-' + (date - day + 7); break;
      case 'semaine prochaine': deb = year + '-' + month + '-' + (date - day + 8); fin = year + '-' + month + '-' + (date - day+ 14); break;
      case '7 prochains jours': deb = now; fin = this.findDate(7); break;
      case '30 prochains jours': deb = now; fin = this.findDate(30); break;
      case 'mois à cheval': // equiv. depuis 1 mois
      case 'depuis 1 mois': deb = (month === 1 ? year-1 : year) + '-' + (month === 1 ? 12 : month - 1) + '-' + date; fin = (month === 12 ? year + 1 : year) + '-' + (month === 12 ? 1 : month + 1) + '-' + date ; break;
      case 'depuis 30 jours': deb = this.findDate(-30); fin = now; break;     
      case 'depuis 2 mois': deb = (month <= 2 ? year-1 : year) + '-' + (month <= 2 ? 12 : month - 2) + '-' + date; fin = (month >= 11 ? year + 1 : year) + '-' + (month >= 11 ? 1 : month + 1) + '-' + date ; break;
      case 'depuis 3 mois': deb = (month <= 3 ? year-1 : year) + '-' + (month <= 3 ? 12 : month - 3) + '-' + date; fin = (month >= 10 ? year + 1 : year) + '-' + (month >= 11 ? 1 : month + 1) + '-' + date ; break;
      case 'depuis 12 mois': deb = (year-1) + '-' + month + '-' + date; fin = year + '-' + (month === 12 ? 1 : month + 1) + '-' + date ; break;
      case 'mois dernier': temp = (month === 1 ? year - 1 : year) + '-' + (month === 1 ? 12 : month - 1); deb = temp + '-01'; fin = temp + '-' + this.daysInMonth((month === 1 ? year - 1 : year), (month === 1 ? 12 : month - 1)) ;break;
      case 'mois en cours': temp = year + '-' + month; deb = temp + '-01'; fin = temp + '-' + this.daysInMonth(year, month) ;break;
      case 'trimestre dernier': deb = (quarter === 1 ? year - 1 : year) + '-' + prevQuarterStart + '-01'; fin = (quarter === 1 ? year - 1 : year) + '-' + (prevQuarterStart + 2) + '-' + this.daysInMonth((quarter === 1 ? year - 1 : year), prevQuarterStart + 2);break;
      case 'trimestre en cours': deb = year + '-' + quarterStart + '-01'; fin = year + '-' + (quarterStart + 3) + '-' + this.daysInMonth(year, quarterStart + 3);break;
      case 'année civile en cours': deb = year + '-01-01'; fin = year + '-12-31' ; break;
      case 'campagne en cours': deb = ((month <= 6) ? year - 1 : year) + '-07-01'; fin = ((month > 6) ? year + 1 : year) + '-06-30' ; break;
      case 'même semaine année dernière': {
        deb = this.getDateOfISOWeek(this.getWeekNumber(dateNow), year - 1);
        const temp = new Date(deb);
        fin = temp.setDate(temp.getDate() + 6);
        deb = this.datePipe.transform(deb.valueOf(), 'yyyy-MM-dd');
        fin = this.datePipe.transform(fin.valueOf(), 'yyyy-MM-dd');
        ;break;
      } 
      case 'même mois année dernière': temp = (year - 1) + '-' + month; deb = temp + '-01'; fin = temp + '-' + this.daysInMonth(year-1, month); break;
    }

    if (!fin) {fin = deb;}

    this.dateStart = deb;
    this.dateEnd = fin;

  }

  findDate(delta) {
    return this.datePipe.transform((new Date()).setDate((new Date()).getDate() + delta).valueOf(), 'yyyy-MM-dd');
  }

  getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil(( ( (d - yearStart.valueOf()) / 86400000) + 1)/7);
  }

  getDateOfISOWeek(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

  daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  autoSendDeliveryNotes() {
  }

  onConfirm() {
  }

  updateAsBonAFacturer() {
    const allOrdre: Ordre[] = this.gridSuiviComponent.datagrid.instance
    .getSelectedRowsData()
    .map((ordre: Ordre) => ({...ordre, bonAFacturer: true}));

    if (allOrdre.length)
      this.ordresService.saveAll({allOrdre})
      .subscribe( res => {
        console.log(res);
        this.gridSuiviComponent.datagrid.instance.refresh();
      });
  }

}
