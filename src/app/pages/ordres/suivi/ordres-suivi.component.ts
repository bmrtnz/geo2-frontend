import { AfterViewInit, Component, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PushHistoryPopupComponent } from 'app/shared/components/push-history-popup/push-history-popup.component';
import Ordre from 'app/shared/models/ordre.model';
import { EntrepotsService, LocalizationService, TransporteursService } from 'app/shared/services';
import { ClientsService } from 'app/shared/services/api/clients.service';
import { DevisesService } from 'app/shared/services/api/devises.service';
import { LitigesService } from 'app/shared/services/api/litiges.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { Content, OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import {
  DxAutocompleteComponent,
  DxPopupComponent,
  DxSelectBoxComponent,
  DxTabPanelComponent,
  DxValidationGroupComponent,
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { GridHistoriqueComponent } from '../grid-historique/grid-historique.component';
import { GridSuiviComponent } from '../grid-suivi/grid-suivi.component';
import { RouteParam, TabContext } from '../root/root.component';

let self;

@Component({
  selector: 'app-ordres-suivi',
  templateUrl: './ordres-suivi.component.html',
  styleUrls: ['./ordres-suivi.component.scss']
})
export class OrdresSuiviComponent implements AfterViewInit {

  readonly INDICATOR_ID = 'SuiviDesOrdres';

  searchItems: any;
  filter: any;
  isIndexTab = true;
  allContents: Content[];
  contents: Content[];
  clients: DataSource;
  litiges: DataSource;
  devise: DataSource;
  entrepot: DataSource;
  commercial: DataSource;
  assistante: DataSource;
  transporteurs: DataSource;
  commentaireInterne: DataSource;
  linkedOrders: any;
  orders: any;
  numero: string;
  linkedOrdersSearch: boolean;
  canDuplicate = false;
  validationPopupVisible = false;
  ordreASupp: string;
  public ordres: DataSource;
  showGridResults = false;
  @ViewChild(DxAutocompleteComponent, { static: false })
  autocomplete: DxAutocompleteComponent;
  validatePopup: PushHistoryPopupComponent;
  ordresLignesViewExp: boolean;

  private formValuesChange: Subscription;
  refreshGrid = new EventEmitter();

  @ViewChild('tabs', { static: false }) tabPanelComponent: DxTabPanelComponent;
  @ViewChild(GridSuiviComponent, { static: false })
  suiviGrid: GridSuiviComponent;
  @ViewChild(GridHistoriqueComponent, { static: false })
  histoGrid: GridHistoriqueComponent;
  @ViewChild(DxValidationGroupComponent, { static: false })
  validationGroup: DxValidationGroupComponent;
  @ViewChild(DxPopupComponent, { static: false })
  validationPopup: DxPopupComponent;
  @ViewChild('searchCriteria', { static: false }) searchCriteria: DxSelectBoxComponent;


  constructor(
    ordresIndicatorsService: OrdresIndicatorsService,
    public localizeService: LocalizationService,
    private ordresService: OrdresService,
    public currentCompanyService: CurrentCompanyService,
    public clientsService: ClientsService,
    public devisesService: DevisesService,
    public litigesService: LitigesService,
    public entrepotsService: EntrepotsService,
    public personnesService: PersonnesService,
    public transporteursService: TransporteursService,
    public tabContext: TabContext,
    public route: ActivatedRoute,
  ) {
    self = this;
    this.ordres = ordresService.getDataSource();
    this.litiges = litigesService.getDataSource();
    this.allContents = ordresIndicatorsService.getContents();
    this.contents = ordresIndicatorsService.getContents().slice(0, 1);
    this.searchItems = [
      'numero',
      'numeroFacture',
      'referenceClient',
      'client.raisonSocial',
    ];
  }

  ngAfterViewInit() {
    this.route.paramMap
    .pipe(filter( param => param.get(RouteParam.TabID) === this.INDICATOR_ID))
    .subscribe( _ => {
      this.histoGrid.reload();
      if (this.suiviGrid) this.suiviGrid.reload();
    });
  }

  searchDisplayExpr(item) {
    return item
      ? self.localizeService.localize('rechOrdres-' + item.replaceAll('.', '-'))
      : null;
  }

  changeSearchCriteria() {
    const toSearch = this.autocomplete.value;
    this.showGridResults = false;
    if (toSearch) {
      setTimeout(() => {
        this.enableFilters(toSearch);
        this.showGridResults = true;
      }, 1);
    }
  }

  enableFilters(value) {
    const criteria = this.searchCriteria.instance.option('value');

    this.filter = [
      ['valide', '=', true],
      'and',
      ['societe.id', '=', this.currentCompanyService.getCompany().id],
      // 'and',
      // ['facture', '=', false],
      'and',
      [criteria, 'contains', value],
    ];
  }

  pushTab(ordre?: Ordre) {

    if (ordre) {
      // We store id and numero when a tab is opened
      // so that we can further recreate bunch of tabs (saved)
      if (Object.keys(ordre).length > 5) {
        const myData = window.sessionStorage.getItem('openOrders');
        let myOrders = [];
        if (myData !== null) {
          myOrders = JSON.parse(myData);
        }
        const shortOrder = {
          id: ordre.id,
          numero: ordre.numero,
          campagne: ordre.campagne ? ordre.campagne.id : null,
        };
        myOrders.push(shortOrder);
        window.sessionStorage.setItem('openOrders', JSON.stringify(myOrders));
      }
      const knownIndex = this.contents.findIndex(({ id }) => ordre.id === id);
      if (knownIndex >= 0) {
        if (this.tabPanelComponent)
          this.tabPanelComponent.selectedIndex = knownIndex;
        return;
      }
    }

  }

  findOrder(e) {
    this.hideSearchResults();
    setTimeout(() => {
      const criteria = e.component._changedValue;
      if (criteria.length) {
        this.enableFilters(criteria);
        this.showGridResults = true;
      }
    }, 1);
  }

  hideSearchResults() {
    this.showGridResults = false;
  }

}

export default OrdresSuiviComponent;
