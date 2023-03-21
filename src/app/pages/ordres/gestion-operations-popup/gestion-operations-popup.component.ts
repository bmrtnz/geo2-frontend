import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { LitigeCausesService } from "app/shared/services/api/litige-causes.service";
import { LitigeConsequencesService } from "app/shared/services/api/litige-consequences.service";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { DxListComponent, DxPopupComponent, DxRadioGroupComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { EMPTY, from, iif, of, throwError, zip } from "rxjs";
import { catchError, concatMap, concatMapTo, map, mergeMap, tap, toArray } from "rxjs/operators";
import { ForfaitLitigePopupComponent } from "../forfait-litige-popup/forfait-litige-popup.component";
import { FraisAnnexesLitigePopupComponent } from "../form-litiges/frais-annexes-litige-popup/frais-annexes-litige-popup.component";
import { GridLotComponent } from "../gestion-litiges/grid-lot/grid-lot.component";
import { GridsService } from "../grids.service";
import { SelectionLignesLitigePopupComponent } from "../selection-lignes-litige-popup/selection-lignes-litige-popup.component";

@Component({
  selector: "app-gestion-operations-popup",
  templateUrl: "./gestion-operations-popup.component.html",
  styleUrls: ["./gestion-operations-popup.component.scss"]
})
export class GestionOperationsPopupComponent implements OnChanges {

  @Input() public ordre: Partial<Ordre>;
  @Input() public infosLitige: any;
  @Output() public lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]];
  @Output() public litigeID: string;
  @Output() public currOrdre: Partial<Ordre>;
  @Output() public updateFrais = new EventEmitter();

  public visible: boolean;
  public causeItems: any[];
  public consequenceItems: any[];
  public responsibleList: any[];
  public selectedCause: string;
  public selectedConsequence: string;
  public selectedResponsible: string;
  public title: string;
  public popupFullscreen = false;
  public firstShown: boolean;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild("causes", { static: false }) causes: DxListComponent;
  @ViewChild("consequences", { static: false }) consequences: DxListComponent;
  @ViewChild("responsibles", { static: false }) responsibles: DxRadioGroupComponent;

  @ViewChild(FraisAnnexesLitigePopupComponent, { static: false }) fraisAnnexesPopup: FraisAnnexesLitigePopupComponent;
  @ViewChild(SelectionLignesLitigePopupComponent, { static: false }) selectLignesPopup: SelectionLignesLitigePopupComponent;
  @ViewChild(ForfaitLitigePopupComponent, { static: false }) forfaitPopup: ForfaitLitigePopupComponent;
  @ViewChild(GridLotComponent) private gridLot: GridLotComponent;

  constructor(
    private localizeService: LocalizationService,
    public causesService: LitigeCausesService,
    public litigesLignesService: LitigesLignesService,
    public litigesService: LitigesService,
    public ordresLogistiquesService: OrdresLogistiquesService,
    public fUtils: FormUtilsService,
    public consequencesService: LitigeConsequencesService,
    public gridsService: GridsService,

  ) {
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
      }
    ];
    this.displayResp = this.displayResp.bind(this);
  }

  ngOnChanges() {
    if (this.ordre?.id) this.setTitle();
  }

  setTitle() {
    this.title = this.localizeService.localize("title-gestion-operations-popup");
  }

  updateCauseConseq(tiers) {
    this.causeItems = [];
    this.consequenceItems = [];
    const causeFilter = `valide == true and typeTier == ${tiers}`;
    const conseqFilter = `valide == true`;
    this.causesService.getList(["id", "description"], causeFilter)
      .pipe(
        tap(res => {
          this.causeItems = JSON.parse(JSON.stringify(res.data.allLitigeCauseList));
          this.causeItems.sort((a, b) => this.fUtils.noDiacritics(a.description) > this.fUtils.noDiacritics(b.description) ? 1 : 0);
        }),
        concatMapTo(this.fetchRestoreInfo()),
      )
      .subscribe((res) => {
        if (res?.cause?.id) {
          const itemIndex = this.causeItems.findIndex(r => r.id === res.cause.id);
          this.causes.instance.selectItem(itemIndex);
        }
      });
    this.consequencesService.getList(["id", "description"], conseqFilter).pipe(
      tap((res) => {
        this.consequenceItems = JSON.parse(JSON.stringify(res.data.allLitigeConsequenceList));
        this.consequenceItems.sort((a, b) => this.fUtils.noDiacritics(a.description) > this.fUtils.noDiacritics(b.description) ? 1 : 0);

        // Régularisation is disabled by default but must appear
        this.consequenceItems.filter(c => c.id === "I")[0].disabled = true;

        // Firstly on "Retour station"
        if (this.firstShown) {
          this.consequences.selectedItems = [this.consequenceItems.filter(c => c.id === "A")[0]];
          this.firstShown = false;
        }
        // Filter indemnisation
        if (["transporteur", "transpApproche"].includes(this.selectedResponsible))
          this.consequenceItems.filter(c => c.id === "G")[0].visible = false;

      }),
      concatMapTo(this.fetchRestoreInfo()),
    )
      .subscribe((res) => {
        if (res?.consequence?.id) {
          const itemIndex = this.consequenceItems.findIndex(r => r.id === res.consequence.id);
          this.consequences.instance.selectItem(itemIndex);
        }
      });
  }

  changeResponsible(e) {
    this.selectedResponsible = e.value?.id;
    if (e.value) this.updateCauseConseq(e.value.typeTiers);
  }

  onCauseChanged(e) {
    // Only one item can be selected at once
    if (this.causes.selectedItems.length) this.causes.selectedItemKeys.shift();
    this.selectedCause = e.addedItems[0]?.id;

    if (this.consequenceItems.length) {
      // Filter Regularisation
      this.consequenceItems.filter(c => c.id === "I")[0].visible = false;
      if (["W61", "C53", "F37", "T41"].includes(this.selectedCause)) {
        this.consequenceItems.filter(c => c.id === "I")[0].visible = true;
      }
    }
  }
  onConsequenceChanged(e) {
    // Only one item can be selected at once
    if (this.consequences.selectedItems.length) this.consequences.selectedItemKeys.shift();
    this.selectedConsequence = e.addedItems[0]?.id;
  }

  createRefactOrder() {
    /////////////////////////////////
    //  Fonction
    /////////////////////////////////
  }

  openOrder() {
    // Appel tab
  }

  validate() {
    this.mutateLot().pipe(
      concatMap(data => this.gridLot.updateLot(data)),
      concatMapTo(this.gridLot.persist()),
    )
      .subscribe({
        next: () => {
          this.quitPopup();
          this.gridsService.reload("LitigeLigne");
        },
        error: (err: Error) => notify(err.message, "ERROR", 3500),
      });
  }

  createRefactTranspOrder() {
    /////////////////////////////////
    //  Fonction
    /////////////////////////////////
  }

  createReplaceOrder() {
    /////////////////////////////////
    //  Fonction
    /////////////////////////////////
  }

  addToReplaceOrder() {
    /////////////////////////////////
    //  Fonction
    /////////////////////////////////
  }

  openArticleAdder() {
    this.selectLignesPopup.visible = true;
  }

  pushLitigeLignes(event) {
    from(this.gridLot.refresh())
      .pipe(
        concatMapTo(this.setupLotCreation()),
        concatMap(data => this.gridLot.updateLot(data))
      )
      .subscribe({
        error: (err: Error) => notify(err.message, "ERROR", 3500),
      });
  }

  autoFill() {

    if (this.checkEmptyCauseConseq()) return;

    const [litigeID, lotNum] = this.lot;
    this.litigesLignesService.getList(
      `litige.id==${litigeID} and numeroGroupementLitige${lotNum ? "==" : "=isnull="}${lotNum}`,
      [
        "id",
        "ordreLigne.nombrePalettesExpediees",
        "ordreLigne.nombreColisExpedies",
        "ordreLigne.poidsNetExpedie",
        "ordreLigne.venteQuantite",
        "ordreLigne.achatQuantite",
      ]).pipe(
        mergeMap(res => res.data.allLitigeLigneList),
        map(res => ({
          id: res.id,
          clientNombrePalettes: res.ordreLigne.nombrePalettesExpediees,
          responsableNombrePalettes: res.ordreLigne.nombrePalettesExpediees,
          clientNombreColisReclamation: res.ordreLigne.nombreColisExpedies,
          responsableNombreColis: res.ordreLigne.nombreColisExpedies,
          clientPoidsNet: res.ordreLigne.poidsNetExpedie,
          clientQuantite: res.ordreLigne.venteQuantite,
          responsableQuantite: res.ordreLigne.achatQuantite,
        } as LitigeLigne)),
        toArray(),
        concatMap(data => this.gridLot.updateLot(data)),
      )
      .subscribe({
        error: (err: Error) => notify(err.message, "ERROR", 3500),
      });

  }

  forfait() {
    if (this.responsibles.value?.typeTiers !== "F" && this.selectedConsequence === "B")
      return notify(
        `${this.localizeService.localize("no-possible-saisie-forfait")}`, "warning", 3000
      );

    if (this.checkEmptyCauseConseq()) return;

    this.forfaitPopup.visible = true;

  }

  reInitialize() {
    /////////////////////////////////
    //  Fonction
    /////////////////////////////////
  }

  fraisAnnexes() {
    this.litigeID = this.infosLitige.litige.id;
    this.fraisAnnexesPopup.visible = true;
  }

  checkEmptyCauseConseq() {
    const texts = [];
    let message;
    if (!this.selectedCause) texts.push(this.localizeService.localize("one-cause"));
    if (!this.selectedConsequence) texts.push(this.localizeService.localize("one-consequence"));
    if (texts.length) {
      message = texts.join(" & ");
      notify(`${this.localizeService.localize("please-select")} ${message}`, "warning", 5000);
      return true;
    }
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  hidePopup() {
    this.causes.selectedItems = [];
    this.consequences.selectedItems = [];
    this.causeItems = [];
    this.consequenceItems = [];
    this.responsibles.instance.reset();
    this.popup.visible = false;
  }

  displayResp(data) {
    return data ? this.localizeService.localize("gestion-operations-responsable-" + data.id) : null;
  }

  displayCapitalize(data) {
    return data ? data.id + " - " + data.description.charAt(0).toUpperCase() + data.description.slice(1).toLowerCase() : null;
    // return data ? data.description.charAt(0).toUpperCase() + data.description.slice(1).toLowerCase() : null;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("gestion-operations-popup");
  }

  onShown() {
    if (!this.lot[1]) { // lot creation
      this.firstShown = true;
      this.responsibles.value = this.responsibleList[0];
      // Is there a transporteur approche? Then show corresponding radio btn
      this.ordresLogistiquesService
        .count(`ordre.id == ${this.ordre.id} and transporteurGroupage.id=isnotnull=null`)
        .subscribe((res) => {
          if (res.data.countOrdreLogistique)
            this.responsibleList.filter(r => r.id === "transpApproche")[0].visible = true;
        });
    } else { // lot mutation
      this.syncResponsableInput();
    }

    iif(() => !!this.lot[1], EMPTY, this.setupLotCreation())
      .pipe(
        concatMap(data => this.gridLot.updateLot(data)),
      )
      .subscribe({
        error: (err: Error) => notify(err.message, "ERROR", 3500),
      });
  }

  /** Update temporary rows with numero lot and validity */
  private setupLotCreation() {
    return zip(
      this.litigesService.genNumLot(this.infosLitige.litige.id),
    ).pipe(
      map(([genLot]) => genLot.data.genNumLot),
      map(numeroGroupementLitige => ({
        numeroGroupementLitige,
        valide: true,
      } as Partial<LitigeLigne>)),
    );
  }

  private mutateLot() {
    return zip(
      of(this.responsibles.value.typeTiers),
      of(this.causes.selectedItems[0]),
      of(this.consequences.selectedItems[0]),
    ).pipe(
      map(([responsableTypeCode, cause, consequence]) => ({
        responsableTypeCode,
        cause: { id: cause.id },
        consequence: { id: consequence.id },
      } as Partial<LitigeLigne>)),
      catchError(res => throwError(
        new Error(this.localizeService.localize("mutate-lot-invalid-inputs")))), // invalid inputs
    );
  }

  quitPopup() {
    this.lot = null;
    this.hidePopup();
  }

  private syncResponsableInput() {
    this.fetchRestoreInfo().subscribe(res => {
      if (res?.responsableTypeCode)
        this.responsibles.value = this.responsibleList
          .find(r => r.typeTiers === res.responsableTypeCode);
    });
  }

  // assuming we have an existing lot
  private fetchRestoreInfo() {
    const [litigeID, lotNum] = this.lot;
    return this.litigesLignesService.getList(
      `litige.id==${litigeID} and numeroGroupementLitige==${lotNum}`,
      ["responsableTypeCode", "cause.id", "consequence.id"]).pipe(
        map(res => res.data.allLitigeLigneList[0]),
      );
  }

}


