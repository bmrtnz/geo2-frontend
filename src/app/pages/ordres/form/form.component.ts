import {
  AfterViewInit,
  Component, ElementRef, EventEmitter, OnDestroy, OnInit,
  Output, QueryList, ViewChild, ViewChildren
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { FileManagerComponent } from "app/shared/components/file-manager/file-manager-popup.component";
import { PromptPopupComponent } from "app/shared/components/prompt-popup/prompt-popup.component";
import { Role, Societe, Type } from "app/shared/models";
import { Ordre, Statut } from "app/shared/models/ordre.model";
import { confirm, alert } from "devextreme/ui/dialog";
import {
  AuthService,
  ClientsService,
  EntrepotsService,
  LocalizationService,
  TransporteursService
} from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { DevisesService } from "app/shared/services/api/devises.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { IncotermsService } from "app/shared/services/api/incoterms.service";
import { InstructionsService } from "app/shared/services/api/instructions.service";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { MruOrdresService } from "app/shared/services/api/mru-ordres.service";
import { OrdresBafService } from "app/shared/services/api/ordres-baf.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { PortsService } from "app/shared/services/api/ports.service";
import { TypesCamionService } from "app/shared/services/api/types-camion.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { DxAccordionComponent, DxCheckBoxComponent, DxSelectBoxComponent } from "devextreme-angular";
import { dxElement } from "devextreme/core/element";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { of, Subject } from "rxjs";
import { concatMap, filter, first, map, switchMap, takeUntil, takeWhile } from "rxjs/operators";
import { ViewDocument } from "../../../shared/components/view-document-popup/view-document-popup.component";
import Document from "../../../shared/models/document.model";
// tslint:disable-next-line: max-line-length
import { ConfirmationResultPopupComponent } from "../actions-documents-ordres/confirmation-result-popup/confirmation-result-popup.component";
import { AjoutArticlesHistoPopupComponent } from "../ajout-articles-histo-popup/ajout-articles-histo-popup.component";
import { AjoutArticlesManuPopupComponent } from "../ajout-articles-manu-popup/ajout-articles-manu-popup.component";
import { AjoutArticlesStockPopupComponent } from "../ajout-articles-stock-popup/ajout-articles-stock-popup.component";
import { GridCommandesComponent } from "../grid-commandes/grid-commandes.component";
import { GridDetailPalettesComponent } from "../grid-detail-palettes/grid-detail-palettes.component";
import { GridLignesDetailsComponent } from "../grid-lignes-details/grid-lignes-details.component";
import { GridLignesTotauxDetailComponent } from "../grid-lignes-totaux-detail/grid-lignes-totaux-detail.component";
import { GridMargeComponent } from "../grid-marge/grid-marge.component";
import { RouteParam, TabChangeData, TabContext, TAB_ORDRE_CREATE_ID } from "../root/root.component";
import { ZoomClientPopupComponent } from "../zoom-client-popup/zoom-client-popup.component";
import { ZoomEntrepotPopupComponent } from "../zoom-entrepot-popup/zoom-entrepot-popup.component";
import { ZoomTransporteurPopupComponent } from "../zoom-transporteur-popup/zoom-transporteur-popup.component";

/**
 * Grid with loading toggled by parent
 * Don't forget to cancel datasource loading in your component
 */
export interface ToggledGrid {
  onToggling(active: boolean);
}

enum Fragments {
  Head = "head",
  Articles = "articles",
  Logistique = "logistique",
  Litiges = "litiges",
  Synthese = "synthese",
  Flux = "flux",
  CQ = "cq",
  Commentaires = "commentaires",
  Log = "log",
}

enum LinkedCriterias {
  Client = "Réf. Clt",
  Compl = "Compl.",
  Regul = "Régul."
}

let self;

@Component({
  selector: "app-form",
  templateUrl: "./form.component.html",
  styleUrls: ["./form.component.scss"]
})
export class FormComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() public ordre: Ordre;
  @Output() openArticleManuPopup = new EventEmitter<any>();
  @Output() articleRowKey: string;
  @Output() public clientId: string;
  @Output() public clientCode: string;
  @Output() public clientTitle: string;
  @Output() public entrepotId: string;
  @Output() public entrepotCode: string;
  @Output() public entrepotTitle: string;
  @Output() public transporteurLigneId: string;
  @Output() public transporteurTitle: string;
  @Output() public readOnlyMode: boolean;
  @Output() public ordreBAFOuFacture: boolean;

  private readonly headerFields = [
    "id",
    "numero",
    "statut",
    "campagne.id",
    "client.id",
    "client.code",
    "client.raisonSocial",
    "client.modificationDetail",
    "client.certifications.certification.id",
    "entrepot.id",
    "entrepot.code",
    "referenceClient",
    "dateDepartPrevue",
    "dateLivraisonPrevue",
    "incoterm.id",
    "transporteur.id",
    "typeTransport.id",
    "prixUnitaireTarifTransport",
    "fraisUnite.id",
    "instructionsLogistiques",
    "commentaireUsageInterne",
    "codeChargement",
    "etdDate",
    "etaDate",
    "portTypeD.id",
    "portTypeA.id",
    "incotermLieu",
    "devise.id",
    "tauxDevise",
    "commercial.id",
    "assistante.id",
    "venteACommission",
    "secteurCommercial.id",
    "transporteurDEVCode.id",
    "transporteurDEVTaux",
    "baseTarifTransport.id",
    "client.instructionCommercial",
    "entrepot.instructionSecretaireCommercial",
    "entrepot.gestionnaireChep",
    "entrepot.referenceChep",
    "fraisPrixUnitaire",
    "fraisUnite.id",
    "fraisPlateforme",
    "hasLitige",
    "cqLignesCount",
    "commentairesOrdreCount",
    "regimeTva.id",
    "facture",
    "bonAFacturer",
    "numeroFacture",
    "documentFacture.isPresent",
    "documentFacture.uri",
    "documentFacture.type"
  ];

  private destroy = new Subject<boolean>();
  private anchorsInitialized = false;

  public fragments = Fragments;
  public status: string;
  public ordreFacture: boolean;
  public numeroFacture: string;
  public refOrdre: string;
  public formGroup = this.formBuilder.group({
    id: [""],
    client: [""],
    entrepot: [""],
    referenceClient: [""],
    transporteur: [""],
    transporteurDEVCode: [""],
    prixUnitaireTarifTransport: [""],
    transporteurDEVTaux: [""],
    baseTarifTransport: [""],
    typeTransport: [""],
    commercial: [""],
    assistante: [""],
    incoterm: [""],
    instructionsLogistiques: [""],
    dateDepartPrevue: [""],
    dateLivraisonPrevue: [""],
    etdDate: [""],
    etaDate: [""],
    portTypeD: [""],
    portTypeA: [""],
    codeChargement: [""],
    incotermLieu: [""],
    venteACommission: [""],
    devise: [""],
    tauxDevise: [""],
    litigeNumero: [""],
    bonAFacturer: [""],
    commentaireUsageInterne: [""],
    facture: [""],
    factureEDI: [""],
    livre: [""],
    search: [""],
  });
  public linkedOrdersSearch: boolean;
  public linkedOrders: any;
  public ordresLignesViewExp: boolean;

  public canDuplicate = false;
  public dotLitiges: string;
  public dotCommentaires: number;
  public dotCQ: number;
  public orderNumber: string;
  public fullOrderNumber: string;
  public env = environment;
  public allowMutations = false;
  public headerSaving;
  public instructionsList: string[];

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
  public fraisClient: string;
  public gestEntrepot: string;
  public instructionsComm: string;
  public histoLigneOrdreReadOnlyText: string;
  public histoLigneOrdreText: string;
  public showBAFButton: boolean;

  public factureVisible = false;
  public currentFacture: ViewDocument;

  @ViewChild(FileManagerComponent, { static: false })
  fileManagerComponent: FileManagerComponent;
  @ViewChild("comLog", { static: false }) comLog: DxSelectBoxComponent;
  @ViewChild("comInt", { static: false }) comInt: DxSelectBoxComponent;
  @ViewChild("leftAccessPanel", { static: false }) leftAccessPanel: DxCheckBoxComponent;
  @ViewChildren(DxAccordionComponent) accordion: DxAccordionComponent[];
  @ViewChildren("anchor") anchors: QueryList<ElementRef | DxAccordionComponent>;
  @ViewChild(AjoutArticlesManuPopupComponent, { static: false }) ajoutArtManu: AjoutArticlesManuPopupComponent;
  @ViewChild(AjoutArticlesHistoPopupComponent, { static: false }) ajoutArtHisto: AjoutArticlesHistoPopupComponent;
  @ViewChild(AjoutArticlesStockPopupComponent, { static: false }) ajoutArtStock: AjoutArticlesStockPopupComponent;
  @ViewChild(ZoomTransporteurPopupComponent, { static: false }) zoomTransporteurFilePopup: ZoomTransporteurPopupComponent;
  @ViewChild(ZoomClientPopupComponent, { static: false }) zoomClientFilePopup: ZoomClientPopupComponent;
  @ViewChild(ZoomEntrepotPopupComponent, { static: false }) zoomEntrepotFilePopup: ZoomEntrepotPopupComponent;
  @ViewChild(GridCommandesComponent) gridCommandes: GridCommandesComponent;
  @ViewChild(GridLignesDetailsComponent) gridLignesDetail: GridLignesDetailsComponent;
  @ViewChild(GridLignesTotauxDetailComponent) gridLTD: GridLignesTotauxDetailComponent;
  @ViewChild(GridDetailPalettesComponent) gridDetailPalettes: GridDetailPalettesComponent;
  @ViewChild(GridMargeComponent) gridMarge: GridMargeComponent;
  @ViewChild(ConfirmationResultPopupComponent) resultPopup: ConfirmationResultPopupComponent;
  @ViewChild(PromptPopupComponent) promptPopup: PromptPopupComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private functionsService: FunctionsService,
    private formBuilder: FormBuilder,
    private formUtils: FormUtilsService,
    private ordresService: OrdresService,
    private ordresBafService: OrdresBafService,
    private currentCompanyService: CurrentCompanyService,
    private clientsService: ClientsService,
    private typesCamionService: TypesCamionService,
    private devisesService: DevisesService,
    private incotermsService: IncotermsService,
    private entrepotsService: EntrepotsService,
    private personnesService: PersonnesService,
    private instructionsService: InstructionsService,
    private portsService: PortsService,
    public formUtilsService: FormUtilsService,
    private basesTarifService: BasesTarifService,
    private transporteursService: TransporteursService,
    private litigesService: LitigesService,
    private mruOrdresService: MruOrdresService,
    private tabContext: TabContext,
    public authService: AuthService,
    private localization: LocalizationService
  ) {
    this.handleTabChange()
      .subscribe(event => {
        this.initializeAnchors(event);
        if (event.status === "in")
          this.refetchStatut();
      });
    self = this;
  }

  ngOnInit() {
    this.initializeForm();
    this.initializeAnchors();

    this.clientsDS = this.clientsService.getDataSource_v2(["id", "code", "raisonSocial"]);
    this.entrepotDS = this.entrepotsService.getDataSource_v2(["id", "code", "raisonSocial"]);
    this.deviseDS = this.devisesService.getDataSource();
    this.incotermsDS = this.incotermsService.getDataSource();
    this.typeTransportDS = this.typesCamionService.getDataSource();
    this.baseTarifTransportDS = this.basesTarifService.getDataSource();

    this.commercialDS = this.personnesService.getDataSource();
    this.commercialDS.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.COMMERCIAL]
    ]);

    this.assistanteDS = this.personnesService.getDataSource();
    this.assistanteDS.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.ASSISTANT]
    ]);
    this.portTypeDDS = this.portsService.getDataSource();
    this.portTypeDDS.filter([
      ["valide", "=", true],
      "and",
      ["type", "=", Type.PORT_DE_DEPART]
    ]);

    this.portTypeADS = this.portsService.getDataSource();
    this.portTypeADS.filter([
      ["valide", "=", true],
      "and",
      ["type", "=", Type.PORT_D_ARRIVEE]
    ]);

    this.transporteursDS = this.transporteursService.getDataSource_v2(["id", "raisonSocial"]);
    this.transporteursDS.filter(["valide", "=", true]);
    this.instructionsList = [];
    this.instructionsService.getDataSource_v2(["id", "description", "valide"]).load().then(res => {
      res
        .filter(inst => inst.valide)
        .map(inst => this.instructionsList.push(inst.description));
    });

  }

  ngAfterViewInit() {
    // Show/hide left button panel
    this.leftAccessPanel.value =
      window.sessionStorage.getItem("HideOrderleftPanelView") === "true" ? false : true;
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }

  onComChanged() {
    this.comLog?.instance.option("hint", this.comLog.value);
    this.comInt?.instance.option("hint", this.comInt.value);
  }

  saveHeaderOnTheFly() {
    if (this.headerSaving) return;
    if (!this.formGroup.pristine && this.formGroup.valid && !this.env.production) {
      this.headerSaving = true;
      const ordre = this.formUtils.extractDirty(this.formGroup.controls, Ordre.getKeyField());
      ordre.societe = { id: this.currentCompanyService.getCompany().id };

      this.ordresService.save({ ordre }).subscribe({
        next: (res) => {
          this.refreshStatus(res.data.saveOrdre.statut);
          this.headerSaving = false;
        },
        error: (err) => {
          notify("Erreur sauvegarde entête", "error", 3000);
          console.log(err);
          this.headerSaving = false;
        }
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
    if (!itemElement.dataset.toggled) itemElement.dataset.toggled = "false";
    itemElement.dataset.toggled =
      itemElement.dataset.toggled === "true" ? "false" : "true";
    if (overrideTogglingTo)
      itemElement.dataset.toggled = overrideTogglingTo.toString();
    grids.forEach((grid) =>
      grid.onToggling(itemElement.dataset.toggled === "true")
    );
  }

  onDeleteOrderClick() {
    if (!this.ordre.id) return;
    this.promptPopup.show(
      {
        validText: "btn-suppression-ordre",
        commentMaxLength: 70
      }
    );
  }

  validateDeleteOrder(comment) {
    this.localization.localize("hint-ajout-ordre");

    const result = confirm(
      this.localization.localize("text-popup-supprimer-ordre"),
      `${this.localization.localize("suppression-ordre")} n°${this.ordre.numero}`
    );
    result.then(res => {
      if (res) {
        this.ordresService.fSuppressionOrdre(this.ordre.id, comment, this.authService.currentUser.nomUtilisateur)
          .subscribe({
            next: () => {
              notify(this.localization.localize("text-popup-suppression-ok"), "info", 7000);
            },
            error: (error: Error) => {
              alert(this.messageFormat(error.message), this.localization.localize("suppression-ordre"));
            }
          });
      } else {
        notify(this.localization.localize("text-popup-abandon-suppression"), "warning", 7000);
      }
    });

  }

  private messageFormat(mess) {
    mess = mess.replace("Exception while fetching data (/fSuppressionOrdre) : ", "");
    return mess;
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  onArticleManClick(e?) {
    this.articleRowKey = e;
    this.ajoutArtManu.visible = true;
  }

  onArticleHistoClick() {
    this.readOnlyMode = !this.fullOrderNumber || !this.allowMutations;
    this.ajoutArtHisto.visible = true;
  }

  onArticleStockClick() {
    this.ajoutArtStock.visible = true;
  }

  detailExp() {
    this.ordresLignesViewExp = !this.ordresLignesViewExp;
  }

  duplicate() {
    if (this.formGroup.pristine && this.formGroup.valid) {
      const ordre = this.formUtils.extractDirty(this.formGroup.controls, Ordre.getKeyField());

      this.ordresService.clone({ ordre }).subscribe({
        next: (e) => {
          notify("Dupliqué", "success", 3000);
        },
        error: () => notify("Echec de la duplication", "error", 3000),
      });
    }
  }

  deleteOrder() {
    // const ordre = this.formUtils.extractDirty(this.formGroup.controls, Ordre.getKeyField());
    // if (!ordre.id) return;
    // this.ordresService.delete({ id: ordre.id }).subscribe({
    //   next: (_) => {
    //     notify("Ordre " + ordre.numero + " supprimé", "success", 3000);
    //   },
    //   error: (_) => notify("Echec de la suppression", "error", 3000),
    // });
  }

  addLinkedOrders() {
    // Accole au numéro d'ordre les ordres liés

    this.linkedOrdersSearch = true;
    this.linkedOrders = [];

    const refClt = this.ordre.referenceClient;

    if (refClt) {
      this.linkedOrdersSearch = true;
      const numero = this.ordre.numero;
      const ordresSource = this.ordresService.getDataSource_v2(["id", "numero", "campagne.id"]);
      ordresSource.filter([
        ["client.id", "=", this.ordre.client.id],
        "and",
        ["referenceClient", "=", refClt],
        "and",
        ["dateLivraisonPrevue", "=", this.ordre.dateLivraisonPrevue],
        "and",
        ["incoterm.id", "=", this.ordre.incoterm?.id],
        "and",
        ["regimeTva.id", "=", this.ordre.regimeTva?.id]
      ]);
      ordresSource.load().then((res) => {
        res.filter(value => value.numero !== numero).map(value => {
          this.linkedOrders.push({ ordre: value, criteria: LinkedCriterias.Client });
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
      hasCompl.split(",").map(res => {
        this.linkedOrders.push({ ordre: { numero: res }, criteria: LinkedCriterias.Compl, class: "Compl" });
      });
    }
    if (hasRegul) {
      hasRegul.split(";").map(res => {
        this.linkedOrders.push({ ordre: { numero: res }, criteria: LinkedCriterias.Regul, class: "Regul" });
      });
    }
    if (!refClt) this.linkedOrdersSearch = false;
  }

  openLinkedOrder(ordre: Partial<Ordre>) {
    this.tabContext.openOrdre(ordre.numero, ordre.campagne.id);
  }

  deviseDisplayExpr(item) {
    return item ? item.id + " - " + item.description + (item.taux !== null ? " (" + item.taux + ")" : "") : null;
  }

  displayIDBefore(data) {
    return data ?
      (data.id + " - " + (data.nomUtilisateur ? data.nomUtilisateur : (data.raisonSocial ? data.raisonSocial : data.description)))
      : null;
  }

  displayCodeBefore(data) {
    return data ? data.code + " - " + data.raisonSocial : null;
  }

  public onLignesChanged(e) {
    this.gridCommandes.update();
  }

  private initializeForm(fetchPol?) {

    const currentCompany: Societe = this.currentCompanyService.getCompany();
    this.route.paramMap
      .pipe(
        first(),
        map(params => this.tabContext.parseTabID(params.get(RouteParam.TabID))),
        switchMap(([numero, campagneID]) => {
          if (numero === TAB_ORDRE_CREATE_ID) return of({} as Ordre);
          return this.ordresService
            .getOneByNumeroAndSocieteAndCampagne(numero, currentCompany.id, campagneID, this.headerFields, fetchPol)
            .pipe(
              map(res => res.data.ordreByNumeroAndSocieteAndCampagne),
            );
        }),
      )
      .subscribe(ordre => {
        this.ordre = ordre;
        if (this.ordre === null) return;
        this.allowMutations = !this.env.production && !Ordre.isCloture(this.ordre);
        this.fraisClient = this.getFraisClient();
        this.gestEntrepot = this.getGestEntrepot();
        this.fetchFullOrderNumber();
        this.refOrdre = this.ordre?.id ? ordre.id : "-";
        this.canDuplicate = !!this?.ordre?.id;
        this.formGroup.reset(ordre);
        this.instructionsComm = this.getinstructionsComm();
        const instLog = this.ordre.instructionsLogistiques;
        if (this.comLog) this.comLog.instance.option("hint", instLog);
        this.addLinkedOrders();
        this.refreshBadges();
        this.refreshStatus(this.ordre.statut);
        window.sessionStorage.setItem("idOrdre", this.ordre.id);
        window.sessionStorage.setItem("numeroOrdre" + this.ordre.numero, this.ordre.id);
        this.mruOrdresService.saveMRUOrdre(this.ordre); // Save last opened order into MRU table

        this.formGroup.valueChanges.subscribe((_) => {
          this.saveHeaderOnTheFly();
        });

        this.histoLigneOrdreText =
          `${this.localization.localize("hint-ajout-ordre")} ${this.localization.localize("hint-source-historique")}`;
        this.histoLigneOrdreReadOnlyText =
          `${this.localization.localize("hint-client-historique")}`;

        this.showBAFButton =
          this.ordre.bonAFacturer === false &&
          this.ordre.client.usageInterne !== true &&
          (this.ordre.codeAlphaEntrepot ? this.ordre.codeAlphaEntrepot.substring(0, 8) !== "PREORDRE" : true);

      });
  }

  private initializeAnchors(event?: TabChangeData) {
    if (event) {
      if (event.status === "in")
        this.enableAnchors();
      if (event.status === "out")
        this.disableAnchors();
    }
    if (!this.anchorsInitialized) {
      this.handleAnchorsNavigation();
      this.anchorsInitialized = true;
    }
  }

  private handleTabChange() {
    return this.route.paramMap.pipe(
      first(),
      switchMap(params =>
        this.tabContext.onTabChange
          .pipe(map(data => [data, params.get(RouteParam.TabID)] as [TabChangeData, string]))),
      filter(([{ item }, id]) => item.id === id),
      map(([item]) => item),
      takeUntil(this.destroy),
    );
  }

  private getAnchorElement(anchor: DxAccordionComponent | ElementRef<any>)
    : dxElement | HTMLElement {
    return anchor instanceof DxAccordionComponent
      ? anchor.instance.element()
      : anchor.nativeElement;
  }

  private enableAnchors() {
    this.anchors.forEach(anchor => {
      const element = this.getAnchorElement(anchor);
      element.setAttribute("id", element.dataset.fragmentId);
    });
  }

  private disableAnchors() {
    this.anchors.forEach(anchor => {
      const element = this.getAnchorElement(anchor);
      element.removeAttribute("id");
    });
  }

  private handleAnchorsNavigation() {
    const scrollTo = (elm: HTMLElement) =>
      elm.scrollIntoView({ behavior: "smooth" });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        switchMap(_ => this.route.fragment),
        filter(fragment => !!fragment),
        concatMap(fragment => of(this.anchors.find(item => this.getAnchorElement(item).id === fragment))
        ),
        filter(item => !!item),
      )
      .subscribe(item => {
        if (item instanceof DxAccordionComponent) {
          item.instance.expandItem(0);
          // @ts-ignore
          (item.onItemTitleClick as EventEmitter<>)
            .emit({
              overrideTogglingTo: true,
              itemElement: item.instance.element().querySelector("[role=\"tab\"]"),
            }, [item]);
          scrollTo(item.instance.element());
        } else scrollTo(item.nativeElement);
      });
  }

  private fetchFullOrderNumber() {

    const nouveau = this?.ordre?.statut;

    this.fullOrderNumber = [Statut[nouveau]].includes("NON_CONFIRME") ? "Nouvel " : "";

    this.fullOrderNumber += `Ordre N° ${(this.ordre.campagne
      ? (this.ordre.campagne.id ? this.ordre.campagne.id : this.ordre.campagne) + "-"
      : "") + this.ordre.numero
      }`;

  }

  private refreshBadges() {
    // Gestion des pastilles infos boutons gauche
    if (this.ordre) {
      this.dotLitiges = this.ordre.hasLitige ? "!" : "";
      this.dotCQ = this.ordre.cqLignesCount;
      this.dotCommentaires = this.ordre.commentairesOrdreCount;
    }
  }

  leftPanelChange(e) {
    window.sessionStorage.setItem("HideOrderleftPanelView", e.value === true ? "false" : "true");
  }

  getFraisClient() {

    const fraisPU = this.ordre.fraisPrixUnitaire;
    let fraisUnite = this.ordre.fraisUnite?.id;
    const fraisPlateforme = this.ordre.fraisPlateforme;
    let messFraisPlateforme = "";

    if (fraisPlateforme > 0) {
      messFraisPlateforme = "Frais plateforme "
        + fraisPlateforme + " "
        + this.currentCompanyService.getCompany().devise.id
        + " le kilo";
    }

    if (!fraisUnite) fraisUnite = "";

    return "Frais client " + fraisPU + " " + fraisUnite + " " + messFraisPlateforme;

  }

  getGestEntrepot() {
    if (!this.ordre.entrepot.gestionnaireChep) return;
    return this.ordre.entrepot.gestionnaireChep
      + " " + this.ordre.entrepot.referenceChep;
  }

  getinstructionsComm() {
    const instCommClt = this.ordre.client.instructionCommercial ?
      this.ordre.client.instructionCommercial : "";
    const instCommEnt = this.ordre.entrepot.instructionSecretaireCommercial ?
      this.ordre.entrepot.instructionSecretaireCommercial : "";
    return instCommClt + (instCommClt ? " " : "") + instCommEnt;
  }

  private refreshStatus(statut: Statut) {
    this.status = Statut[statut] + (this.ordre?.factureEDI ? " EDI" : "");
    this.ordreFacture = Statut[statut] === Statut.FACTURE.toString();
    if (this.ordreFacture) this.numeroFacture = this.ordre.numeroFacture;
    this.ordreBAFOuFacture = this.ordreFacture || Statut[statut] === Statut.A_FACTURER.toString();
  }

  openClientFilePopup() {
    this.clientId = this.ordre?.client?.id;
    this.clientCode = this.ordre?.client?.code;
    if (this.clientId !== null) this.zoomClientFilePopup.visible = true;
  }

  openEntrepotFilePopup() {
    this.entrepotId = this.ordre?.entrepot?.id;
    this.entrepotCode = this.ordre?.entrepot?.code;
    if (this.entrepotId !== null) this.zoomEntrepotFilePopup.visible = true;
  }

  openTransporteurFilePopup() {
    this.transporteurLigneId = this.formGroup.get("transporteur").value?.id;
    if (this.transporteurLigneId !== null) this.zoomTransporteurFilePopup.visible = true;
  }

  private refetchStatut() {
    this.route.paramMap
      .pipe(
        first(),
        map(params => this.tabContext.parseTabID(params.get(RouteParam.TabID))),
        concatMap(([numero, campagneID]) => this.ordresService
          .getOneByNumeroAndSocieteAndCampagne(
            numero,
            this.currentCompanyService.getCompany().id,
            campagneID,
            ["id", "statut"],
          )),
        takeWhile(res => res.loading),
        map(res => res.data.ordreByNumeroAndSocieteAndCampagne),
      )
      .subscribe({
        next: ordre => this.refreshStatus(ordre.statut),
      });
  }

  public refreshGridLigneDetail(e) {
    this.gridLignesDetail?.refresh(e);
  }

  public refreshGridsSynthese() {
    this.gridLTD?.refresh();
    this.gridDetailPalettes?.refresh();
    this.gridMarge?.refresh();
  }

  async viewFacture(titleKey: string, document: Document) {
    if (!document || !document.isPresent) {
      notify("Désolé, facture non accessible", "error");
      return;
    }

    this.currentFacture = {
      title: this.localization.localize(titleKey),
      document,
    };

    this.factureVisible = true;
  }

  public bonAFacturer() {

    const societe: Societe = this.currentCompanyService.getCompany();

    this.ordresBafService.fBonAFacturer([this.ordre.id], societe.id).subscribe(res => {
      this.initializeForm("no-cache");
    });

  }

}
