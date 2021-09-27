import { Component, EventEmitter, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
import { PushHistoryPopupComponent } from 'app/shared/components/push-history-popup/push-history-popup.component';
import { Role } from 'app/shared/models';
import Ordre from 'app/shared/models/ordre.model';
import { EntrepotsService, LocalizationService, TransporteursService } from 'app/shared/services';
import { ClientsService } from 'app/shared/services/api/clients.service';
import { DevisesService } from 'app/shared/services/api/devises.service';
import { LitigesService } from 'app/shared/services/api/litiges.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { Content, INDEX_TAB, OrdresIndicatorsService } from 'app/shared/services/ordres-indicators.service';
import { DxAccordionComponent, DxAutocompleteComponent, DxPopupComponent, DxTabPanelComponent, DxValidationGroupComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { iif, of, Subscription } from 'rxjs';
import { filter, map, mergeMap, take } from 'rxjs/operators';
import { GridSuiviComponent } from '../grid-suivi/grid-suivi.component';

let self;

/**
 * Grid with loading toggled by parent
 * Don't forget to cancel datasource loading in your component
 */
export interface ToggledGrid {
  onToggling(toggled: boolean);
}

@Component({
  selector: 'app-ordres-details',
  templateUrl: './ordres-details.component.html',
  styleUrls: ['./ordres-details.component.scss']
})
export class OrdresDetailsComponent implements OnInit, OnDestroy {
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
  dotLitiges: string;
  dotCommentaires: number;
  dotCQ: number;

  formGroup = this.fb.group({
    id: [''],
    client: [''],
    entrepot: [''],
    referenceClient: [''],
    transporteur: [''],
    commercial: [''],
    assistante: [''],
    instructionsLogistiques: [''],
    dateDepartPrevue: [''],
    dateLivraisonPrevue: [''],
    venteACommission: [''],
    devise: [''],
    litigeNumero: [''],
    bonAFacturer: [''],
    commentaireUsageInterne: [''],
    facture: [''],
    factureEDI: [''],
    livre: [''],
    search: [''],
  });
  private formValuesChange: Subscription;
  refreshGrid = new EventEmitter();

  @ViewChild(FileManagerComponent, { static: false })
  fileManagerComponent: FileManagerComponent;
  @ViewChildren(DxAccordionComponent) accordion: any;
  @ViewChild('tabs', { static: false }) tabPanelComponent: DxTabPanelComponent;
  @ViewChild(GridSuiviComponent, { static: false })
  suiviGrid: GridSuiviComponent;
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
    private fb: FormBuilder,
    private route: ActivatedRoute
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

  ngOnInit() {
    // this.enableFilters();
    this.resetCriteria();
    this.clients = this.clientsService.getDataSource();
    this.entrepot = this.entrepotsService.getDataSource();
    this.devise = this.devisesService.getDataSource();
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
    this.transporteurs = this.transporteursService.getDataSource();

    this.route.queryParams
      .pipe(
        filter((params) => params?.pushordres),
        mergeMap((params) => this.ordresService.getOne(params.pushordres)),
        filter(
          (response) =>
            !this.contents.find(({ id }) => id === response.data.ordre.id)
        )
      )
      .subscribe((response) => this.pushTab(response.data.ordre));

    this.formValuesChange = this.formGroup.valueChanges.subscribe((_) => {
      if (this.formGroup.pristine) return;
      const selectedIndex = this.tabPanelComponent.selectedIndex;
      const patch = this.ordresService.extractDirty(this.formGroup.controls);
      this.contents[selectedIndex].patch = patch;
    });

    // On affiche les ordres déjà ouverts le cas échéant
    const myData = window.sessionStorage.getItem('openOrders');
    if (myData !== null) {
      const myOrders = JSON.parse(myData);
      JSON.parse(myData).forEach((value) => {
        this.pushTab(value);
      });
    }
    // On récupère l'ordre à afficher le cas échéant (ordres-indicateurs.component.ts)
    const data = window.sessionStorage.getItem('orderNumber');
    if (data) {
      const order = JSON.parse(data);
      window.sessionStorage.removeItem('orderNumber');
      this.pushTab(order);
    }
  }

  onAccordionToggled(
    {
      overrideTogglingTo = false,
      itemElement,
    }: { overrideTogglingTo: boolean; itemElement: HTMLElement },
    grids: ToggledGrid[]
  ) {
    if (!itemElement.dataset.toggled) itemElement.dataset.toggled = 'false';
    itemElement.dataset.toggled =
      itemElement.dataset.toggled === 'true' ? 'false' : 'true';
    if (overrideTogglingTo)
      itemElement.dataset.toggled = overrideTogglingTo.toString();
    grids.forEach((grid) =>
      grid.onToggling(itemElement.dataset.toggled === 'true')
    );
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
    const criteria = this.formGroup.get('search').value;

    let filter = [
      ['valide', '=', true],
      'and',
      ['societe.id', '=', this.currentCompanyService.getCompany().id],
      'and',
      // ['facture', '=', false],
      // 'and',
      [criteria, 'contains', value],
    ];

    this.filter = filter;
  }

  onSubmit() {
    if (!this.formGroup.pristine && this.formGroup.valid) {
      const ordre = this.ordresService.extractDirty(this.formGroup.controls);
      const isNew = !ordre.id;
      ordre.societe = { id: this.currentCompanyService.getCompany().id };

      this.ordresService.save({ ordre }).subscribe({
        next: (e) => {
          notify('Sauvegardé', 'success', 3000);
          if (isNew) {
            this.contents.splice(this.tabPanelComponent.selectedIndex, 1);
            this.pushTab(e.data.saveOrdre);
          }
        },
        error: () => notify('Echec de la sauvegarde', 'error', 3000),
      });
    }
  }

  duplicate() {
    if (this.formGroup.pristine && this.formGroup.valid) {
      const ordre = this.ordresService.extractDirty(this.formGroup.controls);

      this.ordresService.clone({ ordre }).subscribe({
        next: (e) => {
          notify('Dupliqué', 'success', 3000);
          this.contents.splice(this.tabPanelComponent.selectedIndex, 1);
          this.pushTab(e.data.cloneOrdre);
        },
        error: () => notify('Echec de la duplication', 'error', 3000),
      });
    }
  }

  onDeleteClick() {
    this.validationPopupVisible = true;
  }

  deleteOrder() {
    const ordre = this.ordresService.extractDirty(this.formGroup.controls);
    if (!ordre.id) return;
    this.ordresService.delete({ ordre }).subscribe({
      next: (_) => {
        notify('Ordre supprimé', 'success', 3000);
        this.closeTab(this.tabPanelComponent.selectedIndex);
        this.suiviGrid.reload();
      },
      error: (_) => notify('Echec de la suppression', 'error', 3000),
    });
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  scrollToOnClick(e) {
    const key = e.element.dataset.accordion;
    const extractField = '.' + key + '-field';
    const Element = document.querySelectorAll(extractField);
    const tabIndex = this.tabPanelComponent.selectedIndex - 1;

    // Find corresponding accordion to scroll to/open
    const Accordion = this.accordion
      .toArray()
      .filter((v) => v.element.nativeElement.dataset.name === key)[tabIndex];

    // Some elements are not accordion type
    if (Accordion) {
      Accordion.instance
        .expandItem(0)
        .then((r) => Element[tabIndex].scrollIntoView({ behavior: 'smooth' }));

      // Manually firing accordion onItemTitleClick event
      (Accordion as DxAccordionComponent).onItemTitleClick.emit({
        itemElement: (Accordion as DxAccordionComponent).instance
          .element()
          .querySelector('.dx-accordion-item'),
          overrideTogglingTo: true,
      });
    }
    Element[tabIndex].scrollIntoView({ behavior: 'smooth' });
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

    this.resetCriteria();
    this.linkedOrders = [];
    this.validationGroup.instance.validate();
    if (!addedItems.length) return;
    const { id, ordre, patch } = addedItems[0];
    setTimeout(() => (this.isIndexTab = id === INDEX_TAB));
    this.canDuplicate = !!id;
    if (ordre) {
      this.formGroup.reset({ ...ordre, ...patch }, { emitEvent: false });
      this.addLinkedOrders(ordre);
    }
    if (patch) Object.entries(patch).forEach(([key]) => this.formGroup.get(key).markAsDirty());

      this.fullOrderNumber = this.updateTopLeftOrder(addedItems[0]);

    // Gestion des pastilles infos boutons gauche
    if (ordre) {
      this.dotLitiges = ordre.hasLitige ? '!' : '';
      this.dotCQ = ordre.cqLignesCount;
      this.dotCommentaires = ordre.commentairesOrdreCount;
    }

  }

  updateTopLeftOrder(info) {
    const topLeftOrder = (info.id !== "INDEX") ? info.tabTitle : '';
    return topLeftOrder;
  }

  openLinkedOrder(id, numero, campagne) {
    const shortOrder = {
      id: id,
      numero: numero,
      campagne: campagne,
    };
    this.pushTab(shortOrder);
  }

  resetCriteria() {
    this.formGroup.get('search').setValue(this.searchItems[0]);
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

  deleteClick() {
    this.validationPopupVisible = false;
    this.deleteOrder();
  }

  cancelClick() {
    this.validationPopupVisible = false;
  }
}

export default OrdresDetailsComponent;
