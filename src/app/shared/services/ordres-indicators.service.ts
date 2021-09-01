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
  id: string;
  enabled?: boolean;
  number?: string;
  parameter: string;
  subParameter: string;
  goTo: string;
  filter?: any[];
  tileBkg: string;
  indicatorIcon: string;
  warningIcon: string;
  loading: boolean;
  fetchCount?: boolean;
}

const indicators: Indicator[] = [{
  id: 'SuiviDesOrdres',
  enabled: true,
  parameter: 'Suivi',
  subParameter: 'des ordres',
  goTo: '/ordres/details',
  tileBkg: '#01AA9B',
  indicatorIcon: 'material-icons euro_symbol',
  warningIcon: ''
}, {
  id: 'SupervisionLivraison',
  enabled: false,
  fetchCount: true,
  parameter: 'Supervision',
  subParameter: 'livraison',
  goTo: '/ordres/indicateurs/supervisionLivraison',
  tileBkg: '#9199B4',
  indicatorIcon: 'material-icons directions',
  warningIcon: ''
}, {
  id: 'BonsAFacturer',
  enabled: false,
  fetchCount: true,
  parameter: 'Bons',
  subParameter: 'à facturer',
  goTo: '/ordres/indicateurs/bonAFacturer',
  tileBkg: '#01779B',
  indicatorIcon: 'material-icons list_alt',
  warningIcon: 'material-icons warning'
}, {
  id: 'ClientsDepEncours',
  enabled: false,
  fetchCount: true,
  parameter: 'Clients',
  subParameter: 'en dépassement encours',
  goTo: '/ordres/indicateurs/clientsDepEncours',
  tileBkg: '#4199B4',
  indicatorIcon: 'user',
  warningIcon: 'material-icons warning'
}, {
  id: 'OrdresNonClotures',
  enabled: false,
  fetchCount: true,
  parameter: 'Ordres',
  subParameter: 'non clôturés',
  goTo: '/ordres/indicateurs/ordresNonClotures',
  tileBkg: '#F26C5A',
  indicatorIcon: 'material-icons help',
  warningIcon: ''
}, {
  id: 'OrdresNonConfirmes',
  enabled: false,
  fetchCount: true,
  parameter: 'Ordres',
  subParameter: 'non confirmés',
  goTo: '/ordres/indicateurs/ordresNonConfirmes',
  tileBkg: '#5A6382',
  indicatorIcon: 'material-icons help',
  warningIcon: ''
}, {
  id: 'Litiges',
  enabled: false,
  fetchCount: true,
  parameter: 'Litiges',
  subParameter: 'en cours',
  goTo: '/ordres/indicateurs/litiges',
  tileBkg: '#1B715C',
  indicatorIcon: 'material-icons offline_bolt',
  warningIcon: 'material-icons warning'
}, {
  id: 'Stock',
  enabled: false,
  parameter: 'Stock',
  subParameter: 'dispo',
  goTo: '/stock',
  tileBkg: '#60895E',
  indicatorIcon: 'box',
  warningIcon: ''
}, {
  id: 'PlanningDepart',
  enabled: false,
  fetchCount: true,
  parameter: 'Planning',
  subParameter: 'départ',
  goTo: '/ordres/indicateurs/planningDepart',
  tileBkg: '#71BF45',
  indicatorIcon: 'material-icons calendar_today',
  warningIcon: ''
}, {
  id: 'CommandesTransit',
  enabled: false,
  fetchCount: true,
  parameter: 'Commandes',
  subParameter: 'en transit',
  goTo: '/ordres/indicateurs/commandesTransit',
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
      if (indicator.id === 'SupervisionLivraison') {
        indicator.filter = [
          ...indicator.filter,
          'and',
          ['codeClient', '<>', 'PREORDRE%']];
      }

      // Bon a facturer
      if (indicator.id === 'BonsAFacturer') {
        indicator.filter = [
          ...indicator.filter,
          'and',
          ['bonAFacturer', '=', false],
          'and',
          ['client.usageInterne', '<>', true],
          'and',
          ['dateLivraisonPrevue', '>=', this.getFormatedDate(Date.now())],
          'and',
          ['dateLivraisonPrevue', '<', this.datePipe.transform((new Date()).setDate((new Date()).getDate() + 1).valueOf(), 'yyyy-MM-dd')],
        ];
      }

      // Ordres clients depassement en cours
      if (indicator.id === 'ClientsDepEncours') {
        indicator.filter = [
          ...indicator.filter,
        ];
      }

      // Ordres non cloturés
      if (indicator.id === 'OrdresNonClotures') {
        indicator.filter = [
          ...indicator.filter,
          'and',
          ['logistiques.expedieStation', '<>', true],
          'and',
          ['client.usageInterne', '<>', true],
          'and',
          ['client.detailAutomatique', '=', true],
          'and',
          ['logistiques.dateDepartPrevueFournisseur', '=', this.datePipe.transform(Date.now(), 'yyyy-MM-dd')],
          'and',
          ['lignes.fournisseur.bureauAchat.emailInterlocuteurBW', '<>', 'null'],
          'and',
          ['lignes.valide', '=', true],
        ];
      }

      // Ordres non confirmés
      if (indicator.id === 'OrdresNonConfirmes') {
        indicator.filter = [
          ...indicator.filter,
          'and',
          ['version', '<>', 'null'],
          'and',
          ['factureAvoir', '=', FactureAvoir.AVOIR],
        ];
      }

      // Litiges
      if (indicator.id === 'Litiges') {
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
      if (indicator.id === 'PlanningDepart') {
        indicator.filter = [
          ...indicator.filter,
          'and',
          ['logistiques.dateDepartPrevueFournisseur', '>=', this.getFormatedDate(Date.now())],
          // 'and',
          // [
          //   'logistiques.dateDepartPrevueFournisseur',
          //   '<',
          //   this.datePipe.transform((new Date()).setDate((new Date()).getDate() + 1).valueOf(), 'yyyy-MM-dd'),
          // ],
        ];
      }

      // Commandes en transit
      if (indicator.id === 'CommandesTransit') {
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
    return this.indicators.filter( indicator => indicator.enabled );
  }

  getIndicatorByName(name: string) {
    return this.indicators.find(i => i?.id === name);
  }

  getFormatedDate(date) {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

}
