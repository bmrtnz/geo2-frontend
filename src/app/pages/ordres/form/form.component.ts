import { AfterViewInit, Component, ElementRef, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
import { Role, Societe, Type } from 'app/shared/models';
import { Ordre, Statut } from 'app/shared/models/ordre.model';
import { ClientsService, EntrepotsService, TransporteursService } from 'app/shared/services';
import { BasesTarifService } from 'app/shared/services/api/bases-tarif.service';
import { DevisesService } from 'app/shared/services/api/devises.service';
import { IncotermsService } from 'app/shared/services/api/incoterms.service';
import { LitigesService } from 'app/shared/services/api/litiges.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { PortsService } from 'app/shared/services/api/ports.service';
import { TypesCamionService } from 'app/shared/services/api/types-camion.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DxAccordionComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { of } from 'rxjs';
import { concatMap, filter, first, map, switchMap } from 'rxjs/operators';
import { RouteParam, TabContext, TAB_ORDRE_CREATE_ID } from '../root/root.component';

/**
 * Grid with loading toggled by parent
 * Don't forget to cancel datasource loading in your component
 */
export interface ToggledGrid {
  onToggling(toggled: boolean);
}

enum Fragments {
  Head = 'head',
  Articles = 'articles',
  Logistique = 'logistique',
  Litiges = 'litiges',
  Synthese = 'synthese',
  Flux = 'flux',
  CQ = 'cq',
  Commentaires = 'commentaires',
  Log = 'log',
}

enum LinkedCriterias {
  Client = 'Réf. Clt',
  Compl = 'Compl.',
  Regul = 'Régul.'
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, AfterViewInit {

  public fragments = Fragments;
  @Output() public ordre: Ordre;
  public status: string;
  public refOrdre: string;
  public formGroup = this.formBuilder.group({
    id: [''],
    client: [''],
    entrepot: [''],
    referenceClient: [''],
    transporteur: [''],
    transporteurDEVCode: [''],
    transporteurDEVPrixUnitaire: [''],
    transporteurDEVTaux: [''],
    baseTarifTransport: [''],
    typeTransport: [''],
    commercial: [''],
    assistante: [''],
    incoterm: [''],
    instructionsLogistiques: [''],
    dateDepartPrevue: [''],
    dateLivraisonPrevue: [''],
    ETDDate: [''],
    ETADate: [''],
    portTypeD: [''],
    portTypeA: [''],
    codeChargement: [''],
    incotermLieu: [''],
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
  public linkedOrdersSearch: boolean;
  public linkedOrders: any;
  public ordresLignesViewExp: boolean;
  public canDuplicate = false;
  public validationPopupVisible = false;
  public searchItems = [
    'numero',
    'numeroFacture',
    'referenceClient',
    'client.raisonSocial',
  ];
  public dotLitiges: string;
  public dotCommentaires: number;
  public dotCQ: number;
  public orderNumber: string;
  public fullOrderNumber: string;

  public clientsDS: DataSource;
  public entrepotDS: DataSource;
  public incotermsDS: DataSource;
  public deviseDS: DataSource;
  public commercialDS: DataSource;
  public assistanteDS: DataSource;
  public portTypeDDS: DataSource;
  public portTypeADS: DataSource;
  public transporteursDS: DataSource;
  public typeTransportDS: DataSource;
  public baseTarifTransportDS: DataSource;
  public litigesDS: DataSource;

  @ViewChild(FileManagerComponent, { static: false })
  fileManagerComponent: FileManagerComponent;
  @ViewChildren(DxAccordionComponent) accordion: DxAccordionComponent[];
  @ViewChildren('anchor') anchors: QueryList<ElementRef|DxAccordionComponent>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private ordresService: OrdresService,
    private currentCompanyService: CurrentCompanyService,
    private clientsService: ClientsService,
    private typesCamionService: TypesCamionService,
    private devisesService: DevisesService,
    private incotermsService: IncotermsService,
    private entrepotsService: EntrepotsService,
    private personnesService: PersonnesService,
    private portsService: PortsService,
    private basesTarifService: BasesTarifService,
    private transporteursService: TransporteursService,
    private litigesService: LitigesService,
    private tabContext: TabContext,
  ) { }

  ngOnInit() {
    this.initializeForm();

    this.clientsDS = this.clientsService.getDataSource_v2(['id', 'raisonSocial']);
    this.entrepotDS = this.entrepotsService.getDataSource_v2(['id', 'raisonSocial']);
    this.deviseDS = this.devisesService.getDataSource();
    this.incotermsDS = this.incotermsService.getDataSource();
    this.typeTransportDS = this.typesCamionService.getDataSource();
    this.baseTarifTransportDS = this.basesTarifService.getDataSource();

    this.commercialDS = this.personnesService.getDataSource();
    this.commercialDS.filter([
      ['valide', '=', true],
      'and',
      ['role', '=', Role.COMMERCIAL]
    ]);

    this.assistanteDS = this.personnesService.getDataSource();
    this.assistanteDS.filter([
      ['valide', '=', true],
      'and',
      ['role', '=', Role.ASSISTANT]
    ]);
    this.portTypeDDS = this.portsService.getDataSource();
    this.portTypeDDS.filter([
      ['valide', '=', true],
      'and',
      ['type', '=', Type.PORT_DE_DEPART]
    ]);

    this.portTypeADS = this.portsService.getDataSource();
    this.portTypeADS.filter([
      ['valide', '=', true],
      'and',
      ['type', '=', Type.PORT_D_ARRIVEE]
    ]);

    this.transporteursDS = this.transporteursService.getDataSource_v2(['id', 'raisonSocial']);
    this.litigesDS = this.litigesService.getDataSource();
  }

  ngAfterViewInit() {
    this.handleAnchors();
  }

  onSubmit() {
    if (!this.formGroup.pristine && this.formGroup.valid) {
      const ordre = this.ordresService.extractDirty(this.formGroup.controls);
      ordre.societe = { id: this.currentCompanyService.getCompany().id };

      this.ordresService.save({ ordre }).subscribe({
        next: () => {
          notify('Sauvegardé', 'success', 3000);
        },
        error: () => notify('Echec de la sauvegarde', 'error', 3000),
      });
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

  onDeleteClick() {
    this.validationPopupVisible = true;
  }

  deleteClick() {
    this.validationPopupVisible = false;
    this.deleteOrder();
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  detailExp() {
    this.ordresLignesViewExp = !this.ordresLignesViewExp;
  }

  duplicate() {
    if (this.formGroup.pristine && this.formGroup.valid) {
      const ordre = this.ordresService.extractDirty(this.formGroup.controls);

      this.ordresService.clone({ ordre }).subscribe({
        next: (e) => {
          notify('Dupliqué', 'success', 3000);
        },
        error: () => notify('Echec de la duplication', 'error', 3000),
      });
    }
  }

  deleteOrder() {
    const ordre = this.ordresService.extractDirty(this.formGroup.controls);
    if (!ordre.id) return;
    this.ordresService.delete({ ordre }).subscribe({
      next: (_) => {
        notify('Ordre supprimé', 'success', 3000);
      },
      error: (_) => notify('Echec de la suppression', 'error', 3000),
    });
  }

  addLinkedOrders() {
    // Accole au numéro d'ordre les ordres liés

    this.linkedOrdersSearch = true;
    this.linkedOrders = [];

    const refClt = this.ordre.referenceClient;

    if (refClt) {
      this.linkedOrdersSearch = true;
      const numero = this.ordre.numero;
      const ordresSource = this.ordresService.getDataSource();
      ordresSource.filter(['referenceClient', '=', refClt]);
      ordresSource.load().then((res) => {
        res.map(value => {
          if (numero !== value.numero) {
            this.linkedOrders.push({ ordre: value, criteria: LinkedCriterias.Client});
          }
        });
        this.findComplRegulLinkedOrders(refClt);
        this.linkedOrdersSearch = false;
      });
    } else {
      this.findComplRegulLinkedOrders(refClt);
    }
  }

  findComplRegulLinkedOrders(refClt) {

    const hasCompl = this.ordre.listeOrdresComplementaires;
    const hasRegul = this.ordre.listeOrdresRegularisations;
    if (hasCompl) {
      hasCompl.split(',').map(res => {
        this.linkedOrders.push({ ordre: {numero: res}, criteria: LinkedCriterias.Compl, class: 'Compl'  });
      });
    }
    if (hasRegul) {
      hasRegul.split(';').map(res => {
        this.linkedOrders.push({ ordre: {numero: res}, criteria: LinkedCriterias.Regul, class: 'Regul'  });
      });
    }
    if (!refClt) this.linkedOrdersSearch = false;
  }

  openLinkedOrder(numero: string) {
    this.tabContext.openOrdre(numero);
  }

  cancelClick() {
    this.validationPopupVisible = false;
  }

  deviseDisplayExpr(item) {
    return item ? item.description + ' (' + item.taux + ')' : null;
  }

  displayIDBefore(data) {
    return data ?
    (data.id + ' ' + (data.nomUtilisateur ? data.nomUtilisateur : (data.raisonSocial ? data.raisonSocial : data.description)))
     : null;
  }

  private initializeForm() {
    const currentCompany: Societe = this.currentCompanyService.getCompany();
    this.route.paramMap
    .pipe(
      first(),
      map( params => params.get(RouteParam.TabID)),
      switchMap( id => {
        if (id === TAB_ORDRE_CREATE_ID) return of({} as Ordre);
        return this.ordresService
        .getOneByNumeroAndSociete(id, currentCompany.id);
      }),
    )
    .subscribe( ordre => {
      this.ordre = ordre;
      this.fetchFullOrderNumber();
      if (this.ordre.numero) this.status = ' - ' + Statut[this.ordre.statut] + (this.ordre.factureEDI ? ' EDI' : '');
      this.refOrdre = this.ordre?.id ? ordre.id : '-';
      this.canDuplicate = !!this?.ordre?.id;
      this.formGroup.reset(ordre);
      this.addLinkedOrders();
      this.refreshBadges();
    });
  }

  private handleAnchors() {
    const scrollTo = (elm: HTMLElement) =>
      elm.scrollIntoView({behavior: 'smooth'});

    this.router.events
    .pipe(
      filter( event => event instanceof NavigationEnd ),
      concatMap(_ => this.route.fragment),
      filter(fragment => !!fragment),
      concatMap( fragment => of(this.anchors.find(item => {
        if (item instanceof DxAccordionComponent)
          return item.instance.element().id === fragment;
        return item.nativeElement.id === fragment;
      }))
      ),
    )
    .subscribe( item => {
      if (item instanceof DxAccordionComponent) {
        item.instance.expandItem(0);
        scrollTo(item.instance.element());
      } else scrollTo(item.nativeElement);
    });
  }

  private fetchFullOrderNumber() {
    this.fullOrderNumber = this?.ordre?.numero && this?.ordre?.campagne
      ? `Ordre N° ${
          (this.ordre.campagne
            ? (this.ordre.campagne.id ? this.ordre.campagne.id : this.ordre.campagne) + '-'
            : '') + this.ordre.numero
        }`
      : 'Nouvel ordre';
  }

  private refreshBadges() {
    // Gestion des pastilles infos boutons gauche
    if (this.ordre) {
      this.dotLitiges = this.ordre.hasLitige ? '!' : '';
      this.dotCQ = this.ordre.cqLignesCount;
      this.dotCommentaires = this.ordre.commentairesOrdreCount;
    }
  }

}
