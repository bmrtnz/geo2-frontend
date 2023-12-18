import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from "@angular/core";
import { ChooseEntrepotPopupComponent } from "app/shared/components/choose-entrepot-popup/choose-entrepot-popup.component";
import { ChooseOrdrePopupComponent } from "app/shared/components/choose-ordre-popup/choose-ordre-popup.component";
import { ConfirmationResultPopupComponent } from "app/shared/components/confirmation-result-popup/confirmation-result-popup.component";
import LitigeCause from "app/shared/models/litige-cause.model";
import LitigeConsequence from "app/shared/models/litige-consequence.model";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import Ordre from "app/shared/models/ordre.model";
import { AuthService, LocalizationService } from "app/shared/services";
import { LitigeCausesService } from "app/shared/services/api/litige-causes.service";
import { LitigeConsequencesService } from "app/shared/services/api/litige-consequences.service";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import {
  DxListComponent,
  DxPopupComponent,
  DxRadioGroupComponent
} from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { EMPTY, forkJoin, from, iif, of, throwError, zip } from "rxjs";
import {
  catchError,
  concatMap,
  concatMapTo,
  finalize,
  map,
  mapTo,
  mergeMap, tap,
  toArray
} from "rxjs/operators";
import { ForfaitLitigePopupComponent } from "../forfait-litige-popup/forfait-litige-popup.component";
import { FraisAnnexesLitigePopupComponent } from "../form-litiges/frais-annexes-litige-popup/frais-annexes-litige-popup.component";
import { GridLotComponent } from "../gestion-litiges/grid-lot/grid-lot.component";
import { GridsService } from "../grids.service";
import { TabContext } from "../root/root.component";
import { SelectionLignesLitigePopupComponent } from "../selection-lignes-litige-popup/selection-lignes-litige-popup.component";


@Component({
  selector: "app-gestion-operations-popup",
  templateUrl: "./gestion-operations-popup.component.html",
  styleUrls: ["./gestion-operations-popup.component.scss"],
})
export class GestionOperationsPopupComponent implements OnChanges {
  @Input() public ordre: Partial<Ordre>;
  @Input() public infosLitige: any;
  @Output() public lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]];
  @Output() public litigeID: string;
  @Output() public currOrdre: Partial<Ordre>;
  /** Indicate when data is validated and if data had mutations */
  @Output() public whenUpdated = new EventEmitter<boolean>();
  @Output() public headerData: {
    responsable?: Litige["responsableTiersCode"];
    cause?: LitigeCause["id"];
    consequence?: LitigeConsequence["id"];
  } = {};

  public visible: boolean;
  public causeItems: any[];
  public consequenceItems: any[];
  public responsibleList: any[];
  public selectedCause: string;
  public selectedConsequence: string;
  public selectedResponsible: string;
  public title: string;
  public popupFullscreen = false;
  public ordreGenNumero: string;
  public running: any;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild("causes", { static: false }) causes: DxListComponent;
  @ViewChild("consequences", { static: false }) consequences: DxListComponent;
  @ViewChild("responsibles", { static: false })
  responsibles: DxRadioGroupComponent;
  @ViewChild(FraisAnnexesLitigePopupComponent, { static: false })
  fraisAnnexesPopup: FraisAnnexesLitigePopupComponent;
  @ViewChild(SelectionLignesLitigePopupComponent, { static: false })
  selectLignesPopup: SelectionLignesLitigePopupComponent;
  @ViewChild(ForfaitLitigePopupComponent, { static: false })
  forfaitPopup: ForfaitLitigePopupComponent;
  @ViewChild(GridLotComponent) private gridLot: GridLotComponent;
  @ViewChild(ChooseEntrepotPopupComponent)
  private chooseEntrepotPopup: ChooseEntrepotPopupComponent;
  @ViewChild(ChooseOrdrePopupComponent)
  private chooseOrdrePopup: ChooseOrdrePopupComponent;
  @ViewChild(ConfirmationResultPopupComponent)
  private confirmPopup: ConfirmationResultPopupComponent;

  constructor(
    public localizeService: LocalizationService,
    public causesService: LitigeCausesService,
    public litigesLignesService: LitigesLignesService,
    public litigesService: LitigesService,
    public ordresLogistiquesService: OrdresLogistiquesService,
    public fUtils: FormUtilsService,
    public consequencesService: LitigeConsequencesService,
    public gridsService: GridsService,
    private ordresService: OrdresService,
    private currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
    private tabContext: TabContext,
    private ordreLignesService: OrdreLignesService
  ) {
    this.resetRunning();
    this.responsibleList = [
      {
        id: "station",
        disabled: false,
        typeTiers: "F",
        visible: true,
      },
      {
        id: "transporteur",
        disabled: false,
        typeTiers: "T",
        visible: true,
      },
      {
        id: "transpApproche",
        disabled: false,
        typeTiers: "G",
        visible: false,
      },
      {
        id: "client",
        disabled: false,
        typeTiers: "C",
        visible: true,
      },
      {
        id: "bw",
        disabled: false,
        typeTiers: "W",
        visible: true,
      },
    ];
    this.displayResp = this.displayResp.bind(this);
  }

  ngOnChanges() {
    if (this.ordre?.id) this.setTitle();
  }

  setTitle() {
    this.title = this.localizeService.localize(
      "title-gestion-operations-popup"
    );
  }

  onHidden() {
    this.resetRunning();
  }

  resetRunning() {
    this.running = {
      createRefactTranspOrder: false,
      createReplaceOrder: false,
      addToReplaceOrder: false,
      validate: false
    }
  }

  updateCauseConseq(tiers) {
    this.causeItems = [];
    this.consequenceItems = [];
    const causeFilter = `valide == true and typeTier == ${tiers}`;
    const conseqFilter = `valide == true`;
    this.causesService
      .getList(["id", "description", "numeroTri"], causeFilter)
      .pipe(
        tap((res) => {
          this.causeItems = JSON.parse(
            JSON.stringify(res.data.allLitigeCauseList)
          );
          this.causeItems.sort((a, b) => a.numeroTri - b.numeroTri);
        })
      )
      .subscribe();
    this.consequencesService
      .getList(["id", "description"], conseqFilter)
      .pipe(
        tap((res) => {
          this.consequenceItems = JSON.parse(
            JSON.stringify(res.data.allLitigeConsequenceList)
          );
          this.consequenceItems.sort((a, b) =>
            this.fUtils.noDiacritics(a.description) >
              this.fUtils.noDiacritics(b.description)
              ? 1
              : 0
          );

          // Régularisation is disabled by default but must appear
          this.consequenceItems.filter((c) => c.id === "I")[0].disabled = true;

          // Filter indemnisation
          this.consequenceItems
            .filter((c) => c.id === "G")[0]
            .visible = ["transporteur", "transpApproche"].includes(this.selectedResponsible);
        })
      )
      .subscribe();
  }

  changeResponsible(e) {
    if (!e.value) return;
    this.selectedResponsible = e.value?.id;
    this.updateCauseConseq(e.value.typeTiers);
    this.headerData.responsable = e.value.typeTiers;
  }

  onCauseChanged(e) {
    // Only one item can be selected at once
    if (this.causes.selectedItems.length) this.causes.selectedItemKeys.shift();
    this.selectedCause = e.addedItems[0]?.id;

    if (this.consequenceItems.length) {
      // Filter Regularisation
      this.consequenceItems.filter((c) => c.id === "I")[0].visible = false;
      if (["W61", "C53", "F37", "T41"].includes(this.selectedCause)) {
        this.consequenceItems.filter((c) => c.id === "I")[0].visible = true;
      }
    }
    // reset selected consequence
    this.consequences.instance.unselectAll();
    this.headerData.cause = this.selectedCause;
  }

  onConsequenceChanged(e) {
    // Only one item can be selected at once
    if (this.consequences.selectedItems.length)
      this.consequences.selectedItemKeys.shift();
    this.selectedConsequence = e.addedItems[0]?.id;
    this.headerData.consequence = this.selectedConsequence;
  }

  validate() {
    this.running.validate = true;
    this.mutateLot()
      .pipe(
        concatMap((data) => this.gridLot.updateLot(data)),
        concatMap((rows) => this.gridLot.validate(rows)),
        concatMapTo(
          forkJoin({
            countCauseConseq: this.litigesService.countCauseConseq(
              this.ordre.id
            ),
            countLinkedOrders: this.litigesService.countLinkedOrders(
              this.ordre.id
            ),
          })
        ),
        concatMap(({ countCauseConseq, countLinkedOrders }) => {
          const nbOrdre = countLinkedOrders.data.countLinkedOrders;
          const { cause, consequence } = countCauseConseq.data.countCauseConseq;
          if (nbOrdre > 0 && cause === 1 && consequence === 1) {
            return this.confirmPopup
              .openAs(
                "WARNING",
                this.localizeService.localize(
                  "prompt-create-litige-linked-orders"
                )
              )
              .pipe(
                concatMap((res) => (res ? this.createLinkedOrders() : of(null)))
              );
          }
          return of(null);
        }),
        concatMapTo(this.gridLot.persist())
      )
      .subscribe({
        next: (dataMutated) => {
          this.quitPopup();
          this.whenUpdated.emit(dataMutated);
          this.gridsService.reload(["LitigeLigne"], this.gridsService.orderIdentifier(this.ordre));
        },
        error: (err: Error) => {
          this.running.validate = false;
          notify(err.message, "ERROR", 7000);
        },
      });
  }

  warnZeroQuantities() {
    if (this.gridLot?.hasZeroQuantities) {
      notify({
        message: this.localizeService.localize("warn-quantities"),
        type: "error"
      },
        { position: 'bottom center', direction: 'up-stack' }
      );
      return true;
    }
  }

  async createRefactTranspOrder() {
    await this.gridLot.grid.instance.saveEditData();
    if (this.warnZeroQuantities()) return;
    const ordre = await this.ordresService
      .getOne_v2(
        this.ordre.id,
        new Set([
          "id",
          "transporteur.clientRaisonSocial.id",
          "devise.id",
          "tauxDevise",
        ])
      )
      .pipe(map((res) => res.data.ordre))
      .toPromise();

    if (!ordre.transporteur.clientRaisonSocial?.id) {
      this.running.createRefactTranspOrder = false;
      return notify(
        this.localizeService.localize(
          "no-associated-client-to-transporteur-contact"
        ),
        "ERROR",
        7000
      );
    }

    let totalAvoirClient = this.gridLot.getTotalSummaries("clientAvoir");

    if (ordre.devise.id !== "EUR") totalAvoirClient *= ordre.tauxDevise;

    this.litigesService
      .fCreeOrdreRefacturationTransporteur(
        ordre.id,
        totalAvoirClient,
        this.currentCompanyService.getCompany().id,
        this.authService.currentUser.nomUtilisateur
      )
      .pipe(
        map(res => res.data.fCreeOrdreRefacturationTransporteur.data.ls_ord_ref_refacturer),
        // Fetch numero of newly created ordre for view
        concatMap(ordreReplaceID => this.registerOrdreRep(ordreReplaceID)),
        finalize(() => {
          this.running.createRefactTranspOrder = false;
          this.gridLot.refresh();
          this.gridsService.reload(["LitigeLigne"], this.gridsService.orderIdentifier(this.ordre));
        }),
      )
      .subscribe({
        error: (error: Error) => {
          this.running.createRefactTranspOrder = false;
          if (error?.message) notify(error.message, "ERROR", 7000);
          console.error(error);
        },
      });

  }

  async createReplaceOrder() {
    await this.gridLot.grid.instance.saveEditData();
    if (this.warnZeroQuantities()) return;
    let ordreReplaceID: Ordre["id"];
    this.fetchLot().pipe(
      concatMap(lot => this.gridLot.persist().pipe(mapTo(lot))),
      tap(lot => this.lot[1] = lot),
      concatMap(() => this.chooseEntrepotPopup.prompt()),
      concatMap((selected) =>
        this.ordresService.fCreeOrdreReplacement(
          this.ordre.id,
          selected.entrepotID,
          selected.societeID,
          this.authService.currentUser.nomUtilisateur
        )
      ),
      map(
        (replacementResponse) =>
          replacementResponse.data.fCreeOrdreReplacement.data
            .ls_ord_ref_replace
      ),
      tap((refReplace) => {
        ordreReplaceID = refReplace;
      }),
      concatMap(() => {
        const [litigeID, lotNum] = this.lot;
        return this.litigesLignesService.getList(
          `litige.id==${litigeID} and numeroGroupementLitige${lotNum ? "==" : "=isnull="
          }${lotNum}`,
          ["id", "ordreLigne.id"]
        );
      }),
      map((res) => res.data.allLitigeLigneList),
      concatMap((lignes) => {
        return Promise.all(
          lignes.map((ligne) =>
            this.ordreLignesService
              .fCreeOrdreReplacementLigne(
                ligne.id,
                ordreReplaceID,
                this.ordre.id,
                ligne.ordreLigne.id,
                this.currentCompanyService.getCompany().id
              )
              .toPromise()
          )
        );
      }),
      // Fetch numero of newly created ordre for view
      concatMap(() => this.registerOrdreRep(ordreReplaceID)),
      finalize(() => {
        this.running.createReplaceOrder = false;
        this.gridLot.refresh();
        this.gridsService.reload(["LitigeLigne"], this.gridsService.orderIdentifier(this.ordre));
      }),
    )
      .subscribe({
        error: (error: Error) => {
          this.running.createReplaceOrder = false;
          if (error?.message) notify(error.message, "ERROR", 7000);
          console.error(error);
        },
      });
  }

  async addToReplaceOrder() {
    await this.gridLot.grid.instance.saveEditData();
    if (this.warnZeroQuantities()) return;
    let ordreReplace: Partial<Ordre>;
    this.fetchLot().pipe(
      concatMap(lot => this.gridLot.persist().pipe(mapTo(lot))),
      tap(lot => this.lot[1] = lot),
      concatMap(() => this.chooseOrdrePopup.prompt()),
      concatMap((ordreID) =>
        this.ordresService.getOne_v2(
          ordreID,
          new Set(["id", "bonAFacturer", "aBloquer", "numero"])
        )
      ),
      map((res) => res.data.ordre),
      concatMap((ordre) => {
        ordreReplace = ordre;
        if (ordre.aBloquer || ordre.bonAFacturer) {
          if (ordre.bonAFacturer)
            return throwError(
              new Error(this.localizeService.localize("replace-order-denied"))
            );
          return EMPTY;
        }
        return of(ordre);
      }),
      concatMap(() => {
        const [litigeID, lotNum] = this.lot;
        return this.litigesLignesService.getList(
          `litige.id==${litigeID} and numeroGroupementLitige${lotNum ? "==" : "=isnull="
          }${lotNum}`,
          ["id", "ordreLigne.id"]
        );
      }),
      map((res) => res.data.allLitigeLigneList),
      concatMap((lignes) => {
        return Promise.all(
          lignes.map((ligne) =>
            this.ordreLignesService
              .fCreeOrdreReplacementLigne(
                ligne.id,
                ordreReplace.id,
                this.ordre.id,
                ligne.ordreLigne.id,
                this.currentCompanyService.getCompany().id
              )
              .toPromise()
          )
        );
      }),
      concatMap(() => this.registerOrdreRep(ordreReplace.id, "add")),
      finalize(() => {
        this.running.addToReplaceOrder = false;
        this.gridLot.refresh();
      }),
    )
      .subscribe({
        error: (error: Error) => {
          this.running.addToReplaceOrder = false;
          if (error?.message) notify(error.message, "ERROR", 7000);
          console.error(error);
        },
      });
  }

  openArticleAdder() {
    this.selectLignesPopup.visible = true;
  }

  pushLitigeLignes(event) {
    from(this.gridLot.refresh())
      .pipe(
        // on ignore l'erreur de "refresh annulé"
        catchError(err => err === "canceled" ? of(null) : throwError(() => err)),
        concatMap(() => this.setupLot()),
        concatMap((data) => this.gridLot.updateLot(data))
      )
      .subscribe({
        error: (err: Error) => notify(err.message, "ERROR", 7000),
      });
  }

  autoFill() {
    if (this.checkEmptyCauseConseq()) return;

    const [litigeID, lotNum] = this.lot;
    this.litigesLignesService
      .getList(
        `litige.id==${litigeID} and numeroGroupementLitige${lotNum ? "==" : "=isnull="
        }${lotNum}`,
        [
          "id",
          "ordreLigne.nombrePalettesExpediees",
          "ordreLigne.nombreColisExpedies",
          "ordreLigne.poidsNetExpedie",
          "ordreLigne.venteQuantite",
          "ordreLigne.achatQuantite",
        ]
      )
      .pipe(
        mergeMap((res) => res.data.allLitigeLigneList),
        map(
          (res) =>
          ({
            id: res.id,
            clientNombrePalettes: res.ordreLigne.nombrePalettesExpediees,
            responsableNombrePalettes: res.ordreLigne.nombrePalettesExpediees,
            clientNombreColisReclamation: res.ordreLigne.nombreColisExpedies,
            responsableNombreColis: res.ordreLigne.nombreColisExpedies,
            clientPoidsNet: res.ordreLigne.poidsNetExpedie,
            clientQuantite: res.ordreLigne.venteQuantite,
            responsableQuantite: res.ordreLigne.achatQuantite,
          } as LitigeLigne)
        ),
        toArray(),
        concatMap((data) => this.gridLot.updateLot(data))
      )
      .subscribe({
        error: (err: Error) => notify(err.message, "ERROR", 7000),
      });
  }

  forfait() {
    if (
      this.responsibles.value?.typeTiers !== "F" &&
      this.selectedConsequence === "B"
    )
      return notify(
        `${this.localizeService.localize("no-possible-saisie-forfait")}`,
        "warning",
        5000
      );

    if (this.checkEmptyCauseConseq()) return;

    this.fetchLot().pipe(
      concatMap(lot => this.gridLot.persist().pipe(mapTo(lot))),
      finalize(() => this.gridLot.refresh()),
    ).subscribe(lot => {
      this.lot[1] = lot;
      this.forfaitPopup.visible = true;
    });
  }

  reInitialize() {
    const [litigeID, lotNum] = this.lot;
    this.litigesLignesService
      .getList(
        `litige.id==${litigeID} and numeroGroupementLitige${lotNum ? "==" : "=isnull="
        }${lotNum}`,
        [
          "id",
          "ordreLigne.venteUnite.id",
          "ordreLigne.achatUnite.id",
          "ordreLigne.ventePrixUnitaire",
          "ordreLigne.achatPrixUnitaire",
          "ordreLigne.achatDevisePrixUnitaire",
        ]
      )
      .pipe(
        mergeMap((res) => res.data.allLitigeLigneList),
        map(
          (res) =>
          ({
            id: res.id,
            clientUniteFactureCode: res.ordreLigne.venteUnite?.id ?? null,
            responsableUniteFactureCode:
              res.ordreLigne.achatUnite?.id ?? null,
            clientPrixUnitaire: res.ordreLigne.ventePrixUnitaire,
            responsablePrixUnitaire: res.ordreLigne.achatPrixUnitaire,
            devisePrixUnitaire: res.ordreLigne.achatDevisePrixUnitaire,
          } as LitigeLigne)
        ),
        toArray(),
        concatMap((data) => this.gridLot.updateLot(data))
      )
      .subscribe({
        error: (err: Error) => notify(err.message, "ERROR", 7000),
      });
  }

  fraisAnnexes() {
    this.litigeID = this.infosLitige.litige.id;
    this.fraisAnnexesPopup.visible = true;
  }

  checkEmptyCauseConseq() {
    const texts = [];
    let message;
    if (!this.selectedCause)
      texts.push(this.localizeService.localize("one-cause"));
    if (!this.selectedConsequence)
      texts.push(this.localizeService.localize("one-consequence"));
    if (texts.length) {
      message = texts.join(` ${this.localizeService.localize("et")} `);
      notify(
        `${this.localizeService.localize("please-select")} ${message}`,
        "warning",
        5000
      );
      return true;
    }
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  hidePopup() {
    this.gridLot.grid.instance.cancelEditData();
    this.causes.selectedItems = [];
    this.consequences.selectedItems = [];
    this.causeItems = [];
    this.consequenceItems = [];
    this.responsibles.instance.reset();
    this.popup.visible = false;
  }

  displayResp(data) {
    return data
      ? this.localizeService.localize(
        "gestion-operations-responsable-" + data.id
      )
      : null;
  }

  displayCapitalize(data) {
    return data
      ? data.description.charAt(0).toUpperCase() +
      data.description.slice(1).toLowerCase()
      : null;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("gestion-operations-popup");
    e.component.content().parentNode.classList.add("no-opacity"); // To avoid flash effect (Dx bug)
  }

  onShown(e) {
    e.component.content().parentNode.classList.remove("no-opacity"); // To avoid flash effect (Dx bug)
    if (!this.lot[1]) {
      // lot creation
      this.responsibles.value = this.responsibleList[0];
      // Is there a transporteur approche? Then show corresponding radio btn
      this.ordresLogistiquesService
        .count(
          `ordre.id == ${this.ordre.id} and transporteurGroupage.id=isnotnull=null`
        )
        .subscribe((res) => {
          if (res.data.countOrdreLogistique)
            this.responsibleList.filter(
              (r) => r.id === "transpApproche"
            )[0].visible = true;
        });
    } else {
      // lot mutation
      this.fetchLotInfo().subscribe((res) => {
        // sync inputs
        if (res?.responsableTypeCode)
          this.responsibles.value = this.responsibleList.find(
            (r) => r.typeTiers === res.responsableTypeCode
          );
        this.ordreGenNumero = res?.numeroOrdreReplacement ?? "";
      });
    }

    iif(() => !!this.lot[1], of({}), this.setupLot())
      .pipe(
        concatMap((data) => this.gridLot.updateLot(data)),
        concatMapTo(this.fetchLotInfo())
      )
      .subscribe({
        next: (res) => {
          if (res?.cause?.id) {
            const itemIndex = this.causeItems.findIndex(
              (r) => r.id === res.cause.id
            );
            this.causes.instance.selectItem(itemIndex);
            this.causes.instance.scrollToItem(itemIndex);
          }
          if (res?.consequence?.id) {
            const itemIndex = this.consequenceItems.findIndex(
              (r) => r.id === res.consequence.id
            );
            this.consequences.instance.selectItem(itemIndex);
            this.consequences.instance.scrollToItem(itemIndex);
          }
        },
        error: (err: Error) => notify(err.message, "ERROR", 7000),
      });
  }

  /** Update temporary rows with `numero lot`, `ordre replacement` and `validity` */
  private setupLot() {
    const fetchOrdreRep = this.fetchLotInfo().pipe(
      map((res) => [
        res?.ordreReferenceRemplacement,
        res?.numeroOrdreReplacement,
      ])
    );

    return zip(this.fetchLot(), fetchOrdreRep).pipe(
      map(
        ([
          numeroGroupementLitige,
          [ordreReferenceRemplacement, numeroOrdreReplacement],
        ]) =>
        ({
          numeroGroupementLitige,
          ordreReferenceRemplacement,
          numeroOrdreReplacement,
          valide: true,
        } as Partial<LitigeLigne>)
      )
    );
  }

  private mutateLot() {
    return zip(
      of(this.responsibles.value.typeTiers),
      of(this.causes.selectedItems[0]),
      of(this.consequences.selectedItems[0])
    ).pipe(
      map(
        ([responsableTypeCode, cause, consequence]) =>
        ({
          responsableTypeCode,
          cause: { id: cause.id },
          consequence: { id: consequence.id },
        } as Partial<LitigeLigne>)
      ),
      catchError((res) =>
        throwError(
          new Error(this.localizeService.localize("mutate-lot-invalid-inputs"))
        )
      ) // invalid inputs
    );
  }

  quitPopup() {
    this.lot = null;
    this.hidePopup();
  }

  // assuming we have an existing lot
  private fetchLotInfo() {
    const [litigeID, lotNum] = this.lot;
    return this.litigesLignesService
      .getList(`litige.id==${litigeID} and numeroGroupementLitige==${lotNum}`, [
        "responsableTypeCode",
        "cause.id",
        "consequence.id",
        "ordreReferenceRemplacement",
        "numeroOrdreReplacement",
      ])
      .pipe(map((res) => res.data.allLitigeLigneList[0]));
  }

  forfaitChanged(event) {
    this.gridLot.updateLot(event).subscribe({
      error: (err: Error) => notify(err.message, "ERROR", 7000),
    });
  }

  private createLinkedOrders() {
    return this.litigesService
      .fCreateLitigeLinkedOrders(this.ordre.id)
      .pipe(
        tap((res) =>
          notify(
            this.localizeService.localize("done-create-litige-linked-orders"),
            "SUCCESS",
            3500
          )
        )
      );
  }

  private registerOrdreRep(ordreID: Ordre["id"], type?) {
    return this.ordresService
      .getOne_v2(ordreID, new Set(["id", "numero"]))
      .pipe(
        map((res) => res.data.ordre),
        concatMap((data) => {
          this.ordreGenNumero = data.numero;
          if (this.ordreGenNumero) {
            notify(
              this.localizeService
                .localize(type !== "add" ? "ordre-cree" : "ajout-ordre-ok")
                .replace("&O", this.ordreGenNumero),
              "success",
              9000
            );
          }
          return this.litigesLignesService.saveLot(new Set(["id"]), this.lot, {
            ordreReferenceRemplacement: data.id,
            numeroOrdreReplacement: data.numero
          })
        })
      );
  }

  private fetchLot() {
    return iif(
      () => !!this?.lot[1],
      of(this.lot[1]),
      this.litigesService
        .genNumLot(this.infosLitige.litige.id)
        .pipe(map((genLot) => genLot.data.genNumLot))
    );
  }
}
