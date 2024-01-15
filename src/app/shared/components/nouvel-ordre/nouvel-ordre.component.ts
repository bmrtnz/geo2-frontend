import { AfterViewInit, Component, EventEmitter, Input, NgModule, Output, ViewChild } from "@angular/core";
import { InfoPopupComponent, InfoPopupModule } from "app/shared/components/info-popup/info-popup.component";
import { Devise, Entrepot, Societe } from "app/shared/models";
import MRUEntrepot from "app/shared/models/mru-entrepot.model";
import Ordre from "app/shared/models/ordre.model";
import { AuthService, EntrepotsService } from "app/shared/services";
import { DevisesRefsService } from "app/shared/services/api/devises-refs.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { SocietesService } from "app/shared/services/api/societes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { SingleSelection } from "basic";
import { defer, EMPTY, Observable, zip } from "rxjs";
import {
  catchError,
  concatMap,
  debounceTime,
  filter,
  first,
  map,
  mapTo,
  switchMap,
  tap,
} from "rxjs/operators";
import { GridEntrepotsComponent, GridEntrepotsModule } from "../grid-entrepots/grid-entrepots.component";
import { GridHistoriqueEntrepotsComponent, GridHistoriqueEntrepotsModule } from "../grid-historique-entrepots/grid-historique-entrepots.component";
import { RouteParam, TabContext } from "../../../pages/ordres/root/root.component";
import { ActivatedRoute } from "@angular/router";
import { GridsService } from "../../../pages/ordres/grids.service";
import { CommonModule } from "@angular/common";
import { SharedModule } from "app/shared/shared.module";
import { DxButtonModule, DxRadioGroupModule } from "devextreme-angular";
import { ButtonLoaderModule } from "../button-loader/button-loader.component";

@Component({
  selector: "app-nouvel-ordre",
  templateUrl: "./nouvel-ordre.component.html",
  styleUrls: ["./nouvel-ordre.component.scss"],
})
export class NouvelOrdreComponent implements AfterViewInit {
  readonly inheritedFields = new Set([
    "transporteur.id",
    "transitaire.id",
    "pays.id",
    "incoterm.id",
    "regimeTva.id",
    "prixUnitaireTarifTransport",
    "baseTarifTransport.id",
    "baseTarifTransit.id",
    "typeCamion.id",
    "commercial.id",
    "assistante.id",
    "instructionLogistique",
    "client.id",
    "client.code",
    "client.assistante.id",
    "client.commercial.id",
    "client.secteur.id",
    "client.devise.id",
    "client.moyenPaiement.id",
    "client.basePaiement.id",
    "client.typeVente.id",
    "client.courtier.id",
    "client.courtageModeCalcul.id",
    "client.fraisMarketingModeCalcul.id",
    "client.deviseTauxFix",
    "client.dateDeviseTauxFix",
    "client.nbJourEcheance",
    "client.echeanceLe",
    "client.instructionLogistique",
    "client.courtageValeur",
    "client.tauxRemiseHorsFacture",
    "client.tauxRemiseParFacture",
    "client.remiseSurFactureMDDTaux",
    "client.fraisMarketing",
    "client.fraisPlateforme",
    "client.fraisExcluArticlePasOrigineFrance",
  ]);
  readonly INDICATOR_ID = "create";

  public typeEntrepots = ["Favoris", "Tous"];
  public favorites = false;
  public resolver: Observable<Ordre>;
  public errorText: string;
  public codeEnt: any;
  public hideButton: boolean;
  private societe: Societe;
  private ofValideEntrepotForOrdreRef = defer(
    () =>
      this.functionsService.ofValideEntrepotForOrdre(
        this.getSelectedEntrepot().id
      ).valueChanges
  );
  private fNouvelOrdreRef = defer(
    () => this.functionsService.fNouvelOrdre(this.societe.id).valueChanges
  );

  @Input() pulseBtnOn: boolean;
  @Input() silent: boolean;
  @Input() injectedEntrepot: Partial<Entrepot>;
  @Output() public whenCreated = new EventEmitter();
  @Output() public whenError = new EventEmitter();


  @ViewChild(GridEntrepotsComponent, { static: false })
  EntrepotGrid: GridEntrepotsComponent;
  @ViewChild(GridHistoriqueEntrepotsComponent, { static: false })
  historiqueEntrepotGrid: GridHistoriqueEntrepotsComponent;
  @ViewChild("grid") private grid: SingleSelection<Entrepot | MRUEntrepot>;
  @ViewChild("gridHisto") private gridHisto: SingleSelection<Entrepot | MRUEntrepot>;
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
    private gridsService: GridsService,
    private route: ActivatedRoute,
    public authService: AuthService
  ) { }

  ngAfterViewInit() {
    this.route.paramMap
      .pipe(
        // filter((param) => param.get(RouteParam.TabID) === this.INDICATOR_ID),
        concatMap(() => this.societesService
          .getOne(this.currentCompanyService.getCompany().id, ["id", "devise.id", "campagne.id"])),
      )
      .subscribe((res) => {
        this.societe = res.data.societe;
        if (this.silent) return;
        this.favorites ?
          this.historiqueEntrepotGrid?.reload() :
          this.EntrepotGrid?.reload();
      });
  }

  onButtonLoaderClick() {
    if (!this.getSelectedEntrepot() || this.hideButton) return;

    this.resolver = this.ofValideEntrepotForOrdreRef.pipe(
      mapTo(this.getSelectedEntrepot()),
      switchMap((entrepot) =>
        zip(
          this.fNouvelOrdreRef,
          this.entrepotsService.getOne_v2(entrepot.id, [
            "id",
            "code",
            ...this.inheritedFields,
          ])
        )
      ),
      switchMap(([o, e]) =>
        this.buildOrdre(o.data.fNouvelOrdre.data.ls_nordre, e.data.entrepot)
      ),
      catchError(
        (err: Error) => (this.showError(`${err.name}: ${err.message}`), EMPTY)
      ),
      tap(({ numero }) => {
        if (!this.silent) {
          this.clearGridsFilters(); // Clearing filters on BOTH grids
          this.tabContext.openOrdre(numero, this.societe.campagne.id);
        } else {
          this.whenCreated.emit({ numero: numero, campagneId: this.societe.campagne.id });
        }
      }),
      debounceTime(2000),
      first()
    );
  }

  showError(errorInfo) {
    console.log(errorInfo);
    errorInfo = errorInfo.split("\\r\\n").join(" ");
    this.errorText = this.messageFormat(errorInfo);
    this.infoComponent.visible = true;
    this.whenError.emit();
  }

  clearGridsFilters() {
    this.gridsService.clearFilters(
      this.EntrepotGrid.grid.instance,
      this.EntrepotGrid.columns
    );
    this.gridsService.clearFilters(
      this.historiqueEntrepotGrid.grid.instance,
      this.historiqueEntrepotGrid.columns
    );
  }

  private messageFormat(mess) {
    mess = mess
      .replace(`Exception while fetching data (/ofValideEntrepotForOrdre) : `, "")
      .replace(`ApolloError: `, "");
    return mess.charAt(0).toUpperCase() + mess.slice(1);
  }

  pulseButton(e) {
    this.pulseBtnOn = false;
    setTimeout(() => (this.pulseBtnOn = true), 1);
  }

  hideCreateButton(e) {
    this.hideButton = e;
  }

  getSelectedEntrepot() {
    const item = this?.grid?.getSelectedItem() || this?.gridHisto?.getSelectedItem();

    if (this.injectedEntrepot) {
      this.codeEnt = this.injectedEntrepot.code;
      return this.injectedEntrepot;
    }

    if (item instanceof MRUEntrepot) {
      this.codeEnt = item.codeEntrepot;
      return item.entrepot;
    }
    if (item instanceof Entrepot) {
      this.codeEnt = item.code;
      return item;
    }
  }

  onTypeChange(e) {
    if (this.silent) return;
    if (this.EntrepotGrid?.grid) {
      this.EntrepotGrid.grid.instance.option("focusedRowIndex", -1);
    }
    if (this.historiqueEntrepotGrid?.grid) {
      this.historiqueEntrepotGrid.grid.instance.clearSelection();
      this.historiqueEntrepotGrid.grid.instance.option("focusedRowIndex", -1);
    }
    this.favorites = e.value === this.typeEntrepots[0];
  }

  public buildOrdre(numero: string, entrepot: Entrepot) {
    const delivery = this.dateManagementService.findDateTimeZero(1); // Day + 1
    const assistante = entrepot.assistante
      ? { id: entrepot.assistante.id }
      : entrepot.client.assistante
        ? { id: entrepot.client.assistante.id }
        : null;
    const commercial = entrepot.commercial
      ? { id: entrepot.commercial.id }
      : entrepot.client.commercial
        ? { id: entrepot.client.commercial.id }
        : null;

    const instLogClt = entrepot.client.instructionLogistique
      ? entrepot.client.instructionLogistique
      : "";
    const instLogEnt = entrepot.instructionLogistique
      ? entrepot.instructionLogistique
      : "";
    let instLog = instLogClt + (instLogEnt ? " " : "") + instLogEnt;
    instLog = instLog.substring(0, 280);

    return this.fetchDeviseRef(entrepot.client?.devise).pipe(
      switchMap((deviseRef) =>
        this.ordresService.save_v2(["id", "numero"], {
          ordre: {
            // from `heriteEntrepot.pbl`
            numero,
            codeAlphaEntrepot: entrepot.code,
            instructionsLogistiques: instLog,
            campagne: { id: this.societe.campagne.id },
            dateDepartPrevue: this.dateManagementService.findDateTimeZero(0),
            dateLivraisonPrevue: delivery,
            etaDate: entrepot?.client?.secteur?.id === "MAR" ? this.dateManagementService.formatDate(delivery) : null,
            societe: { id: this.societe.id },
            entrepot: { id: entrepot.id },
            pays: entrepot.pays ? { id: entrepot.pays.id } : null,
            incoterm: entrepot.incoterm ? { id: entrepot.incoterm.id } : null,
            regimeTva: entrepot.regimeTva
              ? { id: entrepot.regimeTva.id }
              : null,
            baseTarifTransport: entrepot.baseTarifTransport
              ? { id: entrepot.baseTarifTransport.id }
              : null,
            transitaire: entrepot.transitaire
              ? { id: entrepot.transitaire.id }
              : null,
            baseTarifTransit: entrepot.baseTarifTransit
              ? { id: entrepot.baseTarifTransit.id }
              : null,
            ...(this.societe.id !== "BUK"
              ? {
                transporteur: { id: "-" },
                bassinTransporteur: "",
                prixUnitaireTarifTransport: 0,
                transporteurDEVPrixUnitaire: 0,
              }
              : {
                transporteur: { id: entrepot.transporteur?.id ?? "-" },
                prixUnitaireTarifTransport:
                  entrepot?.prixUnitaireTarifTransport,
                transporteurDEVPrixUnitaire:
                  entrepot?.prixUnitaireTarifTransport,
              }),
            transporteurDEVTaux: 1,
            transporteurDEVCode: {
              id: this.currentCompanyService.getCompany().devise.id,
            },
            assistante,
            commercial,
            typeTransport: entrepot.typeCamion
              ? { id: entrepot.typeCamion.id }
              : null,
            ...(this.societe.id === "SA" &&
              this.authService.currentUser.getSUP()
              ? {
                assistante: this.authService.currentUser?.assistante
                  ? {
                    id: this.authService.currentUser?.assistante?.id,
                  }
                  : assistante,
                commercial: this.authService.currentUser?.commercial
                  ? {
                    id: this.authService.currentUser?.commercial?.id,
                  }
                  : commercial,
              }
              : {}),
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
            exclusionFraisPU:
              entrepot?.client?.fraisExcluArticlePasOrigineFrance,
            incotermLieu: "",
            referenceClient: "",
            venteACommission: false,
            client: entrepot?.client ? { id: entrepot?.client.id } : null,
            secteurCommercial: entrepot?.client?.secteur
              ? { id: entrepot?.client?.secteur.id }
              : null,
            devise: entrepot?.client?.devise
              ? { id: entrepot?.client?.devise.id }
              : null,
            moyenPaiement: entrepot?.client?.moyenPaiement
              ? { id: entrepot?.client?.moyenPaiement.id }
              : null,
            basePaiement: entrepot?.client?.basePaiement
              ? { id: entrepot?.client?.basePaiement.id }
              : null,
            typeVente: entrepot?.client?.typeVente
              ? { id: entrepot?.client?.typeVente.id }
              : null,
            courtier: entrepot?.client?.courtier
              ? { id: entrepot?.client?.courtier.id }
              : null,
            baseTarifCourtage: entrepot?.client?.courtageModeCalcul
              ? { id: entrepot?.client?.courtageModeCalcul.id }
              : null,
            fraisUnite: entrepot?.client?.fraisMarketingModeCalcul
              ? {
                id: entrepot?.client?.fraisMarketingModeCalcul.id,
              }
              : null,
            ...(this.societe.id === "SA" &&
              this.authService.currentUser.getSUP() === "SUP" &&
              entrepot?.client?.courtier?.id === "LAPARRA"
              ? {
                // On supprime les frais de courtage
                courtier: { id: "" },
                baseTarifCourtage: { id: "" },
                prixUnitaireTarifCourtage: 0,
              }
              : {}),
            // Gestion de la devise par société
            ...(entrepot?.client?.devise.id === this.societe?.devise.id
              ? {
                tauxDevise: 1,
              }
              : {
                ...(entrepot?.client?.deviseTauxFix
                  ? {
                    ...(entrepot?.client?.dateDeviseTauxFix &&
                      Date.parse(entrepot.client.dateDeviseTauxFix) <
                      Date.now() &&
                      ((entrepot.client.dateDeviseTauxFix = null), {})),
                    ...(entrepot?.client?.dateDeviseTauxFix
                      ? {
                        tauxDevise: deviseRef?.taux,
                      }
                      : {
                        tauxDevise: entrepot.client.dateDeviseTauxFix,
                      }),
                  }
                  : { tauxDevise: deviseRef?.taux }),
              }),
          } as Partial<Ordre>,
        })
      ),
      map((r) => r.data.saveOrdre)
    );
  }

  private fetchDeviseRef(devise: Partial<Devise>) {
    return this.devisesRefsService
      .getList(
        `id=="${this.societe.devise.id}" and devise.id=="${devise.id}"`,
        ["id", "taux"]
      )
      .pipe(map((res) => res.data.allDeviseRefList?.[0]));
  }
}

@NgModule({
  declarations: [NouvelOrdreComponent],
  exports: [NouvelOrdreComponent],
  imports: [
    CommonModule,
    SharedModule,
    DxButtonModule,
    DxRadioGroupModule,
    InfoPopupModule,
    ButtonLoaderModule,
    GridEntrepotsModule,
    GridHistoriqueEntrepotsModule
  ],
})
export class NouvelOrdreModule { }
