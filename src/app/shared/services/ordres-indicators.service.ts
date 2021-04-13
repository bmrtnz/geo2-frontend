import { Injectable } from '@angular/core';
import Ordre, { FactureAvoir } from '../models/ordre.model';
import { DatePipe } from '@angular/common';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment';
import { CurrentCompanyService } from './current-company.service';

export const INDEX_TAB = 'INDEX';
export class Content {
  id?: string;
  tabTitle: string;
  ordre?: Ordre;
  patch?: Ordre;
}

const contents: Content[] = [{
  id: INDEX_TAB,
  tabTitle: 'Suivi des ordres'
}];

export class Indicator {
  id: number;
  number?: string;
  parameter: string;
  subParameter: string;
  goTo: string;
  goToParams?: {filtre: string};
  filter?: any[];
  tileBkg: string;
  indicatorIcon: string;
  warningIcon: string;
  loading: boolean;
  fetchCount?: boolean;
}

const indicators: Indicator[] = [{
  id: 0,
  parameter: 'Suivi',
  subParameter: 'des ordres',
  goTo: '/ordres/details',
  tileBkg: '#01AA9B',
  indicatorIcon: 'material-icons euro_symbol',
  warningIcon: ''
}, {
  id: 1,
  fetchCount: true,
  parameter: 'Supervision',
  subParameter: 'livraison',
  goTo: '/ordres/indicateurs',
  goToParams: {filtre: 'supervisionlivraison'},
  tileBkg: '#9199B4',
  indicatorIcon: 'material-icons directions',
  warningIcon: ''
}, {
  id: 2,
  fetchCount: true,
  parameter: 'Bons',
  subParameter: 'à facturer',
  goTo: '/ordres/indicateurs/bonAFacturer',
  tileBkg: '#01779B',
  indicatorIcon: 'material-icons list_alt',
  warningIcon: 'material-icons warning'
}, {
  id: 3,
  fetchCount: true,
  parameter: 'Clients',
  subParameter: 'en dépassement encours',
  goTo: '/ordres/indicateurs',
  goToParams: {filtre: 'clientsdepassementencours'},
  tileBkg: '#4199B4',
  indicatorIcon: 'user',
  warningIcon: 'material-icons warning'
}, {
  id: 4,
  fetchCount: true,
  parameter: 'Ordres',
  subParameter: 'non clôturés',
  goToParams: {filtre: 'ordresnonclotures'},
  goTo: '/ordres/indicateurs',
  tileBkg: '#F26C5A',
  indicatorIcon: 'material-icons help',
  warningIcon: ''
}, {
  id: 5,
  fetchCount: true,
  parameter: 'Ordres',
  subParameter: 'non confirmés',
  goTo: '/ordres/indicateurs',
  goToParams: {filtre: 'ordresnonconfirmes'},
  tileBkg: '#5A6382',
  indicatorIcon: 'material-icons help',
  warningIcon: ''
}, {
  id: 6,
  fetchCount: true,
  parameter: 'Litiges',
  subParameter: 'en cours',
  goTo: '/ordres/indicateurs/litiges',
  tileBkg: '#1B715C',
  indicatorIcon: 'material-icons offline_bolt',
  warningIcon: 'material-icons warning'
}, {
  id: 7,
  parameter: 'Stock',
  subParameter: 'dispo',
  goTo: '/stock',
  tileBkg: '#60895E',
  indicatorIcon: 'box',
  warningIcon: ''
}, {
  id: 8,
  fetchCount: true,
  parameter: 'Planning',
  subParameter: 'départ',
  goTo: '/ordres/indicateurs',
  goToParams: {filtre: 'planningdeparts'},
  tileBkg: '#71BF45',
  indicatorIcon: 'material-icons calendar_today',
  warningIcon: ''
}, {
  id: 9,
  fetchCount: true,
  parameter: 'Commandes',
  subParameter: 'en transit',
  goTo: '/ordres/indicateurs',
  goToParams: {filtre: 'commandesentransit'},
  tileBkg: '#8E4A21',
  indicatorIcon: 'material-icons local_shipping',
  warningIcon: ''
}]
.map( indicator => ({...indicator, loading: false}));

@Injectable()
export class OrdresIndicatorsService {

  private indicators = indicators;

  constructor(
    private datePipe: DatePipe,
    private authService: AuthService,
    public currentCompanyService: CurrentCompanyService
  ) {
    this.indicators = this.indicators.map(indicator => {

      // Filtres communs
      indicator.filter = [
        ['valide', '=', true],
        'and',
        ['societe.id', '=', this.currentCompanyService.getCompany().id],
      ];

      // Supervision livraison
      if (indicator.id === 1) {
        indicator.filter = [
          ...indicator.filter,
          'and',
          ['codeClient', '<>', 'PREORDRE%']];

      }

      // Bon a facturer
      if (indicator.id === 2) {
        indicator.filter = [
          ...indicator.filter,
          'and',
          ['bonAFacturer', '=', false],
          'and',
          ['client.usageInterne', '<>', true],
          'and',
          ['dateLivraisonPrevue', '>=', this.datePipe.transform(Date.now(), 'yyyy-MM-dd')],
          'and',
          ['dateLivraisonPrevue', '<', this.datePipe.transform((new Date()).setDate((new Date()).getDate() + 1).valueOf(), 'yyyy-MM-dd')],
        ];
      }

      // Ordres clients depassement en cours
      if (indicator.id === 3) {
        indicator.filter = [
          ...indicator.filter,
        ];
      }

      // Ordres non cloturés
      if (indicator.id === 4) {
        // indicator.filter = [
        //   ...indicator.filter,
        //   'and',
        //   ['logistiques.expedieStation', '<>', true],
        //   'and',
        //   ['client.usageInterne', '<>', true],
        //   'and',
        //   ['client.detailAutomatique', '=', true],
        //   'and',
        //   ['logistiques.dateDepartPrevueFournisseur', '=', this.datePipe.transform(Date.now(), 'yyyy-MM-dd')],
        //   'and',
        //   ['lignes.fournisseur.bureauAchat.emailInterlocuteurBW', '<>', 'null'],
        //   'and',
        //   ['lignes.valide', '=', true],
        // ];
      }

      // Ordres non confirmés
      if (indicator.id === 5) {
        indicator.filter = [
          ...indicator.filter,
          'and',
          ['version', '<>', 'null'],
          'and',
          ['factureAvoir', '=', FactureAvoir.AVOIR],
        ];
      }

      // Litiges
      if (indicator.id === 6) {
        // Model LitigeLigne
        indicator.filter = [
          ['valide', '=', true],
        ];
        if (this.authService.currentUser.limitationSecteur) {
          indicator.filter.push('and');
          indicator.filter.push(['litige.ordreOrigine.secteurCommercial.id', '=', this.authService.currentUser.secteurCommercial.id]);
        }
      }

      // Planning departs
      if (indicator.id === 8) {
        indicator.filter = [
          ...indicator.filter,
          'and',
          ['logistiques.dateDepartPrevueFournisseur', '>=', this.datePipe.transform(Date.now(), 'yyyy-MM-dd')],
          'and',
          [
            'logistiques.dateDepartPrevueFournisseur',
            '<',
            this.datePipe.transform((new Date()).setDate((new Date()).getDate() + 1).valueOf(), 'yyyy-MM-dd'),
          ],
        ];
      }

      // Commandes en transit
      if (indicator.id === 9) {
        indicator.filter = [
          ...indicator.filter,
        ];
      }

      return indicator;
    });
  }

  getContents() {
    return contents;
  }
  getIndicators(): Indicator[] {
    return this.indicators;
  }
  getIndicatorByName(name: string) {
    return this.indicators.find(i => i?.goToParams?.filtre === name || i?.parameter === name);
  }
}
