import { AfterViewInit, Component, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
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
import { Content, INDEX_TAB, OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { DxAutocompleteComponent, DxPopupComponent, DxTabPanelComponent, DxValidationGroupComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { iif, of, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { GridHistoriqueComponent } from '../grid-historique/grid-historique.component';
import { GridSuiviComponent } from '../grid-suivi/grid-suivi.component';
import { TabContext } from '../root/root.component';

let self;

@Component({
  selector: 'app-ordres-details',
  templateUrl: './ordres-details.component.html',
  styleUrls: ['./ordres-details.component.scss']
})
export class OrdresDetailsComponent implements AfterViewInit, OnDestroy {

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
  fullOrderNumber: string;
  linkedOrdersSearch: boolean;
  canDuplicate = false;
  validationPopupVisible = false;
  ordreASupp: string;
  public ordres: DataSource;
  showGridResults: boolean;
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
  }

  ngAfterViewInit() {
    this.tabContext.getSelectedItem()
    .pipe(filter( item => item.id === this.INDICATOR_ID))
    .subscribe( _ => this.histoGrid.reload());
  }

  ngOnDestroy() {
    if (this.formValuesChange) this.formValuesChange.unsubscribe();
  }

  deviseDisplayExpr(item) {
    return item ? item.description + ' (' + item.taux + ')' : null;
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
    // const criteria = this.formGroup.get('search').value;

    this.filter = [
      ['valide', '=', true],
      'and',
      ['societe.id', '=', this.currentCompanyService.getCompany().id],
      'and',
      // ['facture', '=', false],
      // 'and',
      // [criteria, 'contains', value],
    ];
  }

  addLinkedOrders(ordre) {
    // Accole au numéro d'ordre les ordres liés
    // Pour le moment, uniquement basé sur la référence client

    this.linkedOrdersSearch = false;
    this.linkedOrders = [];
    const refClt = ordre.referenceClient;
    if (!refClt) return;

    this.linkedOrdersSearch = true;
    const numero = ordre.numero;
    const ordresSource = this.ordresService.getDataSource();
    ordresSource.filter(['referenceClient', '=', refClt]);
    ordresSource.load().then((res) => {
      this.linkedOrders = [];
      let i = 0;
      res.forEach((value) => {
        if (numero !== value.numero) {
          this.linkedOrders.push({ ordre: value, criteria: 'ref. clt' });
        }
        i++;
      });
      this.linkedOrdersSearch = false;
    });
  }

  onTabDragStart(e) {
    e.itemData = e.fromData[e.fromIndex];
  }

  onTabDrop(e) {
    e.fromData.splice(e.fromIndex, 1);
    e.toData.splice(e.toIndex, 0, e.itemData);
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
    this.contents.push({
      id: ordre ? ordre.id : 'inconnu',
      tabTitle: ordre
        ? `Ordre N° ${
            (ordre.campagne
              ? (ordre.campagne.id ? ordre.campagne.id : ordre.campagne) + '-'
              : '') + ordre.numero
          }`
        : 'Nouvel ordre',
    });

  }

  closeTab(param) {
    let index;
    if (isNaN(param)) {
      index = this.contents.indexOf(param);
    } else {
      index = param;
    }

    // Suppression onglet dans le sessionStorage
    const myData = window.sessionStorage.getItem('openOrders');
    const myOrders = JSON.parse(myData);
    let i = 0;
    myOrders.forEach((value) => {
      if (this.contents[index].id === value.id) {
        myOrders.splice(i, 1);
        window.sessionStorage.setItem('openOrders', JSON.stringify(myOrders));
        return false;
      }
      i++;
    });

    this.contents.splice(index, 1);
    if (index >= this.contents.length)
      this.tabPanelComponent.selectedIndex = index - 1;
  }

  disableButton() {
    // return this.contents.length === this.allContents.length;
  }

  onSelectionChange({ addedItems }: { addedItems: Content[] }) {

    // this.resetCriteria();
    // this.linkedOrders = [];
    // this.validationGroup.instance.validate();
    // if (!addedItems.length) return;
    // const { id, ordre, patch } = addedItems[0];

    // Reload historique (and search results) when view is Suivi des ordres
    // setTimeout(() => {
    //   this.isIndexTab = id === INDEX_TAB;
    //   if (this.isIndexTab) {
    //     this.histoGrid.reload();
    //     // Search?
    //     if (this.suiviGrid) this.suiviGrid.reload();
    //   }
    // });
      
    // this.canDuplicate = !!id;
    // if (ordre) {
    //   this.formGroup.reset({ ...ordre, ...patch }, { emitEvent: false });
    //   this.addLinkedOrders(ordre);
    // }
    // if (patch) Object.entries(patch).forEach(([key]) => this.formGroup.get(key).markAsDirty());

  //     this.fullOrderNumber = this.updateTopLeftOrder(addedItems[0]);

  //   // Gestion des pastilles infos boutons gauche
  //   if (ordre) {
  //     this.dotLitiges = ordre.hasLitige ? '!' : '';
  //     this.dotCQ = ordre.cqLignesCount;
  //     this.dotCommentaires = ordre.commentairesOrdreCount;
  //   }

  }

  updateTopLeftOrder(info) {
    const topLeftOrder = (info.id !== 'INDEX') ? info.tabTitle : '';
    return topLeftOrder;
  }

  onTitleRendered({
    itemData,
    itemIndex,
  }: {
    itemData: Content;
    itemIndex: number;
  }) {
    if (itemData.ordre) return;
    // if (itemIndex === this.tabPanelComponent.selectedIndex) return;
    if (itemData.id === INDEX_TAB) return;
    iif(
      () => !!itemData.id,
      this.ordresService.getOne(itemData.id).pipe(map((res) => res.data.ordre)),
      of({} as Ordre).pipe(take(1))
    ).subscribe((res) => {
      this.contents[itemIndex].ordre = res;
      this.tabPanelComponent.selectedIndex = itemIndex;
    });
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

  public getSelectedOrdre() {
    const index = this.tabPanelComponent.selectedIndex;
    return this.contents[index].ordre;
  }

  detailExp() {
    this.ordresLignesViewExp = !this.ordresLignesViewExp;
  }

}

export default OrdresDetailsComponent;
