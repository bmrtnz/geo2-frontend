import {
    AfterViewInit, Component, ElementRef, EventEmitter, isDevMode, OnDestroy, OnInit,
    Output, QueryList, ViewChild, ViewChildren
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { FileManagerComponent } from "app/shared/components/file-manager/file-manager-popup.component";
import { Role, Societe, Type } from "app/shared/models";
import { Ordre, Statut } from "app/shared/models/ordre.model";
import { AuthService, ClientsService, EntrepotsService, TransporteursService } from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { DevisesService } from "app/shared/services/api/devises.service";
import { IncotermsService } from "app/shared/services/api/incoterms.service";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { MruOrdresService } from "app/shared/services/api/mru-ordres.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { PortsService } from "app/shared/services/api/ports.service";
import { TypesCamionService } from "app/shared/services/api/types-camion.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { DxAccordionComponent, DxTextBoxComponent } from "devextreme-angular";
import { dxElement } from "devextreme/core/element";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { of, Subject } from "rxjs";
import { concatMap, filter, first, map, switchMap, takeUntil, takeWhile } from "rxjs/operators";
import { AjoutArticlesHistoPopupComponent } from "../ajout-articles-histo-popup/ajout-articles-histo-popup.component";
import { AjoutArticlesManuPopupComponent } from "../ajout-articles-manu-popup/ajout-articles-manu-popup.component";
import { GridLignesComponent } from "../grid-lignes/grid-lignes.component";
import { RouteParam, TabChangeData, TabContext, TAB_ORDRE_CREATE_ID } from "../root/root.component";

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
        "transporteurDEVCode",
        "transporteurDEVTaux",
        "baseTarifTransport.id",
        "client.instructionCommercial",
        "entrepot.instructionSecretaireCommercial",
        "entrepot.gestionnaireChep",
        "entrepot.referenceChep",
        "fraisPrixUnitaire",
        "fraisUnite.id",
        "fraisPlateforme",
    ];

    private destroy = new Subject<boolean>();
    private anchorsInitialized = false;

    public fragments = Fragments;
    public status: string;
    public ordreFacture: boolean;
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
    public validationPopupVisible = false;
    public dotLitiges: string;
    public dotCommentaires: number;
    public dotCQ: number;
    public orderNumber: string;
    public fullOrderNumber: string;
    public env = environment;
    public allowMutations = false;

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

    @ViewChild(FileManagerComponent, { static: false })
    fileManagerComponent: FileManagerComponent;
    @ViewChild("comLog", { static: false }) comLog: DxTextBoxComponent;
    @ViewChildren(DxAccordionComponent) accordion: DxAccordionComponent[];
    @ViewChildren("anchor") anchors: QueryList<ElementRef | DxAccordionComponent>;
    @ViewChild(AjoutArticlesManuPopupComponent, { static: false }) ajoutArtManu: AjoutArticlesManuPopupComponent;
    @ViewChild(AjoutArticlesHistoPopupComponent, { static: false }) ajoutArtHisto: AjoutArticlesHistoPopupComponent;
    @ViewChild(GridLignesComponent) gridLignes: GridLignesComponent;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private formUtils: FormUtilsService,
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
        private mruOrdresService: MruOrdresService,
        private tabContext: TabContext,
        private authService: AuthService
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

    }

    ngOnDestroy() {
        this.destroy.next(true);
        this.destroy.unsubscribe();
    }

    ngAfterViewInit() {
        this.comLog.instance.option("hint", this.comLog.value);
    }

    onSubmit() {
        if (!this.formGroup.pristine && this.formGroup.valid && !this.env.production) {
            const ordre = this.formUtils.extractDirty(this.formGroup.controls, Ordre.getKeyField());
            ordre.societe = { id: this.currentCompanyService.getCompany().id };

            this.ordresService.save({ ordre }).subscribe({
                next: (res) => {
                    this.refreshStatus(res.data.saveOrdre.statut);
                    notify("Sauvegardé", "success", 3000);
                },
                error: () => notify("Echec de la sauvegarde", "error", 3000),
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

    onArticleManClick() {
        this.ajoutArtManu.visible = true;
    }

    onArticleHistoClick() {
        this.ajoutArtHisto.visible = true;
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
        const ordre = this.formUtils.extractDirty(this.formGroup.controls, Ordre.getKeyField());
        if (!ordre.id) return;
        this.ordresService.delete({ id: ordre.id }).subscribe({
            next: (_) => {
                notify("Ordre supprimé", "success", 3000);
            },
            error: (_) => notify("Echec de la suppression", "error", 3000),
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
            ordresSource.filter(["referenceClient", "=", refClt]);
            ordresSource.load().then((res) => {
                res.map(value => {
                    if (numero !== value.numero) {
                        this.linkedOrders.push({ ordre: value, criteria: LinkedCriterias.Client });
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

    openLinkedOrder(numero: string) {
        this.tabContext.openOrdre(numero);
    }

    cancelClick() {
        this.validationPopupVisible = false;
    }

    deviseDisplayExpr(item) {
        return item ? item.description + " (" + self.ordre?.tauxDevise + ")" : null;
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
        if (!e) return;
        this.gridLignes.nbInsertedArticles = e;
        this.gridLignes.enableFilters();
    }

    private initializeForm() {
        const currentCompany: Societe = this.currentCompanyService.getCompany();
        this.route.paramMap
            .pipe(
                first(),
                map(params => params.get(RouteParam.TabID)),
                switchMap(id => {
                    if (id === TAB_ORDRE_CREATE_ID) return of({} as Ordre);
                    return this.ordresService
                        .getOneByNumeroAndSociete(id, currentCompany.id, this.headerFields)
                        .valueChanges
                        .pipe(map(res => res.data.ordreByNumeroAndSociete));
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
    }

    private refetchStatut() {
        this.route.paramMap
            .pipe(
                first(),
                map(params => params.get(RouteParam.TabID)),
                concatMap(numero => this.ordresService
                    .getOneByNumeroAndSociete(
                        numero,
                        this.currentCompanyService.getCompany().id,
                        ["id", "statut"],
                    )
                    .valueChanges),
                takeWhile(res => res.loading),
                map(res => res.data.ordreByNumeroAndSociete),
            )
            .subscribe({
                next: ordre => this.refreshStatus(ordre.statut),
            });
    }

}
