import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { Role } from 'app/shared/models/personne.model';
import { AuthService, ClientsService, EntrepotsService, LocalizationService, TransporteursService } from 'app/shared/services';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { OrdresService, Operation } from 'app/shared/services/api/ordres.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { DxoGridComponent } from 'devextreme-angular/ui/nested';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-bon-a-facturer',
  templateUrl: './bon-a-facturer.component.html',
  styleUrls: ['./bon-a-facturer.component.scss']
})
export class BonAFacturerComponent implements OnInit, AfterViewInit  {

  readonly INDICATOR_NAME = 'BonsAFacturer';
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
  initialFilterLengh: number;
  filter: any;
  a: any;
  days: string;
  basicFilter: any;
  columnChooser = environment.columnChooser;
  detailedFields: Observable<ModelFieldOptions[]>;
  rowSelected: boolean;

  @Output() public ordreSelected = new EventEmitter<Ordre>();

  @ViewChild('gridBAF', { static: false }) gridBAFComponent: DxoGridComponent;
  @ViewChild('secteurValue', { static: false }) secteurSB: DxSelectBoxComponent;
  @ViewChild('clientValue', { static: false }) clientSB: DxSelectBoxComponent;
  @ViewChild('entrepotValue', { static: false }) entrepotSB: DxSelectBoxComponent;
  @ViewChild('commercialValue', { static: false }) commercialSB: DxSelectBoxComponent;
  @ViewChild('assistanteValue', { static: false }) assistanteSB: DxSelectBoxComponent;
  @ViewChild('periodeValue', { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild('dateStartValue', { static: false }) dateStartSB: DxSelectBoxComponent;
  @ViewChild('dateEndValue', { static: false }) dateEndSB: DxSelectBoxComponent;

  public dataSource: DataSource;

  constructor(
    private router: Router,
    private ordresService: OrdresService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    public currentCompanyService: CurrentCompanyService,
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public gridConfiguratorService: GridConfiguratorService,
    public secteursService: SecteursService,
    public personnesService: PersonnesService,
    public entrepotsService: EntrepotsService,
    public clientsService: ClientsService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    private ordresIndicatorsService: OrdresIndicatorsService,
  ) {
    this.dataSource = this.ordresService.getDataSource(Operation.BAF);
    this.detailedFields = this.ordresService.model.getDetailedFields();
    this.secteurs = secteursService.getDataSource();
    this.secteurs.filter([
      ['valide', '=', true],
      'and',
      ['societes', 'contains', this.currentCompanyService.getCompany().id]
    ]);
    this.clients = clientsService.getDataSource_v2(['id', 'raisonSocial']);
    this.commercial = personnesService.getDataSource();
    this.assistante = personnesService.getDataSource();
    this.entrepot = entrepotsService.getDataSource_v2(['id', 'raisonSocial']);
    this.periodes = ['Hier', 'Aujourd\'hui', 'Demain', 'Semaine dernière', 'Semaine en cours', 'Semaine prochaine',
     '7 prochains jours', '30 prochains jours', 'Mois à cheval', 'Depuis 30 jours', 'Depuis 1 mois',
     'Depuis 2 mois', 'Depuis 3 mois', 'Depuis 12 mois', 'Mois dernier', 'Mois en cours', 'Trimestre dernier',
     'Trimestre en cours', 'Année civile en cours', 'Campagne en cours', 'Même semaine année dernière',
    'Même mois année dernière'];
    this.days = this.localizeService.localize('ordres-day');
  }

  ngOnInit() {
    this.enableFilters();
    this.dateStart = this.datePipe.transform(Date.now(), 'yyyy-MM-dd');
    this.dateEnd = this.dateStart;
  }

  ngAfterViewInit() {

    if (this.authService.currentUser.limitationSecteur) {
      this.secteurSB.value = {
        id : this.authService.currentUser.secteurCommercial.id,
        description : this.authService.currentUser.secteurCommercial.description
      };
    }

  }

  enableFilters() {
    const filters = this.ordresIndicatorsService.getIndicatorByName(this.INDICATOR_NAME).filter;
    this.initialFilterLengh = filters.length;

    this.dataSource.filter(filters);
    this.dataSource.reload();

    this.commercial = this.personnesService.getDataSource();
    this.commercial.filter([
      ['valide', '=', true],
      'and',
      ['role', '=', Role.COMMERCIAL],
    ]);

    this.assistante = this.personnesService.getDataSource();
    this.assistante.filter([
      ['valide', '=', true],
      'and',
      ['role', '=', Role.ASSISTANT],
    ]);

  }

  updateFilters() {

    this.clients = this.clientsService.getDataSource_v2(['id', 'raisonSocial', 'societe.id', 'secteur.id']);

    this.clients.filter([
      ['societe.id', '=', this.currentCompanyService.getCompany().id],
      'and',
      ['secteur.id', '=', this.secteurSB.value.id],
    ]);
    this.entrepot = this.entrepotsService.getDataSource_v2(['id', 'raisonSocial']);
    if (this.clientSB.value) this.entrepot.filter(['client.id', '=', this.clientSB.value.id]);

    // Retrieves the initial filter while removing date criteria
    let filters = this.ordresIndicatorsService.getIndicatorByName(this.INDICATOR_NAME).filter;
    filters = filters.slice(0, this.initialFilterLengh - 4);

    filters.push(
      'and',
      ['dateLivraisonPrevue', '>=', this.ordresIndicatorsService.getFormatedDate(this.dateStartSB.value)],
      'and',
      ['dateLivraisonPrevue', '<=', this.ordresIndicatorsService.getFormatedDate(this.dateEndSB.value)],
    );
    if (this.assistanteSB.value) filters.push('and', ['assistante.id', '=', this.assistanteSB.value.id]);
    if (this.commercialSB.value) filters.push('and', ['commercial.id', '=', this.commercialSB.value.id]);
    if (this.clientSB.value)     filters.push('and', ['client.id', '=', this.clientSB.value.id]);
    if (this.entrepotSB.value)   filters.push('and', ['entrepot.id', '=', this.entrepotSB.value.id]);
    if (this.secteurSB.value)    filters.push('and', ['secteurCommercial.id', '=', this.secteurSB.value.id]);

    this.dataSource.filter(filters);
    this.dataSource.reload();

  }

  onSecteurChange() {

    // We clear client/entrepot
    this.entrepotSB.value = null;
    this.clientSB.value = null;
    this.updateFilters();

  }

  onRowDblClick(event) {
    this.router.navigate(['pages/ordres', 'details'], {
      queryParams: {pushordres: (event.data as Ordre).id},
    });
  }

  updateAsBonAFacturer() {
    const allOrdre: Ordre[] = this.gridBAFComponent.instance
    .getSelectedRowsData()
    .map((ordre: Ordre) => ({...ordre, bonAFacturer: true}));

    if (allOrdre.length)
      this.ordresService.saveAll({allOrdre})
      .subscribe( res => {
        this.gridBAFComponent.instance.refresh();
      });
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

    const periode = e.value;

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
      case 'Hier': 	deb = this.findDate(-1); break;
      case 'Aujourd\'hui': deb = now; break;
      case 'Demain': deb = this.findDate(1); break;
      case 'Semaine dernière': deb = this.findDate(-day - 6); fin = this.findDate(-day); break;
      case 'Semaine en cours': deb = this.findDate(-day + 1); fin = this.findDate(-day + 7); break;
      case 'Semaine prochaine': deb = this.findDate(-day + 8); fin = this.findDate(-day + 14); break;
      case '7 prochains jours': deb = now; fin = this.findDate(7); break;
      case '30 prochains jours': deb = now; fin = this.findDate(30); break;
      case 'Mois à cheval': // equiv. 'depuis 1 mois' selon Géo1
      case 'Depuis 1 mois': deb = (month === 1 ? year-1 : year) + '-' + (month === 1 ? 12 : month - 1) + '-' + date; fin = (month === 12 ? year + 1 : year) + '-' + (month === 12 ? 1 : month + 1) + '-' + date ; break;
      case 'Depuis 30 jours': deb = this.findDate(-30); fin = now; break;
      case 'Depuis 2 mois': deb = (month <= 2 ? year-1 : year) + '-' + (month <= 2 ? 12 : month - 2) + '-' + date; fin = (month >= 11 ? year + 1 : year) + '-' + (month >= 11 ? 1 : month + 1) + '-' + date ; break;
      case 'Depuis 3 mois': deb = (month <= 3 ? year-1 : year) + '-' + (month <= 3 ? 12 : month - 3) + '-' + date; fin = (month >= 10 ? year + 1 : year) + '-' + (month >= 11 ? 1 : month + 1) + '-' + date ; break;
      case 'Depuis 12 mois': deb = (year-1) + '-' + month + '-' + date; fin = year + '-' + (month === 12 ? 1 : month + 1) + '-' + date ; break;
      case 'Mois dernier': temp = (month === 1 ? year - 1 : year) + '-' + (month === 1 ? 12 : month - 1); deb = temp + '-01'; fin = temp + '-' + this.daysInMonth((month === 1 ? year - 1 : year), (month === 1 ? 12 : month - 1)) ;break;
      case 'Mois en cours': temp = year + '-' + month; deb = temp + '-01'; fin = temp + '-' + this.daysInMonth(year, month) ;break;
      case 'Trimestre dernier': deb = (quarter === 1 ? year - 1 : year) + '-' + prevQuarterStart + '-01'; fin = (quarter === 1 ? year - 1 : year) + '-' + (prevQuarterStart + 2) + '-' + this.daysInMonth((quarter === 1 ? year - 1 : year), prevQuarterStart + 2);break;
      case 'Trimestre en cours': deb = year + '-' + quarterStart + '-01'; fin = year + '-' + (quarterStart + 3) + '-' + this.daysInMonth(year, quarterStart + 3);break;
      case 'Année civile en cours': deb = year + '-01-01'; fin = year + '-12-31' ; break;
      case 'Campagne en cours': deb = ((month <= 6) ? year - 1 : year) + '-07-01'; fin = ((month > 6) ? year + 1 : year) + '-06-30' ; break;
      case 'Même semaine année dernière': {
        deb = this.getDateOfISOWeek(this.getWeekNumber(dateNow), year - 1);
        const temp = new Date(deb);
        fin = temp.setDate(temp.getDate() + 6);
        deb = this.datePipe.transform(deb.valueOf(), 'yyyy-MM-dd');
        fin = this.datePipe.transform(fin.valueOf(), 'yyyy-MM-dd');
        break;
      }
      case 'Même mois année dernière':
      temp = (year - 1) + '-' + month; deb = temp + '-01'; fin = temp + '-' + this.daysInMonth(year-1, month); break;
    }

    if (!fin) {fin = deb; }

    this.dateStartSB.value = deb;
    this.dateEndSB.value = fin;

    this.updateFilters();

  }

  findDate(delta) {
    return this.ordresIndicatorsService.getFormatedDate((new Date()).setDate((new Date()).getDate() + delta).valueOf());
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

}

export default BonAFacturerComponent;
