import { Injectable } from '@angular/core';
import Ordre from '../models/ordre.model';
import { DatePipe } from '@angular/common';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment';

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
  parameter: 'Supervision',
  subParameter: 'livraison',
  goTo: '/ordres/indicateurs',
  goToParams: {filtre: 'supervisionlivraison'},
  tileBkg: '#9199B4',
  indicatorIcon: 'material-icons directions',
  warningIcon: ''
}, {
  id: 2,
  number: '13',
  parameter: 'Bons',
  subParameter: 'à facturer',
  goTo: '/ordres/indicateurs',
  goToParams: {filtre: 'bonsafacturer'},
  tileBkg: '#01779B',
  indicatorIcon: 'material-icons list_alt',
  warningIcon: 'material-icons warning'
}, {
  id: 3,
  number: '4',
  parameter: 'Clients',
  subParameter: 'en dépassement encours',
  goTo: '',
  tileBkg: '#4199B4',
  indicatorIcon: 'user',
  warningIcon: 'material-icons warning'
}, {
  id: 4,
  number: '8',
  parameter: 'Ordres',
  subParameter: 'non clôturés',
  goToParams: {filtre: 'ordresnonclotures'},
  goTo: '/ordres/indicateurs',
  tileBkg: '#F26C5A',
  indicatorIcon: 'material-icons help',
  warningIcon: ''
}, {
  id: 5,
  number: '6',
  parameter: 'Ordres',
  subParameter: 'non confirmés',
  goTo: '/ordres/indicateurs',
  goToParams: {filtre: 'ordresnonconfirmes'},
  tileBkg: '#5A6382',
  indicatorIcon: 'material-icons help',
  warningIcon: ''
}, {
  id: 6,
  number: '3',
  parameter: 'Litiges',
  subParameter: 'en cours',
  goTo: '',
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
  parameter: 'Planning',
  subParameter: 'départ',
  goTo: '',
  tileBkg: '#71BF45',
  indicatorIcon: 'material-icons calendar_today',
  warningIcon: ''
}, {
  id: 9,
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
  ) {
    this.indicators = this.indicators.map(indicator => {

      // Filtres communs
      indicator.filter = [
        ['valide', '=', true],
        'and',
        ['societe.id', '=', environment.societe.id],
      ];

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
        indicator.filter = this.handleSecteurLimitation(indicator.filter);
      }

      // Ordres non cloturés
      if (indicator.id === 4) {
        indicator.filter = [
          ...indicator.filter,
          'and',
          ['livre', '=', false],
        ];
      }

      return indicator;
    });
  }

  handleSecteurLimitation(filter: any[]) {
    if (this.authService.currentUser.limitationSecteur) {
      filter.push('and');
      filter.push(['secteurCommercial.id', '=', this.authService.currentUser.secteurCommercial.id]);
    }
    return filter;
  }

  getContents() {
    return contents;
  }
  getIndicators(): Indicator[] {
    return this.indicators;
  }
  getIndicatorByName(name: string) {
    return this.indicators.find(i => i?.goToParams?.filtre === name);
  }
}
