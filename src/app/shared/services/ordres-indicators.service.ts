import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { Observable } from 'rxjs';
import { Model, ModelFieldOptions } from '../models/model';
import Ordre from '../models/ordre.model';
import { OrdreDatasourceOperation, OrdresService } from './api/ordres.service';
import { PaysService } from './api/pays.service';
import { AuthService } from './auth.service';
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
  dataSource?: DataSource;
  select?: RegExp;
  detailedFields?: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  constructor(args) { Object.assign(this, args); }
  cloneFilter?(): any[] { return JSON.parse(JSON.stringify(this.filter)); }
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
  warningIcon: 'material-icons warning',
  select: /^(?:id|description|sommeAgrement)$/,
}, {
  id: 'OrdresNonClotures',
  enabled: true,
  fetchCount: true,
  parameter: 'Ordres',
  subParameter: 'non clôturés',
  goTo: '/ordres/indicateurs/ordresNonClotures',
  tileBkg: '#F26C5A',
  indicatorIcon: 'material-icons help',
  warningIcon: '',
  /* tslint:disable-next-line max-line-length */
  select: /^(?:numero|referenceClient|dateDepartPrevue|dateLivraisonPrevue|codeClient|codeAlphaEntrepot|type|client\.raisonSocial|secteurCommercial\.id|entrepot\.raisonSocial)$/,
}, {
  id: 'OrdresNonConfirmes',
  enabled: true,
  fetchCount: true,
  parameter: 'Ordres',
  subParameter: 'non confirmés',
  goTo: '/ordres/indicateurs/ordresNonConfirmes',
  tileBkg: '#5A6382',
  indicatorIcon: 'material-icons help',
  warningIcon: '',
  /* tslint:disable-next-line max-line-length */
  select: /^(?:numero|referenceClient|dateDepartPrevue|dateLivraisonPrevue|codeClient|codeAlphaEntrepot|dateCreation|type|client\.raisonSocial|secteurCommercial\.id|entrepot\.raisonSocial)$/,
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
  enabled: true,
  fetchCount: true,
  parameter: 'Planning',
  subParameter: 'départ',
  goTo: '/ordres/indicateurs/planningDepart',
  tileBkg: '#71BF45',
  indicatorIcon: 'material-icons calendar_today',
  warningIcon: '',
  select: /^(?:dateLivraisonPrevue|sommeColisCommandes|sommeColisExpedies|numero|codeClient|codeAlphaEntrepot|versionDetail)$/,
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
    public currentCompanyService: CurrentCompanyService,
    private ordresService: OrdresService,
    private paysService: PaysService
  ) {
    this.indicators = this.indicators.map(indicator => {

      const instance = new Indicator(indicator);

      // Filtres communs
      instance.filter = [
        ['valide', '=', true],
        'and',
        ['societe.id', '=', this.currentCompanyService.getCompany().id],
      ];

      // Supervision livraison
      if (instance.id === 'SupervisionLivraison') {
        instance.filter = [
          ...instance.filter,
          'and',
          ['codeClient', '<>', 'PREORDRE%']];
      }

      // Bon a facturer
      if (instance.id === 'BonsAFacturer') {
        instance.filter = [
          ...instance.filter,
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
      if (instance.id === 'ClientsDepEncours') {
        instance.detailedFields = this.paysService.model
        .getDetailedFields(1, instance.select, {forceFilter: true});
        instance.dataSource = paysService.getDataSource(1, instance.select);
        instance.filter = [
          ['valide', '=', true],
          'and',
          ['clients.societe.id', '=', this.currentCompanyService.getCompany().id],
          'and',
          ['clients.allEnc', '<>', 0],
        ];
      }

      // Ordres non cloturés
      if (instance.id === 'OrdresNonClotures') {
        instance.detailedFields = this.ordresService.model
        .getDetailedFields(3, instance.select, {forceFilter: true});
        instance.dataSource = ordresService.getDataSource(null, 2, instance.select);
        instance.filter = [
          ...instance.filter,
          'and',
          ['logistiques.typeLieuDepart', '=', 'F'],
          'and',
          ['logistiques.expedieStation', '=', false],
          'and',
          ['codeClient', 'notcontains', 'PREORD%'],
          'and',
          ['dateDepartPrevue', '>=', this.datePipe.transform((new Date()).setDate((new Date()).getDate() - 180).valueOf(), 'yyyy-MM-dd')],
          'and',
          ['bonAFacturer', '=', false],
        ];
      }

      // Ordres non confirmés
      if (instance.id === 'OrdresNonConfirmes') {
        instance.detailedFields = this.ordresService.model
        .getDetailedFields(3, instance.select, {forceFilter: true});
        instance.dataSource = this.ordresService.getDataSource(null, 2, instance.select);
        instance.filter = [
          ...instance.filter,
          'and',
          ['version', 'isnull', 'null'],
          'and',
          ['bonAFacturer', '=', false],
          'and',
          ['dateCreation', '>=', this.datePipe.transform(Date.now(), 'yyyy-MM-dd')],
        ];
      }

      // Litiges
      if (instance.id === 'Litiges') {
        // Model LitigeLigne
        instance.filter = [
          ['valide', '=', true],
        ];
        if (this.authService.currentUser.limitationSecteur) {
          instance.filter.push('and');
          instance.filter.push(['litige.ordreOrigine.secteurCommercial.id', '=', this.authService.currentUser.secteurCommercial.id]);
        }
      }

      // Planning departs
      if (instance.id === 'PlanningDepart') {
        instance.detailedFields = this.ordresService.model
        .getDetailedFields(2, instance.select, {forceFilter: true});
        instance.dataSource = this.ordresService
        .getDataSource(OrdreDatasourceOperation.SuiviDeparts, 1, instance.select);
        instance.filter = [
          ...instance.filter,
          'and',
          [
            'logistiques.dateDepartPrevueFournisseur',
            '<=',
            this.datePipe.transform((new Date()).setDate((new Date()).getDate()).valueOf(), 'yyyy-MM-dd'),
          ],
        ];
      }

      // Commandes en transit
      if (instance.id === 'CommandesTransit') {
        instance.filter = [
          ...instance.filter,
        ];
      }

      return instance;
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
