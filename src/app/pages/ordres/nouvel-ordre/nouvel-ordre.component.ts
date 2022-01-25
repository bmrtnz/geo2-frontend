import { Component, OnInit, ViewChild } from '@angular/core';
import { Devise, Entrepot, Societe } from 'app/shared/models';
import MRUEntrepot from 'app/shared/models/mru-entrepot.model';
import Ordre from 'app/shared/models/ordre.model';
import { InfoPopupComponent } from 'app/shared/components/info-popup/info-popup.component';
import { AuthService, EntrepotsService } from 'app/shared/services';
import { DevisesRefsService } from 'app/shared/services/api/devises-refs.service';
import { FunctionsService } from 'app/shared/services/api/functions.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { SocietesService } from 'app/shared/services/api/societes.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { SingleSelection } from 'basic';
import { defer, EMPTY, Observable, zip } from 'rxjs';
import { catchError, debounceTime, first, map, mapTo, switchMap, tap } from 'rxjs/operators';
import { GridEntrepotsComponent } from '../grid-entrepots/grid-entrepots.component';
import { GridHistoriqueEntrepotsComponent } from '../grid-historique-entrepots/grid-historique-entrepots.component';
import { TabContext } from '../root/root.component';
import { DateManagementService } from 'app/shared/services/date-management.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-nouvel-ordre',
  templateUrl: './nouvel-ordre.component.html',
  styleUrls: ['./nouvel-ordre.component.scss']
})
export class NouvelOrdreComponent implements OnInit {

  readonly inheritedFields = new Set([
    'transporteur.id',
    'transitaire.id',
    'pays.id',
    'incoterm.id',
    'regimeTva.id',
    'prixUnitaireTarifTransport',
    'baseTarifTransport.id',
    'baseTarifTransit.id',
    'typeCamion.id',
    'commercial.id',
    'assistante.id',
    'client.id',
    'client.code',
    'client.assistante.id',
    'client.commercial.id',
    'client.secteur.id',
    'client.devise.id',
    'client.moyenPaiement.id',
    'client.basePaiement.id',
    'client.typeVente.id',
    'client.courtier.id',
    'client.courtageModeCalcul.id',
    'client.fraisMarketingModeCalcul.id',
    'client.deviseTauxFix',
    'client.dateDeviseTauxFix',
    'client.nbJourEcheance',
    'client.echeanceLe',
    'client.courtageValeur',
    'client.tauxRemiseHorsFacture',
    'client.tauxRemiseParFacture',
    'client.remiseSurFactureMDDTaux',
    'client.fraisMarketing',
    'client.fraisPlateforme',
    'client.fraisExcluArticlePasOrigineFrance',
  ]);

  public typeEntrepots = ['Favoris', 'Tous'];
  public favorites = true;
  public resolver: Observable<Ordre>;
  public errorText: string;
  public env = environment;

  private societe: Societe;
  private ofValideEntrepotForOrdreRef = defer(() => this.functionsService
  .ofValideEntrepotForOrdre(this.getSelectedEntrepot().id).valueChanges);
  private fNouvelOrdreRef = defer(() => this.functionsService
  .fNouvelOrdre(this.societe.id).valueChanges);

  @ViewChild(GridEntrepotsComponent, { static: false })
  EntrepotGrid: GridEntrepotsComponent;
  @ViewChild(GridHistoriqueEntrepotsComponent, { static: false })
  historiqueEntrepotGrid: GridHistoriqueEntrepotsComponent;
  @ViewChild('grid') private grid: SingleSelection<Entrepot|MRUEntrepot>;
  @ViewChild(InfoPopupComponent, { static: true }) infoComponent: InfoPopupComponent;

  constructor(
    private functionsService: FunctionsService,
    private ordresService: OrdresService,
    public dateManagementService: DateManagementService,
    private currentCompanyService: CurrentCompanyService,
    private tabContext: TabContext,
    private entrepotsService: EntrepotsService,
    private societesService: SocietesService,
    private devisesRefsService: DevisesRefsService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    const { id } = this.currentCompanyService.getCompany();
    this.societesService.getOne(id, [
      'id',
      'devise.id',
    ]).subscribe( res => {
      this.societe = res.data.societe;
    });
  }

  onButtonLoaderClick() {

    this.resolver = this.ofValideEntrepotForOrdreRef
    .pipe(
      mapTo(this.getSelectedEntrepot()),
      switchMap( entrepot => zip(
        this.fNouvelOrdreRef,
        this.entrepotsService.getOne_v2(entrepot.id, ['id', ...this.inheritedFields]),
      )),
      switchMap(([o, e]) => this.buildOrdre(o.data.fNouvelOrdre.data.ls_nordre, e.data.entrepot)),
      catchError((err: Error) => (this.showError(`${err.name}: ${err.message}`), EMPTY)),
      tap(({numero}) => this.tabContext.openOrdre(numero)),
      debounceTime(2000),
      first(),
    );

  }

  showError(errorInfo) {
    console.log(errorInfo);
    this.infoComponent.visible = true;
    errorInfo = errorInfo.split('\\r\\n').join(' ');
    this.errorText = errorInfo.includes('Error:') ? errorInfo.split(':')[2] : errorInfo;
  }

  getSelectedEntrepot() {
    const item = this?.grid?.getSelectedItem();
    if (item instanceof MRUEntrepot) return item.entrepot;
    if (item instanceof Entrepot) return item;
  }

  onTypeChange(e) {
    this.favorites = (e.value === this.typeEntrepots[0]);
  }

  private buildOrdre(numero: string, entrepot: Entrepot) {

    const assistante = entrepot.assistante ? { id: entrepot.assistante.id } :
    entrepot.client.assistante ? { id: entrepot.client.assistante.id } : null;
    const commercial = entrepot.commercial ? { id: entrepot.commercial.id } :
    entrepot.client.commercial ? { id: entrepot.client.commercial.id } : null;

    return this.fetchDeviseRef(entrepot.client.devise)
    .pipe(
      switchMap(({ taux: tauxDevise }) => this.ordresService.save_v2([
        'id',
        'numero',
      ], {
        ordre: {
          // from `heriteEntrepot.pbl`
          numero,
          dateDepartPrevue: this.dateManagementService.findDate(0),
          dateLivraisonPrevue: this.dateManagementService.findDate(1),
          societe: { id: this.societe.id },
          entrepot: { id: entrepot.id },
          pays: entrepot.pays ? { id: entrepot.pays.id } : null,
          incoterm: entrepot.incoterm ? { id: entrepot.incoterm.id } : null,
          regimeTva: entrepot.regimeTva ? { id: entrepot.regimeTva.id } : null,
          ...this.societe.id !== 'BUK'
            ? {
              prixUnitaireTarifTransport: 0,
              transporteurDEVPrixUnitaire: 0,
              transporteur: { id: '-' },
              bassinTransporteur: '',
            }
            : {
              transporteur: { id: entrepot.transporteur?.id ?? '-' },
              prixUnitaireTarifTransport: entrepot.prixUnitaireTarifTransport,
            },
          baseTarifTransport: entrepot.baseTarifTransport ? { id: entrepot.baseTarifTransport.id } : null,
          transitaire: entrepot.transitaire ? { id: entrepot.transitaire.id } : null,
          baseTarifTransit: entrepot.baseTarifTransit ? { id: entrepot.baseTarifTransit.id } : null,
          transporteurDEVTaux: 1,
          prixUnitaireTarifTransport: entrepot.prixUnitaireTarifTransport,
          assistante,
          commercial,
          typeTransport: entrepot.typeCamion ? { id: entrepot.typeCamion.id } : null,
          ...this.societe.id === 'SA'
            && this.authService.currentUser.getSUP()
            ? {
              assistante: this.authService.currentUser?.assistante // Toujours pas
                ? { id: this.authService.currentUser?.assistante?.id }
                : assistante,
              commercial: this.authService.currentUser?.commercial // Pareil
                ? { id: this.authService.currentUser?.commercial?.id }
                : commercial,
            } : {},
          // from `heriteClient.pbl`
          codeClient: entrepot?.client.code,
          echeanceNombreDeJours: entrepot?.client?.nbJourEcheance,
          echeanceLe: entrepot?.client?.echeanceLe,
          prixUnitaireTarifCourtage: entrepot?.client?.courtageValeur,
          tauxRemiseHorsFacture: entrepot?.client?.tauxRemiseHorsFacture,
          tauxRemiseFacture: entrepot?.client?.tauxRemiseParFacture,
          remiseSurFactureMDDTaux: entrepot?.client?.remiseSurFactureMDDTaux,
          fraisPrixUnitaire: entrepot?.client?.fraisMarketing,
          fraisPlateforme: entrepot?.client?.fraisPlateforme,
          exclusionFraisPU: entrepot?.client?.fraisExcluArticlePasOrigineFrance,
          incotermLieu: '',
          referenceClient: '',
          venteACommission: false,
          client: entrepot?.client ? { id: entrepot?.client.id } : null,
          secteurCommercial: entrepot?.client?.secteur ? { id: entrepot?.client?.secteur.id } : null,
          devise: entrepot?.client?.devise ? { id: entrepot?.client?.devise.id } : null,
          moyenPaiement: entrepot?.client?.moyenPaiement ? { id: entrepot?.client?.moyenPaiement.id } : null,
          basePaiement: entrepot?.client?.basePaiement ? { id: entrepot?.client?.basePaiement.id } : null,
          typeVente: entrepot?.client?.typeVente ? { id: entrepot?.client?.typeVente.id } : null,
          courtier: entrepot?.client?.courtier ? { id: entrepot?.client?.courtier.id } : null,
          baseTarifCourtage: entrepot?.client?.courtageModeCalcul ? { id: entrepot?.client?.courtageModeCalcul.id } : null,
          fraisUnite: entrepot?.client?.fraisMarketingModeCalcul ? { id: entrepot?.client?.fraisMarketingModeCalcul.id } : null,
          ...this.societe.id === 'SA'
            && this.authService.currentUser.getSUP() === 'SUP'
            && entrepot?.client?.courtier?.id === 'LAPARRA'
            ? {
              // On supprime les frais de courtage
              courtier: { id: '' },
              baseTarifCourtage: { id: '' },
              prixUnitaireTarifCourtage: 0,
            } : {},
          // Gestion de la devise par société
          ...entrepot?.client?.devise.id === this.societe?.devise.id
            ? {
              tauxDevise: 1,
            } : {
              ...entrepot?.client?.deviseTauxFix
              ? {
                ...entrepot?.client?.dateDeviseTauxFix
                && Date.parse(entrepot.client.dateDeviseTauxFix) < Date.now()
                && (entrepot.client.dateDeviseTauxFix = null, {}),
                ...entrepot?.client?.dateDeviseTauxFix
                ? {
                  tauxDevise,
                } : {
                  tauxDevise: entrepot.client.dateDeviseTauxFix,
                }
              } : { tauxDevise },
            },
        } as Partial<Ordre>,
      })),
      map( r => r.data.saveOrdre ),
    );
  }

  private fetchDeviseRef(devise: Partial<Devise>) {
    return this.devisesRefsService
    .getList(`id=="${this.societe.devise.id}" and devise.id=="${devise.id}"`, [
      'id',
      'taux',
    ]).pipe(
      map( res => res.data.allDeviseRefList?.[0]),
    );
  }
}
