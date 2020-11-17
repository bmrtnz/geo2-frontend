import { Injectable } from '@angular/core';

export class Content {
  id: number;
  tabTitle: string;
}

const contents: Content[] = [{
  id: 1,
  tabTitle: 'Suivi des ordres'
}];

export class Indicator {
  id: number;
  number: string;
  parameter: string;
  subParameter: string;
  goTo: string;
  goToParams?: {};
  tileBkg: string;
  indicatorIcon: string;
  warningIcon: string;
}

const indicators: Indicator[] = [{
  id: 0,
  number: '',
  parameter: 'Suivi',
  subParameter: 'des ordres',
  goTo: '/ordres/details',
  tileBkg: '#01AA9B',
  indicatorIcon: 'material-icons euro_symbol',
  warningIcon: ''
}, {
  id: 1,
  number: '',
  parameter: 'Supervision',
  subParameter: 'livraison',
  goTo: '',
  goToParams: {},
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
  number: '',
  parameter: 'Stock',
  subParameter: 'dispo',
  goTo: '/ordres/stock',
  tileBkg: '#60895E',
  indicatorIcon: 'box',
  warningIcon: ''
}, {
  id: 8,
  number: '',
  parameter: 'Planning',
  subParameter: 'départ',
  goTo: '',
  tileBkg: '#71BF45',
  indicatorIcon: 'material-icons calendar_today',
  warningIcon: ''
}, {
  id: 9,
  number: '',
  parameter: 'Commandes',
  subParameter: 'en transit',
  goTo: '/ordres/indicateurs',
  goToParams: {filtre: 'commandesentransit'},
  tileBkg: '#8E4A21',
  indicatorIcon: 'material-icons local_shipping',
  warningIcon: ''
}];

@Injectable()
export class FakeOrdresService {
  getContents() {
    return contents;
  }
  getIndicators(): Indicator[] {
    return indicators;
  }
}
