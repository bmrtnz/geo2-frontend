import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import grids from 'assets/configurations/grids.json';
import { GridColumn } from 'basic';
import DataSource from 'devextreme/data/data_source';
import { Observable } from 'rxjs';
import { Model, ModelFieldOptions } from '../models/model';
import Ordre from '../models/ordre.model';
import { CountResponse as CountResponseOrdre, Operation, OrdresService } from './api/ordres.service';
import { CountResponse as CountResponsePays, Operation as PaysOperation, PaysService } from './api/pays.service';
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
  filter?: any[];
  tileBkg: string;
  indicatorIcon: string;
  warningIcon: string;
  loading: boolean;
  withCount?: boolean;
  fetchCount?: (dxFilter?: any[]) => Observable<ApolloQueryResult<any>>;
  dataSource?: DataSource;
  select?: RegExp;
  component?: Promise<any>;
  detailedFields?: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]> | GridColumn[];
  constructor(args) { Object.assign(this, args); }
  cloneFilter?(): any[] { return JSON.parse(JSON.stringify(this.filter)); }
}

const indicators: Indicator[] = [{
  id: 'SuiviDesOrdres',
  enabled: true,
  parameter: 'Suivi',
  subParameter: 'des ordres',
  tileBkg: '#01AA9B',
  indicatorIcon: 'material-icons euro_symbol',
  warningIcon: '',
  component: import('../../pages/ordres/suivi/ordres-suivi.component'),
}, {
  id: 'SupervisionLivraison',
  enabled: false,
  withCount: true,
  parameter: 'Supervision',
  subParameter: 'livraison',
  tileBkg: '#9199B4',
  indicatorIcon: 'material-icons directions',
  warningIcon: '',
  component: import('../../pages/ordres/indicateurs/supervision-livraison/supervision-livraison.component'),
}, {
  id: 'BonsAFacturer',
  enabled: false,
  withCount: true,
  parameter: 'Bons',
  subParameter: 'à facturer',
  tileBkg: '#01779B',
  indicatorIcon: 'material-icons list_alt',
  warningIcon: 'material-icons warning',
  component: import('../../pages/ordres/indicateurs/bon-a-facturer/bon-a-facturer.component'),
}, {
  id: 'ClientsDepEncours',
  enabled: true,
  withCount: true,
  parameter: 'Clients',
  subParameter: 'en dépassement encours',
  tileBkg: '#4199B4',
  indicatorIcon: 'material-icons people',
  warningIcon: 'material-icons warning',
  component: import('../../pages/ordres/indicateurs/clients-dep-encours/clients-dep-encours.component'),
  /* tslint:disable-next-line max-line-length */
  select: /^(?:id|description|clientsSommeAgrement|clientsSommeEnCoursTemporaire|clientsSommeEnCoursBlueWhale|clientsSommeAutorise|clientsSommeDepassement|clientsSommeEnCoursActuel|clientsSommeEnCoursNonEchu|clientsSommeEnCours1a30|clientsSommeEnCours31a60|clientsSommeEnCours61a90|clientsSommeEnCours90Plus|clientsSommeAlerteCoface)$/,
}, {
  id: 'OrdresNonClotures',
  enabled: true,
  withCount: true,
  parameter: 'Ordres',
  subParameter: 'non clôturés',
  tileBkg: '#F26C5A',
  indicatorIcon: 'material-icons lock_open',
  warningIcon: '',
  component: import('../../pages/ordres/indicateurs/ordres-non-clotures/ordres-non-clotures.component'),
  /* tslint:disable-next-line max-line-length */
  select: /^(?:numero|referenceClient|dateDepartPrevue|dateLivraisonPrevue|codeClient|codeAlphaEntrepot|type|client\.raisonSocial|secteurCommercial\.id|entrepot\.raisonSocial)$/,
}, {
  id: 'OrdresNonConfirmes',
  enabled: true,
  withCount: true,
  parameter: 'Ordres',
  subParameter: 'non confirmés',
  tileBkg: '#5A6382',
  indicatorIcon: 'material-icons remove_done',
  warningIcon: '',
  component: import('../../pages/ordres/indicateurs/ordres-non-confirmes/ordres-non-confirmes.component'),
  /* tslint:disable-next-line max-line-length */
  select: /^(?:numero|referenceClient|dateDepartPrevue|dateLivraisonPrevue|codeClient|codeAlphaEntrepot|dateCreation|type|client\.raisonSocial|secteurCommercial\.id|entrepot\.raisonSocial)$/,
}, {
  id: 'PlanningTransporteurs',
  enabled: true,
  withCount: true,
  parameter: 'Planning',
  subParameter: 'transporteurs',
  tileBkg: '#1B715C',
  indicatorIcon: 'material-icons departure_board',
  warningIcon: '',
  component: import('../../pages/ordres/indicateurs/planning-transporteurs/planning-transporteurs.component'),
}, {
  id: 'Litiges',
  enabled: false,
  withCount: true,
  parameter: 'Litiges',
  subParameter: 'en cours',
  tileBkg: '#1B715C',
  indicatorIcon: 'material-icons offline_bolt',
  warningIcon: 'material-icons warning',
  component: import('../../pages/ordres/indicateurs/litiges/litiges.component'),
}, {
  id: 'Stock',
  enabled: false,
  parameter: 'Stock',
  subParameter: 'dispo',
  tileBkg: '#60895E',
  indicatorIcon: 'box',
  warningIcon: '',
}, {
  id: 'PlanningDepart',
  enabled: true,
  withCount: true,
  parameter: 'Planning',
  subParameter: 'départ',
  tileBkg: '#71BF45',
  indicatorIcon: 'material-icons calendar_today',
  warningIcon: '',
  component: import('../../pages/ordres/indicateurs/planning-depart/planning-depart.component'),
  select: /^(?:dateLivraisonPrevue|sommeColisCommandes|sommeColisExpedies|numero|codeClient|codeAlphaEntrepot|versionDetail)$/,
}, {
  id: 'CommandesTransit',
  enabled: false,
  withCount: true,
  parameter: 'Commandes',
  subParameter: 'en transit',
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
        instance.dataSource = paysService
        .getDataSource(1, instance.select, PaysOperation.AllDistinct);
        instance.fetchCount = paysService.count.bind(paysService) as (dxFilter?: any[]) => Observable<ApolloQueryResult<CountResponsePays>>;
        instance.filter = [
          ['valide', '=', true],
          'and',
          ['clients.societe.id', '=', this.currentCompanyService.getCompany().id],
          'and',
          [
            ['clients.enCoursNonEchu', '<>', 0],
            'or',
            ['clients.enCours1a30', '<>', 0],
            'or',
            ['clients.enCours31a60', '<>', 0],
            'or',
            ['clients.enCours61a90', '<>', 0],
            'or',
            ['clients.enCours90Plus', '<>', 0],
          ],
        ];
      }

      // Ordres non cloturés
      if (instance.id === 'OrdresNonClotures') {
        instance.detailedFields = this.ordresService.model
        .getDetailedFields(3, instance.select, {forceFilter: true});
        instance.dataSource = ordresService.getDataSource(null, 2, instance.select);
        instance.fetchCount = ordresService.count.bind(ordresService) as (dxFilter?: any[]) => Observable<ApolloQueryResult<CountResponseOrdre>>;
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
        instance.fetchCount = ordresService.count.bind(ordresService) as (dxFilter?: any[]) => Observable<ApolloQueryResult<CountResponseOrdre>>;
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
        .getDataSource(Operation.SuiviDeparts, 1, instance.select);
        instance.fetchCount = ordresService.count.bind(ordresService) as (dxFilter?: any[]) => Observable<ApolloQueryResult<CountResponseOrdre>>;
        instance.filter = [
          ...instance.filter,
          'and',
          [
            'logistiques.dateDepartPrevueFournisseur',
            '<=',
            new Date().toISOString(),
          ],
        ];
      }

      // Planning departs
      if (instance.id === 'PlanningTransporteurs') {
        instance.detailedFields = grids['planning-transporteurs'].columns;
        instance.dataSource = this.ordresService.getDataSource_v2(instance.detailedFields.map( field => field.dataField ));
        instance.fetchCount = ordresService.count.bind(ordresService) as (dxFilter?: any[]) => Observable<ApolloQueryResult<CountResponseOrdre>>;
        instance.filter = [
          ...instance.filter,
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
