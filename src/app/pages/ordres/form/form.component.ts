import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
import { Role, Societe } from 'app/shared/models';
import Ordre from 'app/shared/models/ordre.model';
import { ClientsService, EntrepotsService, TransporteursService } from 'app/shared/services';
import { DevisesService } from 'app/shared/services/api/devises.service';
import { LitigesService } from 'app/shared/services/api/litiges.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DxAccordionComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { of } from 'rxjs';
import { concatMap, filter, map, switchMap, switchMapTo } from 'rxjs/operators';
import { RouteParam, TAB_ORDRE_CREATE_ID } from '../root/root.component';
import { TypesCamionService } from 'app/shared/services/api/types-camion.service';

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

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  public fragments = Fragments;
  public ordre: Ordre;
  public formGroup = this.formBuilder.group({
    id: [''],
    client: [''],
    entrepot: [''],
    referenceClient: [''],
    transporteur: [''],
    transporteurDEVCode: [''],
    transporteurDEVPrixUnitaire: [''],
    transporteurDEVTaux: [''],
    typeTransport: [''],
    commercial: [''],
    assistante: [''],
    instructionsLogistiques: [''],
    dateDepartPrevue: [''],
    dateLivraisonPrevue: [''],
    ETALocation: [''],
    ETDLocation: [''],
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
  public fullOrderNumber: string;

  public clientsDS: DataSource;
  public entrepotDS: DataSource;
  public deviseDS: DataSource;
  public commercialDS: DataSource;
  public assistanteDS: DataSource;
  public transporteursDS: DataSource;
  public typeTransportDS: DataSource;
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
    private entrepotsService: EntrepotsService,
    private personnesService: PersonnesService,
    private transporteursService: TransporteursService,
    private litigesService: LitigesService,
  ) { }

  ngOnInit() {
    const currentCompany: Societe = this.currentCompanyService.getCompany();
    this.route.paramMap
    .pipe(
      map( params => params.get(RouteParam.TabID)),
      concatMap( id => {
        if (id === TAB_ORDRE_CREATE_ID) return of({} as Ordre);
        return this.ordresService.getOneByNumeroAndSociete(id, currentCompany.id);
      }),
    )
    .subscribe( ordre => {
      this.ordre = ordre;
      this.formGroup.reset(ordre);
    });

    this.router.events
    .pipe(
      filter( event => event instanceof NavigationEnd ),
      switchMapTo(this.route.fragment),
      switchMap( fragment => of(this.anchors.find(item => {
          if (item instanceof DxAccordionComponent)
            return item.instance.element().id === fragment;
          return item.nativeElement.id === fragment;
        }))
      ),
    )
    .subscribe( item => {
      const scrollTo = (elm: HTMLElement) =>
        elm.scrollIntoView({behavior: 'smooth'});

      if (item instanceof DxAccordionComponent) {
        item.instance.expandItem(0);
        scrollTo(item.instance.element());
      } else scrollTo(item.nativeElement);
    });

    this.resetCriteria();
    this.clientsDS = this.clientsService.getDataSource();
    this.entrepotDS = this.entrepotsService.getDataSource();
    this.deviseDS = this.devisesService.getDataSource();
    this.commercialDS = this.personnesService.getDataSource();
    this.typeTransportDS = this.typesCamionService.getDataSource();
    this.commercialDS.filter([
      ['valide', '=', true],
      'and',
      ['role', '=', Role.COMMERCIAL],
    ]);

    this.assistanteDS = this.personnesService.getDataSource();
    this.assistanteDS.filter([
      ['valide', '=', true],
      'and',
      ['role', '=', Role.ASSISTANT],
    ]);
    this.transporteursDS = this.transporteursService.getDataSource();
    this.litigesDS = this.litigesService.getDataSource();
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

  resetCriteria() {
    this.formGroup.get('search').setValue(this.searchItems[0]);
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
    // Pour le moment, uniquement basé sur la référence client

    this.linkedOrdersSearch = false;
    this.linkedOrders = [];
    const refClt = this.ordre.referenceClient;
    if (!refClt) return;

    this.linkedOrdersSearch = true;
    const numero = this.ordre.numero;
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

  openLinkedOrder(id, numero, campagne) {
    this.router.navigate(['ordres', numero], {
      queryParams: { ordre: numero },
      queryParamsHandling: 'merge',
    });
  }

  cancelClick() {
    this.validationPopupVisible = false;
  }

  deviseDisplayExpr(item) {
    return item ? item.description + ' (' + item.taux + ')' : null;
  }

  displayIDBefore(data) {
    return data ? (data.id + ' ' + (data.nomUtilisateur ? data.nomUtilisateur : (data.raisonSocial ? data.raisonSocial : data.description))) : null;
  }

}
