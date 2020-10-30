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
  data1: number;
  tileBkg: string;
}

const indicators: Indicator[] = [{
  id: 0,
  number: '',
  parameter: 'Suivi',
  subParameter: 'des ordres',
  data1: 780000,
  tileBkg: '#01AA9B'
}, {
  id: 1,
  number: '',
  parameter: 'Supervision',
  subParameter: 'livraison',
  data1: 350000,
  tileBkg: '#9199B4'
}, {
  id: 2,
  number: '35',
  parameter: 'Taches',
  subParameter: 'en attente',
  data1: 780000,
  tileBkg: '#01779B'
}, {
  id: 3,
  number: '4',
  parameter: 'Clients',
  subParameter: 'en dépassement encours',
  data1: 350000,
  tileBkg: '#4199B4'
}, {
  id: 4,
  number: '8',
  parameter: 'Ordres',
  subParameter: 'non clôturés',
  data1: 250000,
  tileBkg: '#F26C5A'
}, {
  id: 5,
  number: '6',
  parameter: 'Ordres',
  subParameter: 'non confirmés',
  data1: 320000,
  tileBkg: '#5A6382'
}, {
  id: 6,
  number: '3',
  parameter: 'Litiges',
  subParameter: 'en cours',
  data1: 1700000,
  tileBkg: '#1B715C'
}, {
  id: 7,
  number: '5',
  parameter: 'San Antonio',
  subParameter: 'TX',
  data1: 455000,
  tileBkg: '#60895E',
}, {
  id: 8,
  number: '71',
  parameter: 'Worcester',
  subParameter: 'MA',
  data1: 555000,
  tileBkg: '#71BF45',
}, {
  id: 9,
  number: '20',
  parameter: 'Riverbank',
  subParameter: 'CA',
  data1: 1750000,
  tileBkg: '#8E4A21'
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
