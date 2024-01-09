import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { ConfirmationResultPopupComponent } from "app/shared/components/confirmation-result-popup/confirmation-result-popup.component";
import { FileManagerComponent } from "app/shared/components/file-manager/file-manager-popup.component";
import { PromptPopupComponent } from "app/shared/components/prompt-popup/prompt-popup.component";
import { Role, Societe, Type } from "app/shared/models";
import { Ordre, Statut, StatutLocale } from "app/shared/models/ordre.model";
import {
  AuthService,
  ClientsService,
  EntrepotsService,
  LocalizationService,
  TransporteursService
} from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { DevisesService } from "app/shared/services/api/devises.service";
import { FunctionResult, FunctionsService } from "app/shared/services/api/functions.service";
import { IncotermsService } from "app/shared/services/api/incoterms.service";
import { InstructionsService } from "app/shared/services/api/instructions.service";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { MruEntrepotsService } from "app/shared/services/api/mru-entrepots.service";
import { MruOrdresService } from "app/shared/services/api/mru-ordres.service";
import { OrdresBafService } from "app/shared/services/api/ordres-baf.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { PortsService } from "app/shared/services/api/ports.service";
import { ReferencesClientService } from "app/shared/services/api/references-client.service";
import { RegimesTvaService } from "app/shared/services/api/regimes-tva.service";
import { TypesCamionService } from "app/shared/services/api/types-camion.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxCheckBoxComponent,
  DxSelectBoxComponent
} from "devextreme-angular";
import { dxElement } from "devextreme/core/element";
import DataSource from "devextreme/data/data_source";
import { alert, confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import hideToasts from "devextreme/ui/toast/hide_toasts";
import { combineLatest, defer, interval, Observable, of, Subject, Subscription } from "rxjs";

import { FileManagerService } from "app/shared/services/file-manager.service";
import { ONE_MINUTE } from "basic";
import FileSystemItem from "devextreme/file_management/file_system_item";
import {
  catchError,
  concatMap,
  concatMapTo,
  debounceTime, filter, finalize, first,
  map, startWith,
  switchMap,
  takeUntil,
  takeWhile,
  tap
} from "rxjs/operators";
import { ViewDocument } from "../../../shared/components/view-document-popup/view-document-popup.component";
import Document from "../../../shared/models/document.model";
import { ActionsDocumentsOrdresComponent } from "../actions-documents-ordres/actions-documents-ordres.component";
import { AjoutArticlesHistoPopupComponent } from "../ajout-articles-histo-popup/ajout-articles-histo-popup.component";
import { AjoutArticlesManuPopupComponent } from "../ajout-articles-manu-popup/ajout-articles-manu-popup.component";
import { AjoutArticlesRefClientPopupComponent } from "../ajout-articles-ref-client-popup/ajout-articles-ref-client-popup.component";
import { AjoutArticlesStockPopupComponent } from "../ajout-articles-stock-popup/ajout-articles-stock-popup.component";
import { DestockageAutoPopupComponent } from "../destockage-auto-popup/destockage-auto-popup.component";
import { DuplicationOrdrePopupComponent } from "../duplication-ordre-popup/duplication-ordre-popup.component";
import { FormLitigesComponent } from "../form-litiges/form-litiges.component";
import { GestionOperationsPopupComponent } from "../gestion-operations-popup/gestion-operations-popup.component";
import { GridCommandesComponent } from "../grid-commandes/grid-commandes.component";
import { GridDetailPalettesComponent } from "../grid-detail-palettes/grid-detail-palettes.component";
import { GridEnvoisComponent } from "../grid-envois/grid-envois.component";
import { GridLignesDetailsComponent } from "../grid-lignes-details/grid-lignes-details.component";
import { GridLignesTotauxDetailComponent } from "../grid-lignes-totaux-detail/grid-lignes-totaux-detail.component";
import { GridLogistiquesComponent } from "../grid-logistiques/grid-logistiques.component";
import { GridMargeComponent } from "../grid-marge/grid-marge.component";
import { GridOrdreLigneLogistiqueComponent } from "../grid-ordre-ligne-logistique/grid-ordre-ligne-logistique.component";
import { GridsService } from "../grids.service";
import { GroupageChargementsPopupComponent } from "../groupage-chargements-popup/groupage-chargements-popup.component";
import { ChoixEntrepotCommandeEdiPopupComponent } from "../indicateurs/commandes-edi/choix-entrepot-commande-edi-popup/choix-entrepot-commande-edi-popup.component";
import { ModifCommandeEdiPopupComponent } from "../indicateurs/commandes-edi/modif-commande-edi-popup/modif-commande-edi-popup.component";
import { MotifRegularisationOrdrePopupComponent } from "../motif-regularisation-ordre-popup/motif-regularisation-ordre-popup.component";
import {
  RouteParam,
  TabChangeData,
  TabContext,
  TAB_ORDRE_CREATE_ID
} from "../root/root.component";
import { SelectionComptePaloxPopupComponent } from "../selection-compte-palox-popup/selection-compte-palox-popup.component";
import { ZoomClientPopupComponent } from "../zoom-client-popup/zoom-client-popup.component";
import { ZoomEntrepotPopupComponent } from "../zoom-entrepot-popup/zoom-entrepot-popup.component";
import { ZoomTransporteurPopupComponent } from "../zoom-transporteur-popup/zoom-transporteur-popup.component";

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
  Regul = "Régul.",
  Palox = "Palox",
}

let self;

@Component({
  selector: "app-form",
  templateUrl: "./form.component.html",
  styleUrls: ["./form.component.scss"],
})
export class FormComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    public formUtils: FormUtilsService,
    private ordresService: OrdresService,
    private ordreLignesService: OrdreLignesService,
    private ordresBafService: OrdresBafService,
    private currentCompanyService: CurrentCompanyService,
    private clientsService: ClientsService,
    private typesCamionService: TypesCamionService,
    private devisesService: DevisesService,
    private incotermsService: IncotermsService,
    private litigesService: LitigesService,
    private entrepotsService: EntrepotsService,
    private personnesService: PersonnesService,
    private instructionsService: InstructionsService,
    private portsService: PortsService,
    public formUtilsService: FormUtilsService,
    private basesTarifService: BasesTarifService,
    private transporteursService: TransporteursService,
    private referencesClientService: ReferencesClientService,
    private mruOrdresService: MruOrdresService,
    public mruEntrepotsService: MruEntrepotsService,
    private tabContext: TabContext,
    public authService: AuthService,
    private localization: LocalizationService,
    private gridsService: GridsService,
    public gridUtilsService: GridUtilsService,
    public regimesTvaService: RegimesTvaService,
    public ordresLogistiquesService: OrdresLogistiquesService,
    private functionsService: FunctionsService,
    private fileManager: FileManagerService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.handleTabChange().subscribe((event) => {
      this.initializeAnchors(event);
      if (event.status === "in") {
        this.refetchSubscription = this.refetchOrder().subscribe({
          next: ordre => {
            if (ordre) this.refreshStatus(ordre.statut)
          },
        });
      }
      if (event.status === "out")
        this.refetchSubscription?.unsubscribe();
    });
    self = this;
  }

  @Input() public noLitiges: boolean;
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
    "client.depassement",
    "entrepot.id",
    "entrepot.code",
    "entrepot.raisonSocial",
    "referenceClient",
    "dateDepartPrevue",
    "dateLivraisonPrevue",
    "incoterm.id",
    "transporteur.id",
    "typeTransport.id",
    "transporteurDEVPrixUnitaire",
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
    "documentFacture.type",
    "listeOrdresRegularisations",
    "listeOrdresComplementaires",
    "type.id",
    "documentCMR.isPresent",
    "documentCMR.uri",
    "documentCMR.type",
    "descriptifRegroupement",
    "client.devise.id",
    "listeOrdreRefPalox",
    "ordreRefPaloxPere",
    "factureAvoir",
    "ordreEDI.id",
    "ordreEDI.canalCde",
    "entrepot.client.instructionLogistique",
    "entrepot.instructionLogistique"
  ];

  private destroy = new Subject<boolean>();
  private anchorsInitialized = false;
  private refetchSubscription: Subscription;

  public fragments = Fragments;
  public status: string;
  public ordreFacture: boolean;
  public canChangeDateLiv: boolean;
  public refOrdreEdi: any;
  public canalOrdreEdi: any;
  public numeroFacture: string;
  public numeroAvoir: string;
  public ordreAvoir: Partial<Ordre>;
  public refOrdre: string;
  public formGroup = this.formBuilder.group({
    id: [""],
    client: [""],
    entrepot: [""],
    referenceClient: [""],
    transporteur: [""],
    transporteurDEVCode: [""],
    transporteurDEVPrixUnitaire: [""],
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
  public allowMutations = false;
  public headerSaving: boolean;
  public headerRefresh: boolean;
  public instructionsList: string[];
  public blockPUDevUniteTransp: boolean;

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
  public promptPopupTitle: string;
  public promptPopupPurpose: string;
  public selectedLignes: string[];
  public selectedGridCdesRows: boolean;
  public cancelledOrder: boolean;
  public promptPopupDateOnly: boolean;
  private savedGridCdeStandby: boolean;

  public accordionButtons: HTMLElement[];
  public factureVisible = false;
  public currentFacture: ViewDocument;
  public allowVenteACommissionMutation: boolean;
  public refreshRegimeTva = new EventEmitter();
  public hideDuplicationBUK =
    this.currentCompanyService.getCompany().id !== "BUK";

  public running = {
    destockAuto: false,
    regulOrder: false,
    addRefsClient: false,
    suppLignesNonExp: false,
    createLitige: false,
    deleteOrder: false,
    cancelOrder: false
  }

  public doFactureDownload = () =>
    this.fileManager.downloadItems.call({ baseArgs: { key: "GEO_FACTURE" } }, [
      new FileSystemItem(`${this.currentCompanyService.getCompany().id}_F${this.ordre.numeroFacture}.pdf`, false),
    ])

  @ViewChild(FileManagerComponent, { static: false })
  fileManagerComponent: FileManagerComponent;
  @ViewChild("comLog", { static: false }) comLog: DxSelectBoxComponent;
  @ViewChild("comInt", { static: false }) comInt: DxSelectBoxComponent;
  @ViewChild("leftAccessPanel", { static: false })
  leftAccessPanel: DxCheckBoxComponent;
  @ViewChildren(DxAccordionComponent) accordion: QueryList<DxAccordionComponent>;
  @ViewChildren(DxButtonComponent) buttons: QueryList<ElementRef | DxButtonComponent>;
  @ViewChildren("anchor") anchors: QueryList<ElementRef | DxAccordionComponent>;
  @ViewChild(AjoutArticlesRefClientPopupComponent, { static: false })
  ajoutArtRefClt: AjoutArticlesRefClientPopupComponent;
  @ViewChild(AjoutArticlesManuPopupComponent, { static: false })
  ajoutArtManu: AjoutArticlesManuPopupComponent;
  @ViewChild(AjoutArticlesHistoPopupComponent, { static: false })
  ajoutArtHisto: AjoutArticlesHistoPopupComponent;
  @ViewChild(AjoutArticlesStockPopupComponent, { static: false })
  ajoutArtStock: AjoutArticlesStockPopupComponent;
  @ViewChild(ZoomTransporteurPopupComponent, { static: false })
  zoomTransporteurFilePopup: ZoomTransporteurPopupComponent;
  @ViewChild(ZoomClientPopupComponent, { static: false })
  zoomClientFilePopup: ZoomClientPopupComponent;
  @ViewChild(ZoomEntrepotPopupComponent, { static: false })
  zoomEntrepotFilePopup: ZoomEntrepotPopupComponent;
  @ViewChild(GridCommandesComponent) gridCommandes: GridCommandesComponent;
  @ViewChild(GridOrdreLigneLogistiqueComponent) gridSynthese: GridOrdreLigneLogistiqueComponent;
  @ViewChild(GridLignesDetailsComponent)
  gridLignesDetail: GridLignesDetailsComponent;
  @ViewChild(GridLignesTotauxDetailComponent)
  gridLTD: GridLignesTotauxDetailComponent;
  @ViewChild(GridDetailPalettesComponent)
  gridDetailPalettes: GridDetailPalettesComponent;
  @ViewChild(GridMargeComponent) gridMarge: GridMargeComponent;
  @ViewChild(ConfirmationResultPopupComponent)
  resultPopup: ConfirmationResultPopupComponent;
  @ViewChild(PromptPopupComponent) promptPopup: PromptPopupComponent;
  @ViewChild(ActionsDocumentsOrdresComponent)
  actionDocs: ActionsDocumentsOrdresComponent;
  @ViewChild(MotifRegularisationOrdrePopupComponent)
  motifRegulPopup: MotifRegularisationOrdrePopupComponent;
  @ViewChild(DuplicationOrdrePopupComponent)
  duplicationPopup: DuplicationOrdrePopupComponent;
  @ViewChild(GroupageChargementsPopupComponent)
  groupagePopup: GroupageChargementsPopupComponent;
  @ViewChild(DestockageAutoPopupComponent)
  destockageAutoPopup: DestockageAutoPopupComponent;
  @ViewChild(FormLitigesComponent) formLitiges: FormLitigesComponent;
  @ViewChild("litigesBtn", { read: ElementRef }) litigesBtn: ElementRef;
  @ViewChild(GestionOperationsPopupComponent)
  gestionOpPopup: GestionOperationsPopupComponent;
  @ViewChild(SelectionComptePaloxPopupComponent)
  comptePaloxPopup: SelectionComptePaloxPopupComponent;
  @ViewChild("gridLogistiques") gridLogistiques: GridLogistiquesComponent;
  @ViewChild(GridEnvoisComponent) gridEnvois: GridEnvoisComponent;
  @ViewChild(ModifCommandeEdiPopupComponent) modifCdeEdiPopup: ModifCommandeEdiPopupComponent;
  @ViewChild(ChoixEntrepotCommandeEdiPopupComponent, { static: false }) choixEntPopup: ChoixEntrepotCommandeEdiPopupComponent;

  public mentionRegimeTva: Observable<string>;
  public descriptifRegroupement: string;
  public bafButtonEnabled = true;

  ngOnInit() {
    this.initializeForm();
    this.initializeAnchors();

    this.clientsDS = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
    ]);
    this.entrepotDS = this.entrepotsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
    ]);
    this.deviseDS = this.devisesService.getDataSource();
    this.incotermsDS = this.incotermsService.getDataSource();
    this.typeTransportDS = this.typesCamionService.getDataSource();
    this.baseTarifTransportDS = this.basesTarifService.getDataSource();

    this.commercialDS = this.personnesService.getDataSource();
    this.commercialDS.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.COMMERCIAL],
    ]);

    this.assistanteDS = this.personnesService.getDataSource();
    this.assistanteDS.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.ASSISTANT],
    ]);
    this.portTypeDDS = this.portsService.getDataSource();
    this.portTypeDDS.filter([
      ["valide", "=", true],
      "and",
      ["type", "=", Type.PORT_DE_DEPART],
    ]);

    this.portTypeADS = this.portsService.getDataSource();
    this.portTypeADS.filter([
      ["valide", "=", true],
      "and",
      ["type", "=", Type.PORT_D_ARRIVEE],
    ]);

    this.transporteursDS = this.transporteursService.getDataSource_v2([
      "id",
      "raisonSocial",
    ]);
    this.transporteursDS.filter(["valide", "=", true]);
    this.instructionsList = [];
    this.instructionsService
      .getDataSource_v2(["id", "description", "valide"])
      .load()
      .then((res) => {
        res
          .filter((inst) => inst.valide)
          .map((inst) => this.instructionsList.push(inst.description));
      });

    this.mentionRegimeTva = this.mentionRegimeTva = combineLatest([
      this.formGroup.valueChanges,
      this.route.paramMap,
      this.tabContext.onTabChange,
      this.refreshRegimeTva.asObservable().pipe(startWith(1)),
    ]).pipe(
      concatMap(async ([control, params, x]) => {
        const [numero, campagne] = this.tabContext.parseTabID(
          params.get("tabid")
        );
        if (!campagne) return;
        const current = this.ordresService
          .getOneByNumeroAndSocieteAndCampagne(
            numero,
            this.currentCompanyService.getCompany().id,
            campagne,
            ["id", "regimeTva.id"]
          )
          .toPromise();
        return [
          control,
          (await current).data.ordreByNumeroAndSocieteAndCampagne,
        ];
      }),
      filter((r) => !!r),
      filter(([control, ordre]) => control?.id === ordre.id),
      debounceTime(1000),
      concatMap(([, ordre]) =>
        this.regimesTvaService.ofInitRegimeTva(ordre.id, ordre.regimeTva.id)
      ),
      map((res) => res.data.ofInitRegimeTva.msg),
    );

    combineLatest([
      this.formGroup.get("transporteurDEVCode").valueChanges,
      this.formGroup.get("incoterm").valueChanges,
      this.formGroup.get("transporteur").valueChanges,
    ])
      .pipe(
        filter((res) => !!this.ordre.transporteurDEVCode?.id),
        concatMap(([transporteurDEVCode, incoterm]) =>
          this.ordresService.updateTransporteurPU({
            ...this.ordre,
            transporteurDEVCode,
            incoterm,
          })
        ),
        concatMap(ordre => this.functionsService.onChangeTrpDevCode(
          ordre.id,
          ordre.transporteurDEVCode.id,
          this.currentCompanyService.getCompany().id,
          ordre.transporteurDEVPrixUnitaire).pipe(map(() => ordre))),
      )
      .subscribe((res) => {
        this.formGroup
          .get("transporteurDEVPrixUnitaire")
          .setValue(res.transporteurDEVPrixUnitaire);
        this.formGroup
          .get("baseTarifTransport")
          .setValue(res.baseTarifTransport);
      });
  }

  ngAfterViewInit() {
    // Keep this, anchors may, in some cases, not created as they should
    this.enableAnchors();
    this.updateTabStatusDot();
    // Show/hide left button panel
    this.leftAccessPanel.value =
      window.localStorage.getItem("HideOrderleftPanelView") === "true"
        ? false
        : true;
  }

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }

  scrollOpenAccordion(fragment) {
    const accordion: DxAccordionComponent = this.accordion.find(r => r.instance.$element()[0].id === fragment);
    accordion.instance.option("animationDuration", 0);
    this.openFormAccordions(fragment);
    setTimeout(() => {
      accordion.instance.element().scrollIntoView();
      accordion.instance.option("animationDuration", 300);
    }, 10);
  }

  onComChanged() {
    this.comLog?.instance.option("hint", this.comLog.value);
    this.comInt?.instance.option("hint", this.comInt.value);
  }

  onDateLivChanged(e) {
    if (!e.event) return; // Only user event
    this.changeDateEta(e.value, "ordre-eta-changed");
    this.headerSaving = false; // To unlock heading save
    this.saveHeaderOnTheFly();
  }

  public waitUntilHeaderSaved() {
    if (!this.headerSaving) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      // Wait until header has been totally saved
      const saveTimeout = setTimeout(() => {
        notify(this.localization.localize("header-loading-error"), "error");
        clearInterval(saveInterval);
        reject();
      }, 2 * ONE_MINUTE)
      const saveInterval = setInterval(() => {
        if (!this.headerSaving) {
          clearInterval(saveInterval);
          clearTimeout(saveTimeout);
          resolve();
        }
      }, 100);
    });
  }

  resetTabTitleAndInfo() {
    const tab = this.ordresService.orderTabItems
      .find(tab => tab.itemData.id === this.gridsService.orderIdentifier(this.ordre));
    if (!tab) return;
    tab.itemElement.title = ""; // Reset so that title info will be automatically reloaded
    tab.itemData.title = this.ordre.entrepot?.code ?? this.localization.localize("order");
  }

  saveHeaderOnTheFly(message?) {
    if (this.headerSaving) return;
    if (!this.formGroup.pristine && this.formGroup.valid) {
      this.headerSaving = true;
      const ordre = this.formUtils.extractDirty(
        this.formGroup.controls,
        Ordre.getKeyField()
      );

      // Reset tab title/info shown
      this.resetTabTitleAndInfo();

      // copy value of "transporteurDEVPrixUnitaire"
      // might be overrided by "forfaits transporteurs" afterward
      if (!ordre.prixUnitaireTarifTransport)
        ordre.prixUnitaireTarifTransport = ordre.transporteurDEVPrixUnitaire;

      ordre.societe = { id: this.currentCompanyService.getCompany().id };
      ordre.etaLocation = ordre.portTypeA?.name;
      ordre.etdLocation = ordre.portTypeD?.name;

      this.ordresService.save({ ordre }).subscribe({
        next: (res) => {
          this.refreshStatus(res.data.saveOrdre.statut);
          this.headerSaving = false;
          this.ordre = { ...this.ordre, ...ordre };
          this.formGroup.markAsPristine();
          this.addLinkedOrders();
          if (message) {
            notify({
              message: this.localization.localize(message),
              type: "success"
            },
              { position: 'bottom center', direction: 'up-stack' }
            );
          }

          // Ordre date depart has been mutated
          if (ordre.dateDepartPrevue) this.changeDateDepart(ordre.dateDepartPrevue);
        },
        error: (err) => {
          notify({
            message: this.localization.localize("header-loading-error"),
            type: "error"
          },
            { position: 'bottom center', direction: 'up-stack' }
          );
          console.log(err);
          this.headerSaving = false;
        },
      });
    }
  }

  async changeDateDepart(dateDepartPrevue) {
    if (!this.gridCommandes?.gridRowsTotal) return;
    if (await confirm(
      this.localization.localize("ordre-date-depart-mutate"),
      this.localization.localize("ordre-date-depart-mutate-title")
    )) {
      this.updateLogistiquesDates(dateDepartPrevue);
      // Check date and change if needed with info toast
      if (this.ordre.dateLivraisonPrevue < this.ordre.dateDepartPrevue)
        this.changeDateLiv(this.ordre.dateDepartPrevue, "ordre-liv-changed");
    }
  }

  changeDateLiv(e, message?) {
    this.formGroup.get("dateLivraisonPrevue").patchValue(e);
    this.formGroup.get("dateLivraisonPrevue").markAsDirty();
    this.changeDateEta(e, "ordre-eta-changed");
    this.headerSaving = false; // To unlock heading save
    this.saveHeaderOnTheFly(message ?? "modification-done");
  }

  changeDateEta(e, message?) {
    if (this.ordre?.secteurCommercial?.id !== "MAR") return;
    this.formGroup.get("etaDate").setValue(e.split("T")[0]);
    this.formGroup.get("etaDate").markAsDirty();
    if (message) {
      notify({
        message: this.localization.localize(message),
        type: "success"
      },
        { position: 'bottom center', direction: 'up-stack' }
      );
    }
  }

  checkForfaitTransp() {
    // Vu avec Léa/Bruno 22-11-2023 : trop risqué au final de bloquer ces champs CDT:360
    this.blockPUDevUniteTransp = false;
    return;
    this.ordresService
      .fReturnForfaitsTrp(
        this.ordre.type?.id,
        this.ordre.entrepot?.id,
        this.ordre.incoterm?.id
      )
      .subscribe({
        next: (res) => {
          this.blockPUDevUniteTransp = !!(res?.data?.fReturnForfaitsTrp?.data?.arg_trp_dev_pu);
        },
        error: (error: Error) =>
          console.log(this.messageFormat(error.message))
      });
  }

  warnNoSelectedRows() {
    this.selectedLignes = this.gridCommandes.grid.instance.getSelectedRowKeys();
    if (!this.selectedLignes?.length) {
      notify(
        this.localization.localize("text-selection-lignes"),
        "warning",
        5000
      );
      return false;
    }
    return this.gridCommandes.grid.instance.getSelectedRowsData();
  }

  async onAddRefsClient() {
    this.running.addRefsClient = true;
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
    let artIds = [];
    const rowsData = this.warnNoSelectedRows();
    if (!rowsData) return this.running.addRefsClient = false;
    rowsData.map((data) => artIds.push(data.article.id));
    artIds = [...new Set(artIds)]; // Removing duplicates
    const allReferenceClient = [];
    artIds.map((artId) => {
      allReferenceClient.push({
        article: { id: artId },
        client: { id: this.ordre.client.id },
      });
    });
    this.referencesClientService
      .saveAll(allReferenceClient, new Set(["article.id"]))
      .subscribe({
        next: (res) => {
          const addedArt = res.data.saveAllReferenceClient;
          if (addedArt.length) {
            const addedArtids = [];
            addedArt.map((artId) => addedArtids.push(artId.article?.id));
            const trad = this.vowelTest(this.ordre.client.code[0])
              ? "-vowel"
              : "";
            let message = this.localization
              .localize(`articles-ajoutes-refs-client${trad}`)
              .split("&&")
              .join(addedArtids.length > 1 ? "s" : "")
              .replace(
                "&A",
                this.gridUtilsService.friendlyFormatList(addedArtids)
              )
              .replace("&C", this.ordre.client.code);
            // Find existing articles and adjust final toast message
            const diffArtIds = artIds.filter((x) => !addedArtids.includes(x));
            if (diffArtIds.length) {
              message +=
                ". " +
                this.localization
                  .localize("articles-refs-client-delta")
                  .split("&&")
                  .join(diffArtIds.length > 1 ? "s" : "")
                  .replace(
                    "&A",
                    this.gridUtilsService.friendlyFormatList(diffArtIds)
                  );
            }
            // Show ok message
            notify(message, "success", 5000 + 2000 * diffArtIds.length);
          } else {
            const message = this.localization.localize(
              "articles-refs-client-present" + (artIds.length > 1 ? "s" : "")
            );
            notify(message, "warning", 5000);
          }
          this.running.addRefsClient = false;
          this.gridCommandes.grid.instance.clearSelection();
        },
        error: () => {
          this.running.addRefsClient = false;
          notify(
            "Erreur lors de la sauvegarde dans les références client",
            "error",
            5000
          )
        },
      });
  }

  async onRegulOrderClick() {
    await this.waitUntilHeaderSaved();
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
    // As LIST_NORDRE_REGUL is a VARCHAR(50)
    if (this.ordre.listeOrdresRegularisations?.split(";").length >= 8) {
      notify(
        "Le nombre maximum d'ordres de régularisation est atteint",
        "error",
        5000
      );
      this.clearSelectionForRegul();
      this.running.regulOrder = false;
      return;
    }

    if (!this.warnNoSelectedRows()) return this.running.regulOrder = false;

    this.motifRegulPopup.visible = true;
  }

  validateRegulOrder(data) {
    // Quitting without creating a regul order
    if (!data) {
      this.clearSelectionForRegul();
      this.running.regulOrder = false;
      return;
    }

    data = {
      ...data,
      listOrlRef: this.selectedLignes,
      ordreRef: this.ordre.id,
      socCode: this.currentCompanyService.getCompany().id,
      username: this.authService.currentUser.nomUtilisateur,
    };

    this.ordresService
      .fCreeOrdreRegularisation(
        data.indDetail,
        data.lcaCode,
        data.listOrlRef,
        data.typeReg,
        data.ordreRef,
        data.socCode,
        data.username
      )
      .subscribe({
        next: (resCree) => {
          const refOrdreRegul =
            resCree.data.fCreeOrdreRegularisation.data.ls_ord_ref_regul;
          if (refOrdreRegul) {
            // Find numero / Initialize form
            this.ordresService
              .getOne_v2(refOrdreRegul, ["id", "numero"])
              .subscribe({
                next: (result) => {
                  this.running.regulOrder = false;
                  const numOrdreRegul = result.data.ordre.numero;
                  this.refreshHeader();
                  notify(
                    this.localization
                      .localize("ordre-regularisation-cree")
                      .replace("&O", numOrdreRegul),
                    "success",
                    7000
                  );
                  this.clearSelectionForRegul();
                  this.tabContext.openOrdre(numOrdreRegul);
                },
                error: (error: Error) => {
                  this.running.regulOrder = false;
                  console.log(error);
                  this.clearSelectionForRegul();
                  alert(
                    this.localization.localize(
                      "ordre-regularisation-erreur-creation"
                    ),
                    this.localization.localize("ordre-regularisation-creation")
                  );
                },
              });
          }
        },
        error: (error: Error) => {
          this.running.regulOrder = false;
          console.log(error);
          this.clearSelectionForRegul();
          alert(
            this.messageFormat(error.message),
            this.localization.localize("ordre-regularisation-creation")
          );
        },
      });
  }

  clearSelectionForRegul() {
    this.selectedLignes = [];
    this.gridCommandes.grid.instance.deselectAll();
  }

  async onComplOrderClick() {
    if (!this.ordre?.id) return;
    await this.waitUntilHeaderSaved();
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);

    // As LIST_NORDRE_COMP is a VARCHAR(50)
    if (
      this.ordre.listeOrdresComplementaires?.split(";").join(",").split(",")
        .length >= 8
    ) {
      notify(
        "Le nombre maximum d'ordres complémentaires est atteint",
        "error",
        5000
      );
      return;
    }

    if (this.ordre.type.id !== "ORD") {
      alert(
        this.localization.localize("text-popup-ordre-non-ORD"),
        this.localization.localize("ordre-complementaire-creation")
      );
      return;
    }

    if (
      Date.now() >
      new Date(Date.parse(this.ordre.dateDepartPrevue)).setHours(23, 59, 59)
    )
      return alert(
        this.localization.localize("text-popup-ordre-compl-dateDepassee"),
        this.localization.localize("ordre-complementaire-creation")
      );

    confirm(
      this.localization
        .localize("text-popup-ordre-compl")
        .replace("&C", this.ordre.client.code),
      this.localization.localize("ordre-complementaire-creation")
    ).then((res) => {
      if (res) {
        const societe: Societe = this.currentCompanyService.getCompany();

        this.ordresService
          .fCreeOrdreComplementaire(
            this.ordre.id,
            societe.id,
            this.authService.currentUser.nomUtilisateur
          )
          .subscribe({
            next: (resCree) => {
              const refOrdreCompl =
                resCree.data.fCreeOrdreComplementaire.data.ls_ord_ref_compl;
              if (refOrdreCompl) {
                // Find numero / Initialize form
                this.ordresService
                  .getOne_v2(refOrdreCompl, ["id", "numero"])
                  .subscribe({
                    next: (result) => {
                      this.refreshHeader();
                      notify(
                        this.localization
                          .localize("ordre-complementaire-cree")
                          .replace("&O", result.data.ordre.numero),
                        "success",
                        7000
                      );
                    },
                    error: (error: Error) => {
                      console.log(error);
                      alert(
                        this.localization.localize(
                          "ordre-complementaire-erreur-creation"
                        ),
                        this.localization.localize(
                          "ordre-complementaire-creation"
                        )
                      );
                    },
                  });
              }
            },
            error: (error: Error) => {
              console.log(error);
              alert(
                this.messageFormat(error.message),
                this.localization.localize("ordre-complementaire-creation")
              );
            },
          });
      } else {
        notify(
          this.localization.localize("text-popup-abandon-ordre-compl"),
          "warning",
          7000
        );
      }
    });
  }

  async onCancelOrderClick() {
    if (!this.ordre.id) return;
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);

    this.ordresService.fTestAnnuleOrdre(this.ordre.id).subscribe({
      next: () => {
        this.promptPopupTitle =
          this.localization.localize("ordre-cancel-title") + this.ordre?.numero;
        this.promptPopupPurpose = "cancel";
        this.promptPopupDateOnly = false;
        this.promptPopup.show({
          validText: "btn-annulation-ordre",
          commentTitle: this.localization.localize("choose-cancel-reason"),
          // These items are hard coded in Geo1
          commentItemsList: ["BW", "CLIENT", "FOURNISSEUR", "TRANSPORTEUR"],
        });
      },
      error: (error: Error) => {
        alert(
          this.messageFormat(error.message),
          this.localization.localize("annulation-ordre")
        );
      },
    });
  }

  validateCancelOrder(motif) {
    this.running.cancelOrder = true;
    this.ordresService.fAnnulationOrdre(motif, this.ordre.id).subscribe({
      next: (res) => {
        this.running.cancelOrder = false;
        this.refreshHeader();
        this.actionDocs.onClickSendAction("ORDRE", true);
      },
      error: (error: Error) => {
        this.running.cancelOrder = false;
        console.log(error);
        alert(
          this.messageFormat(error.message),
          this.localization.localize("annulation-ordre")
        );
      },
    });
  }

  async onDeleteOrderClick() {
    if (!this.ordre.id) return;
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);

    this.promptPopupTitle =
      this.localization.localize("ordre-delete-title") + this.ordre?.numero;
    this.promptPopupPurpose = "delete";
    this.promptPopupDateOnly = false;
    this.promptPopup.show({
      commentTitle: this.localization.localize("choose-delete-reason"),
      validText: "btn-suppression-ordre",
      commentMaxLength: 70,
    });
  }

  validateDeleteOrder(comment) {
    this.running.deleteOrder = true;
    const numero = this.ordre.numero;

    confirm(
      this.localization.localize("text-popup-supprimer-ordre"),
      `${this.localization.localize("suppression-ordre")} n°${numero}`
    ).then((res) => {
      if (res) {
        this.ordresService
          .fSuppressionOrdre(
            this.ordre.id,
            comment,
            this.authService.currentUser.nomUtilisateur
          )
          .subscribe({
            next: () => {
              this.running.deleteOrder = false;
              this.tabContext.closeOrdre(
                this.ordre.numero,
                this.ordre.campagne.id
              );
              notify(
                this.localization
                  .localize("text-popup-suppression-ok")
                  .replace("&O", numero),
                "success",
                7000
              );
            },
            error: (error: Error) => {
              this.running.deleteOrder = false;
              alert(
                this.messageFormat(error.message),
                this.localization.localize("suppression-ordre")
              );
            },
          });
      } else {
        this.running.deleteOrder = false;
        notify(
          this.localization.localize("text-popup-abandon-suppression"),
          "warning",
          7000
        );
      }
    });
  }

  public onValidatePromptPopup(comment) {
    if (this.promptPopupPurpose === "delete") this.validateDeleteOrder(comment);
    if (this.promptPopupPurpose === "cancel") this.validateCancelOrder(comment);
    if (this.promptPopupPurpose === "change-liv") this.changeDateLiv(comment);
  }

  private messageFormat(mess) {
    const functionNames = [
      "fSuppressionOrdre",
      "fTestAnnuleOrdre",
      "fAnnulationOrdre",
      "fCreeOrdreComplementaire",
      "fCreeOrdreComplementaire",
      "fnMajOrdreRegroupementV2",
      "fBonAFacturer",
      "supprLignesNonExped",
      "fReturnForfaitsTrp",
    ];
    functionNames.map(
      (fn) =>
        (mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""))
    );
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  async onShowEdiColibriOrderClick() {
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
    this.modifCdeEdiPopup.visible = true;
  }

  onArticleManClick(e?) {
    this.articleRowKey = e;
    this.ajoutArtManu.visible = true;
  }

  async onDestockAutoClick() {
    this.running.destockAuto = true;
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
    this.destockageAutoPopup.visible = true;
  }

  updateDestockAuto() {
    if (this.destockageAutoPopup.visible) this.destockageAutoPopup.updateGrid();
  }

  gridCdesSelectedRowsChange(e) {
    if (e) this.selectedGridCdesRows = e.length > 0;
  }

  async detailExp() {
    await this.waitUntilHeaderSaved();
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
    this.ordresLignesViewExp = !this.ordresLignesViewExp;
  }

  async openGroupageChargementsPopup() {
    await this.waitUntilHeaderSaved();
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
    this.groupagePopup.visible = true;
  }

  async onDuplicateOrderClick() {
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
    await this.waitUntilHeaderSaved();
    this.duplicationPopup.visible = true;
  }

  addLinkedOrders() {
    // Accole au numéro d'ordre les ordres liés

    this.linkedOrdersSearch = true;
    this.linkedOrders = [];

    const refClt = this.ordre.referenceClient;

    if (refClt) {
      this.linkedOrdersSearch = true;
      const numero = this.ordre.numero;
      const ordresSource = this.ordresService.getDataSource_v2([
        "id",
        "numero",
        "campagne.id",
      ]);
      ordresSource.filter([
        ["client.id", "=", this.ordre.client.id],
        "and",
        ["referenceClient", "=", refClt],
        "and",
        ["dateLivraisonPrevue", "=", this.ordre.dateLivraisonPrevue],
        "and",
        ["incoterm.id", "=", this.ordre.incoterm?.id],
        "and",
        ["regimeTva.id", "=", this.ordre.regimeTva?.id],
      ]);
      ordresSource.load().then((res) => {
        res
          .filter((value) => value.numero !== numero)
          .filter(
            (value) =>
              !this.ordre.listeOrdresComplementaires
                ?.split(";")
                .join(",")
                .split(",")
                .includes(value.numero)
          )
          .map((value) => {
            this.linkedOrders.push({
              ordre: value,
              criteria: LinkedCriterias.Client,
              class: "RefClt",
            });
            this.removeLinkedDuplicates();
          });
        this.findComplRegulLinkedOrders(refClt);
        this.findPaloxLinkedOrders();
        this.linkedOrdersSearch = false;
      });
    } else {
      this.findComplRegulLinkedOrders(refClt);
      this.findPaloxLinkedOrders();
    }
  }

  findComplRegulLinkedOrders(refClt) {
    const hasCompl = this.ordre.listeOrdresComplementaires;
    const hasRegul = this.ordre.listeOrdresRegularisations;
    if (hasCompl) {
      hasCompl
        .split(";")
        .join(",")
        .split(",")
        .map((res) => {
          if (res) {
            this.linkedOrders.push({
              ordre: { numero: res },
              criteria: LinkedCriterias.Compl,
              class: "Compl",
            });
            this.removeLinkedDuplicates();
          }
        });
    }
    if (hasRegul) {
      hasRegul.split(";").map((res) => {
        if (res) {
          this.linkedOrders.push({
            ordre: { numero: res },
            criteria: LinkedCriterias.Regul,
            class: "Regul",
          });
          this.removeLinkedDuplicates();
        }
      });
    }
    if (!refClt) this.linkedOrdersSearch = false;
  }

  findPaloxLinkedOrders() {
    const hasPaloxChildren = this.ordre.listeOrdreRefPalox;
    const hasPaloxFather = this.ordre.ordreRefPaloxPere;
    if (hasPaloxChildren) {
      hasPaloxChildren.split(";").map((res) => {
        if (res) {
          this.ordresService
            .getOne_v2(res, ["numero"], "no-cache")
            .subscribe((num) => {
              this.linkedOrders.push({
                ordre: { numero: num.data.ordre.numero },
                criteria: LinkedCriterias.Palox,
                class: "Palox",
              });
              this.removeLinkedDuplicates();
            });
        }
      });
    }
    if (hasPaloxFather) {
      this.ordresService
        .getOne_v2(hasPaloxFather, ["numero"], "no-cache")
        .subscribe((num) => {
          this.linkedOrders.push({
            ordre: { numero: num.data.ordre.numero },
            criteria: LinkedCriterias.Palox,
            class: "Palox",
          })
          this.removeLinkedDuplicates();
        });
    }
  }

  removeLinkedDuplicates() {
    this.linkedOrders = this.linkedOrders.filter((value, index, self) =>
      index === self.findIndex((t) =>
        t.ordre.numero === value.ordre.numero && t.criteria === value.criteria
      )
    );
  }

  openLinkedOrder(ordre: Partial<Ordre>) {
    this.tabContext.openOrdre(ordre.numero, this.ordre.campagne.id);
  }

  deviseDisplayExpr(item) {
    return item
      ? item.id +
      " - " +
      item.description +
      (item.taux !== null ? " (" + item.taux + ")" : "")
      : null;
  }

  displayIDBefore(data) {
    return data
      ? data.id +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  displayCodeBefore(data) {
    return data ? data.code + " - " + data.raisonSocial : null;
  }

  public onLignesChanged(e) {
    this.gridCommandes.update();
  }

  public async refreshOrder() {
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
    this.refreshHeader();
    this.gridsService.reload([
      "Commande",
      "SyntheseExpeditions",
      "DetailExpeditions",
      "LitigeLigne",
      "OrdreMarge",
      "TotauxDetail",
      "Logistique",
      "Frais",
      "Envois",
      "CQ",
      "Commentaires",
      "Log"
    ], this.gridsService.orderIdentifier(this.ordre)
    );
    this.formLitiges?.loadForm();
  }

  private initializeForm(fetchPol?) {
    this.blockPUDevUniteTransp = true;
    this.canChangeDateLiv = false;
    this.showBAFButton = false;
    const currentCompany: Societe = this.currentCompanyService.getCompany();
    this.route.paramMap
      .pipe(
        first(),
        map((params) =>
          this.tabContext.parseTabID(params.get(RouteParam.TabID))
        ),
        switchMap(([numero, campagneID]) => {
          if (numero === TAB_ORDRE_CREATE_ID || !campagneID) return of({} as Ordre);
          return this.ordresService
            .getOneByNumeroAndSocieteAndCampagne(
              numero,
              currentCompany.id,
              campagneID,
              this.headerFields,
              fetchPol
            )
            .pipe(map((res) => res.data.ordreByNumeroAndSocieteAndCampagne));
        })
      )
      .subscribe({
        next: (ordre) => {
          this.ordre = ordre;
          this.changeDetectorRef.detectChanges();
          // France: 2 Incoterms only
          if (this.ordre.secteurCommercial?.id === "F")
            this.incotermsDS.filter([
              ["id", "=", "CPT"],
              "or",
              ["id", "=", "EXW"],
            ])
          this.headerRefresh = false;
          if (this.ordre === null) {
            notify(
              `Récupération des données de l'ordre impossible...`,
              "error",
              7000
            );
            return;
          }
          this.resetTabTitleAndInfo();
          this.allowMutations = !Ordre.isCloture(this.ordre);
          this.ordresLignesViewExp = !this.allowMutations;
          this.initVACMutation();
          this.fraisClient = this.getFraisClient();
          this.gestEntrepot = this.getGestEntrepot();
          this.fetchFullOrderNumber();
          this.descriptifRegroupement = ordre.descriptifRegroupement;
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
          window.sessionStorage.setItem(
            "numeroOrdre" + this.ordre.numero,
            this.ordre.id
          );
          this.mruOrdresService.saveMRUOrdre(this.ordre); // Save last opened order into MRU table
          this.mruEntrepotsService.saveMRUEntrepot(this.ordre.entrepot); // Save last opened entrepot into MRU table

          this.formGroup.valueChanges.subscribe((_) => {
            this.saveHeaderOnTheFly();
          });
          this.checkForfaitTransp();

          this.refOrdreEdi = this.ordre.ordreEDI?.id;
          this.canalOrdreEdi = this.ordre.ordreEDI?.canalCde;
          this.cancelledOrder =
            Statut[this.ordre.statut] === Statut.ANNULE.toString();
          this.histoLigneOrdreText = `${this.localization.localize(
            "hint-ajout-ordre"
          )} ${this.localization.localize("hint-source-historique")}`;
          this.histoLigneOrdreReadOnlyText = `${this.localization.localize(
            "hint-client-historique"
          )}`;

          // Auto open accordion when required (E.g. litiges form supervision litiges)
          const showAccordion = sessionStorage.getItem("showAccordion");
          if (showAccordion) {
            this.scrollOpenAccordion(showAccordion);
            sessionStorage.removeItem("showAccordion");
          }

          this.showBAFButton =
            this.ordre.bonAFacturer === false &&
            this.ordre.client.usageInterne !== true &&
            (this.ordre.codeAlphaEntrepot
              ? this.ordre.codeAlphaEntrepot.substring(0, 8) !== "PREORDRE"
              : true);
        },
        error: (message: string) => notify({ message }, "error", 7000),
        complete: () => {
          this.headerRefresh = false;
        },
      });
  }

  private initVACMutation() {
    this.allowVenteACommissionMutation =
      this.allowMutations &&
      ((this.ordre.client?.venteACommission && this.ordre.type?.id !== "REP") ||
        this.authService.currentUser.profileClient === "ADMIN" ||
        !!this.authService.currentUser.geoClient);
  }

  private initializeAnchors(event?: TabChangeData) {
    if (event) {
      if (event.status === "in") this.enableAnchors();
      if (event.status === "out") this.disableAnchors();
    }
    if (!this.anchorsInitialized) {
      this.handleAnchorsNavigation();
      this.anchorsInitialized = true;
    }
  }

  private handleTabChange() {
    return this.route.paramMap.pipe(
      first(),
      switchMap((params) =>
        this.tabContext.onTabChange.pipe(
          map(
            (data) =>
              [data, params.get(RouteParam.TabID)] as [TabChangeData, string]
          )
        )
      ),
      filter(([{ item }, id]) => item.id === id),
      map(([item]) => item),
      takeUntil(this.destroy)
    );
  }

  private getButtonElement(
    button: DxButtonComponent | ElementRef<any>
  ): dxElement | HTMLElement {
    return button instanceof DxButtonComponent
      ? button.instance.element()
      : button.nativeElement;
  }

  private getAnchorElement(
    anchor: DxAccordionComponent | ElementRef<any>
  ): dxElement | HTMLElement {
    return anchor instanceof DxAccordionComponent
      ? anchor.instance.element()
      : anchor.nativeElement;
  }

  private enableAnchors() {
    this.anchors.forEach((anchor) => {
      const element = this.getAnchorElement(anchor);
      element.setAttribute("id", element.dataset.fragmentId);
    });
  }

  private disableAnchors() {
    this.anchors.forEach((anchor) => {
      const element = this.getAnchorElement(anchor);
      element.removeAttribute("id");
    });
  }

  private handleAnchorsNavigation() {
    const scrollTo = (elm: HTMLElement) =>
      elm.scrollIntoView({ behavior: "smooth" });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        switchMap((_) => this.route.fragment),
        filter((fragment) => !!fragment),
        concatMap((fragment) =>
          of(
            this.anchors.find(
              (item) =>
                this.getAnchorElement(item).id === fragment &&
                !!this.getAnchorElement(item).classList?.length
            )
          )
        ),
        filter((item) => !!item)
      )
      .subscribe((item) => {
        if (item instanceof DxAccordionComponent) {
          item.instance.option("animationDuration", 0);
          item.instance.expandItem(0);
          // @ts-ignore
          (item.onItemTitleClick as EventEmitter<>).emit(
            {
              overrideTogglingTo: true,
              itemElement: item.instance
                .element()
                .querySelector('[role="tab"]'),
            },
            [item]
          );
          setTimeout(() => {
            scrollTo(item.instance.element());
            item.instance.option("animationDuration", 300);
          }, 10);
        } else scrollTo(item.nativeElement);
      });
  }

  public openFormAccordions(ids?) {
    if (ids) {
      this.accordion.filter(r => ids.includes(r.instance.$element()[0].id)).map(ac => ac.instance.expandItem(0));
    } else {
      this.accordion.map(r => r.instance.expandItem(0)); // All are opened
    }
  }

  public closeFormAccordions(ids?) {
    if (ids) {
      this.accordion.filter(r => ids.includes(r.instance.$element()[0].id)).map(ac => ac.instance.collapseItem(0));
    } else {
      this.accordion.map(r => r.instance.collapseItem(0)); // All are closed
    }
  }

  public openAfterStandByAccordions(ids?) {
    if (this.savedGridCdeStandby) {
      this.savedGridCdeStandby = false;
      setTimeout(() => this.openFormAccordions(ids), 1000);
    }
  }

  public onAccordionToggleBtnClick(e) {
    const accordionId = e?.element?.id;
    if (!accordionId) return;
    if (accordionId === "synthese" && e.itemElement?.classList?.contains("dx-accordion-item-opened"))
      this.marginsUpdate();
    if (!this.gridCommandes?.closure_accordions.includes(accordionId)) return;
    if (this.gridCommandes?.dataToBesaved) {
      e.event.preventDefault(); // Delay opening until grid commande is saved
      this.savedGridCdeStandby = true;
      this.gridCommandes.currentFormAccordionClickId = accordionId;
      this.gridCommandes?.grid.instance.saveEditData();
    }
  }

  private fetchFullOrderNumber() {
    const nouveau = this?.ordre?.statut;

    this.fullOrderNumber = [Statut[nouveau]].includes("NON_CONFIRME")
      ? "Nouvel "
      : "";

    this.fullOrderNumber += `Ordre N° ${(this.ordre.campagne
      ? (this.ordre.campagne.id
        ? this.ordre.campagne.id
        : this.ordre.campagne) + "-"
      : "") + this.ordre.numero
      }`;
  }

  private refreshBadges() {
    // Gestion des pastilles infos boutons gauche
    if (this.ordre) {
      this.dotLitiges = this.getLitigeBadgeIndicator(this.ordre.hasLitige);
      this.dotCQ = this.ordre.cqLignesCount;
      this.dotCommentaires = this.ordre.commentairesOrdreCount;
      if (this.ordre.hasLitige) this.refreshAvoirIndicator();
    }
  }

  private getLitigeBadgeIndicator(hasLitige: boolean) {
    return hasLitige ? "!" : "";
  }

  public refreshLitigeIndicator() {
    this.ordresService
      .getOne_v2(this.ordre.id, ["id", "hasLitige"], "no-cache")
      .subscribe(res => {
        this.running.createLitige = false;
        this.dotLitiges = this.getLitigeBadgeIndicator(res.data.ordre.hasLitige);
        if (this.ordre.hasLitige) this.refreshAvoirIndicator();
      });
  }

  public refreshAvoirIndicator() {
    this.numeroAvoir = "";
    this.ordreAvoir = {};
    this.ordresService
      .getOne_v2(this.ordre.id, ["id", "hasLitige"])
      .subscribe(res => {
        if (res.data.ordre.hasLitige) {
          const litigeDs = this.litigesService.getDataSource_v2([
            "id",
            "ordreAvoirClient.numero",
            "ordreAvoirClient.numeroFacture",
            "ordreAvoirClient.campagne.id",
            "ordreAvoirClient.societe.id"
          ]);
          litigeDs.filter(["ordreOrigine.id", "=", this.ordre.id]);
          litigeDs.load().then(res => {
            this.numeroAvoir = (res[0]?.ordreAvoirClient?.numeroFacture) ?? "";
            this.ordreAvoir = res[0]?.ordreAvoirClient;
          });
        }
      });
  }

  leftPanelChange(e) {
    window.localStorage.setItem(
      "HideOrderleftPanelView",
      e.value === true ? "false" : "true"
    );
  }

  getFraisClient() {
    const fraisPU = this.ordre.fraisPrixUnitaire;
    let fraisUnite = this.ordre.fraisUnite?.id;
    const fraisPlateforme = this.ordre.fraisPlateforme;
    let messFraisPlateforme = "";

    if (fraisPlateforme > 0) {
      messFraisPlateforme =
        "Frais plateforme " +
        fraisPlateforme +
        " " +
        this.currentCompanyService.getCompany().devise.id +
        " le kilo";
    }

    if (!fraisUnite) fraisUnite = "";

    return (
      "Frais client " + fraisPU + " " + fraisUnite + " " + messFraisPlateforme
    );
  }

  getGestEntrepot() {
    if (!this.ordre.entrepot?.gestionnaireChep) return;
    return (
      this.ordre.entrepot?.gestionnaireChep +
      " " +
      this.ordre.entrepot?.referenceChep
    );
  }

  getinstructionsComm() {
    const instCommClt = this.ordre.client?.instructionCommercial
      ? this.ordre.client?.instructionCommercial
      : "";
    const instCommEnt = this.ordre.entrepot?.instructionSecretaireCommercial
      ? this.ordre.entrepot?.instructionSecretaireCommercial
      : "";
    return instCommClt + (instCommClt ? " " : "") + instCommEnt;
  }

  private refreshStatus(statut: Statut) {
    if (!this.ordre) return;
    this.status = this.localization.localize(Object
      .entries(StatutLocale)
      .find(([k, v]) => k === statut)
      ?.[1]);
    this.ordreFacture = [Statut.FACTURE, Statut.FACTURE_EDI].includes(Statut[statut]);
    this.canChangeDateLiv =
      this.ordreFacture && !["RPO", "RPR"].includes(this.ordre.type.id);
    if (this.ordreFacture) this.numeroFacture = this.ordre.numeroFacture;
    this.ordreBAFOuFacture =
      this.ordreFacture ||
      Statut[statut] === Statut.A_FACTURER.toString() ||
      Statut[statut] === Statut.FACTURE_EDI.toString();
    this.cancelledOrder =
      Statut[this.ordre.statut] === Statut.ANNULE.toString();
    this.updateTabStatusDot();
  }

  updateTabStatusDot() {
    // Update green dot on order tab (Statut.CONFIRME)
    this.tabContext.getSelectedItem().subscribe(res => {
      if (!res || !this.ordre || res?.id.split("-")[1] !== this.ordre.numero) return;
      res.status = Statut[this.ordre?.statut] === Statut.CONFIRME.toString();
    });
  }

  openDateChangePopup() {
    this.promptPopupPurpose = "change-liv";
    this.promptPopupTitle = this.localization.localize(
      "ordre-change-liv-title"
    );
    this.promptPopupDateOnly = true;
    this.promptPopup.show({
      validText: "btn-modification-change",
      currentDate: this.ordre.dateLivraisonPrevue,
    });
  }


  openClientFilePopup() {
    this.clientId = this.ordre?.client?.id;
    this.clientCode = this.ordre?.client?.code;
    if (this.clientId !== null) this.zoomClientFilePopup.visible = true;
  }

  openChoixEntrepotPopup() {
    const dataSourceEnt = this.entrepotsService.getDataSource_v2(["id"]);
    dataSourceEnt.filter([
      ["valide", "=", true],
      "and",
      ["client.id", "=", this.ordre?.client?.id],
    ]);
    // Checks if we can really change the entrepot
    dataSourceEnt.load().then((ent) => {
      if (ent?.length === 1) return notify(this.localization.localize("warning-no-other-entrepot"), "warning", 4000);
      this.choixEntPopup.visible = true;
    });
  }

  onEntrepotChosen(entrepot) {
    const instLogClt = this.ordre.entrepot.client.instructionLogistique ?? "";
    const instLogEnt = entrepot.instructionLogistique ?? "";
    let instLog = instLogClt + (instLogEnt ? " " : "") + instLogEnt;
    instLog = instLog.substring(0, 280);

    const ordre = {
      id: this.ordre.id,
      instructionsLogistiques: instLog,
      entrepot: entrepot,
      codeAlphaEntrepot: entrepot?.code // Special required field
    };

    this.ordresService.save({ ordre }).subscribe({
      next: () => {
        this.ordre = { ...this.ordre, ...ordre };
        notify(this.localization.localize("success-entrepot-modified"), "success");
        this.refreshHeader();
      },
      error: (err) => {
        console.log(err);
        notify(this.localization.localize("warning-entrepot-modification-error"), "error", 3000);
      },
    });
  }

  openTransporteurFilePopup() {
    this.transporteurLigneId = this.formGroup.get("transporteur").value?.id;
    if (this.transporteurLigneId !== null)
      this.zoomTransporteurFilePopup.visible = true;
  }

  openEntrepotFilePopup() {
    this.entrepotId = this.ordre?.entrepot?.id;
    this.entrepotCode = this.ordre?.entrepot?.code;
    if (this.entrepotId !== null) this.zoomEntrepotFilePopup.visible = true;
  }

  private refetchOrder(period = 5000) {
    return interval(period)
      .pipe(
        // we need current route information
        switchMap(() => this.route.paramMap),
        // complete this observable when we are outside the `ordres` scope
        // this will stop the emissions on disconnection (with router redirection), by exemple
        takeWhile(params => this.router.isActive("pages/ordres", {
          paths: 'subset',
          queryParams: 'ignored',
          fragment: 'ignored',
          matrixParams: 'ignored',
        })),
        // continue if the selected tab is an `ordre`
        filter(params => /[-\d]+/.test(params.get(RouteParam.TabID))),
        map((params) =>
          this.tabContext.parseTabID(params.get(RouteParam.TabID))
        ),
        filter((data) => data.every((v) => v !== null && v !== undefined)),
        concatMap(([numero, campagneID]) =>
          this.ordresService.getOneByNumeroAndSocieteAndCampagne(
            numero,
            this.currentCompanyService.getCompany().id,
            campagneID,
            ["id", "statut"],
            "network-only"
          )
        ),
        map((res) => res.data.ordreByNumeroAndSocieteAndCampagne)
      );
  }

  private refetchStatut() {
    // No refetch when statut is "FACTURE" or "ANNULE"
    if ([Statut.FACTURE, Statut.ANNULE].includes(this.ordre?.statut)) {
      return;
    }

    interval(5000)
      .pipe(
        tap(() => { console.log("YO"); }),
        // takeWhile(() => this.router.isActive("pages/ordres", false)),
        // tap(() => console.log("YO2")),
        switchMap(() => this.route.paramMap),
        first(),
        filter((params) => !!params.get(RouteParam.TabID)),
        map((params) =>
          this.tabContext.parseTabID(params.get(RouteParam.TabID))
        ),
        filter((data) => data.every((v) => v !== null && v !== undefined)),
        concatMap(([numero, campagneID]) =>
          this.ordresService.getOneByNumeroAndSocieteAndCampagne(
            numero,
            this.currentCompanyService.getCompany().id,
            campagneID,
            ["id", "statut"],
            "network-only"
          )
        ),
        takeWhile((res) => res.loading, true),
        map((res) => res.data.ordreByNumeroAndSocieteAndCampagne)
      )
      .subscribe({
        next: (ordre: Ordre) => this.refreshStatus(ordre.statut),
      });
  }

  public refreshGridLigneDetail(e) {
    this.gridLignesDetail?.refresh(e);
  }

  public marginsUpdate() {
    this.gridMarge?.updateGrid();
  }

  public refreshGridsSynthese() {
    this.gridLTD?.refresh();
    this.gridDetailPalettes?.refresh();
    this.gridMarge?.refresh();
  }

  async viewFacture(titleKey: string, document: Document) {
    if (!document)
      return notify(
        this.localization.localize("doc-not-loaded",
          this.localization.localize(titleKey).toLowerCase()),
        "error");
    if (!document.isPresent)
      return notify(
        this.localization.localize("doc-not-found",
          this.localization.localize(titleKey).toLowerCase()),
        "error");

    this.currentFacture = {
      title: this.localization.localize(titleKey),
      document,
    };
    this.factureVisible = true;
  }

  viewAvoir() {
    this.ordresService.getOneByNumeroAndSocieteAndCampagne(
      this.ordreAvoir.numero,
      this.ordreAvoir.societe?.id,
      this.ordreAvoir.campagne?.id,
      [
        "numeroFacture",
        "documentFacture.isPresent",
        "documentFacture.uri",
        "documentFacture.type"
      ]).subscribe(res => {
        this.viewFacture(
          'ordres-view-avoir-title',
          res.data.ordreByNumeroAndSocieteAndCampagne.documentFacture
        )
      });
  }

  public async bonAFacturer() {
    this.bafButtonEnabled = false;
    await this.waitUntilHeaderSaved();
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);

    const societe: Societe = this.currentCompanyService.getCompany();

    this.ordresBafService.fBonAFacturer([this.ordre.id], societe.id).pipe(
      finalize(() => setTimeout(() => this.bafButtonEnabled = true, 2000)),
    ).subscribe({
      error: ({ message }: Error) => {
        notify(this.messageFormat(message), "error", 7000);
      },
      next: (result) => {
        if (
          result.res === 2 &&
          result.msg.includes("il n'y a pas de client pallox")
        )
          return (this.comptePaloxPopup.visible = true);
        this.refreshHeader();
      },
    });
  }

  public suppLignesNonExp() {
    this.running.suppLignesNonExp = true;
    notify(this.localization.localize("please-wait"), "info", 9999999); // We hide it right after
    this.ordreLignesService.supprLignesNonExped(this.ordre.id).subscribe({
      error: ({ message }: Error) => {
        console.log(message);
        hideToasts()
        this.running.suppLignesNonExp = false;
        notify(this.messageFormat(message), "error", 7000);
      },
      next: (res) => {
        this.running.suppLignesNonExp = false;
        hideToasts();
        this.functionsService.fVerifLogistiqueOrdre(this.ordre?.id)
          .subscribe(() => {
            this.refreshOrder();
            notify(res.data.supprLignesNonExped.msg, "success");
          });
      },
      complete: () => hideToasts()
    });
  }

  public afterSelectPaloxAccounts(e) {
    if (e) return this.bonAFacturer();
    notify(
      this.localization.localize("text-popup-abandon-BAF"),
      "warning",
      8000
    );
  }

  public refreshTransporteur() {
    this.ordresService
      .getOne_v2(this.refOrdre, ["transporteur.id"], "no-cache")
      .subscribe((res) =>
        this.formGroup.get("transporteur").setValue(res.data.ordre.transporteur)
      );
  }

  public refreshHeader(e?) {
    this.headerRefresh = true;
    this.initializeForm("no-cache");
  }

  vowelTest(text) {
    return /^[AEIOUYaeiouy]$/i.test(text);
  }

  public async onDuplicationBukSaClick() {
    await this.waitUntilHeaderSaved();
    if (this.gridCommandes) {
      await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
      this.onDuplicationBukSa();
    } else {
      this.onDuplicationBukSa();
    }
  }

  private onDuplicationBukSa() {
    this.ordresService
      .fDuplicationBukSa(
        this.refOrdre,
        this.currentCompanyService.getCompany().id,
        this.authService.currentUser.nomUtilisateur,
        this.ordre.entrepot.regimeTva?.id ?? ""
      )
      .pipe(
        map((res) => res.data.fDuplicationBukSa),
        concatMap((response) => {
          if (response.res === FunctionResult.Warning)
            return this.resultPopup.openAs("WARNING", response.msg);
          return of(true);
        }),
        catchError((err: Error) =>
          this.resultPopup.openAs("ERROR", err.message)
        ),
        filter((flag) => flag),
        concatMapTo(
          defer(async () => {
            const res = await this.ordresService
              .getOne_v2(
                this.refOrdre,
                new Set(["client.entrepotReferenceRegroupement"]),
                "no-cache"
              )
              .toPromise();

            return res.data.ordre?.client?.entrepotReferenceRegroupement
              ? false
              : confirm(
                this.localization.localize("entrepot-import-programme"),
                this.localization.localize("ordre-duplicate-BUK-SA")
              );
          })
        ),
        concatMap((generic) =>
          this.ordresService.fnMajOrdreRegroupementV2(
            this.refOrdre,
            this.currentCompanyService.getCompany().id,
            generic,
            this.authService.currentUser.nomUtilisateur
          )
        )
      )
      .subscribe({
        error: ({ message }: Error) => {
          console.log(message);
          notify(this.messageFormat(message), "error", 7000);
        },
        next: (res) => {
          const msg = res.data.fnMajOrdreRegroupementV2.msg.split(",");
          notify(
            this.localization
              .localize("ordre-duplicate-done")
              .replace("&I", msg[1].replace(": ", "")),
            "success",
            7000
          );
        },
        complete: () => this.refreshDescriptifRegroupement(),
      });
  }

  public async onDelRegroupementClick() {
    await this.waitUntilHeaderSaved();
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
    this.ordresService.fDelRegroupement(this.refOrdre).subscribe({
      error: ({ message }: Error) => notify(message, "error"),
      next: (res) => notify(res.data.fDelRegroupement.msg, "success"),
      complete: () => this.refreshDescriptifRegroupement(),
    });
  }

  private refreshDescriptifRegroupement() {
    this.ordresService
      .getOne_v2(this.refOrdre, ["descriptifRegroupement"], "no-cache")
      .subscribe(
        (res) =>
          (this.descriptifRegroupement = res.data.ordre.descriptifRegroupement)
      );
  }

  async onClickCreateLitige() {
    await this.waitUntilHeaderSaved();
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
    this.litigesBtn.nativeElement.click();
    setTimeout(() => this.formLitiges.createLitige());
  }

  private updateLogistiquesDates(date: Date) {
    this.ordresService
      .getOne_v2(this.ordre.id, new Set(["id", "logistiques.id"]))
      .pipe(
        concatMap((res) => {
          const logistiques = [];
          res.data.ordre.logistiques.forEach((logistique) =>
            logistiques.push({
              id: logistique.id,
              dateDepartPrevueFournisseur: date,
              dateDepartPrevueGroupage: date,
            })
          );
          return this.ordresLogistiquesService.saveAll(
            new Set(["id"]),
            logistiques
          );
        })
      )
      .subscribe(() => this.gridLogistiques?.refresh());
  }
}
