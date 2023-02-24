import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { OrdreLigne } from "app/shared/models";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { LitigeCausesService } from "app/shared/services/api/litige-causes.service";
import { LitigeConsequencesService } from "app/shared/services/api/litige-consequences.service";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { DxListComponent, DxPopupComponent, DxRadioGroupComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { ForfaitLitigePopupComponent } from "../forfait-litige-popup/forfait-litige-popup.component";
import { FraisAnnexesLitigePopupComponent } from "../form-litiges/frais-annexes-litige-popup/frais-annexes-litige-popup.component";
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
  @Input() public lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]];
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

  constructor(
    private localizeService: LocalizationService,
    public causesService: LitigeCausesService,
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
      .subscribe((res) => {
        this.causeItems = JSON.parse(JSON.stringify(res.data.allLitigeCauseList));
        this.causeItems.sort((a, b) => this.fUtils.noDiacritics(a.description) > this.fUtils.noDiacritics(b.description) ? 1 : 0);
      });
    this.consequencesService.getList(["id", "description"], conseqFilter)
      .subscribe((res) => {
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

    // Filter Regularisation
    this.consequenceItems.filter(c => c.id === "I")[0].visible = false;
    if (["W61", "C53", "F37", "T41"].includes(this.selectedCause)) {
      this.consequenceItems.filter(c => c.id === "I")[0].visible = true;
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
    /////////////////////////////////
    //  Validation
    /////////////////////////////////
    this.quitPopup();
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

  addArticle() {
    // Geo1 : Ouverture de la fenêtre w_litige_pick_ordre_ordlig_v2
  }

  autoFill() {

    if (this.checkEmptyCauseConseq()) return;
    /////////////////////////////////
    //  Fonction
    /////////////////////////////////
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

  assignLitigeLignes(lignes?: Array<OrdreLigne["id"]>) {
    console.log(lignes);
    //////////////////////////////////////
    // Fonction à implémenter
    //////////////////////////////////////
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
    if (this.ordre?.id) {
      this.firstShown = true;
      this.responsibles.value = this.responsibleList[0];
      // Is there a transporteur approche? Then show corresponding radio btn
      this.ordresLogistiquesService
        .count(`ordre.id == ${this.ordre.id} and transporteurGroupage.id=isnotnull=null`)
        .subscribe((res) => {
          if (res.data.countOrdreLogistique)
            this.responsibleList.filter(r => r.id === "transpApproche")[0].visible = true;
        });
    }
  }

  quitPopup() {
    this.hidePopup();
  }

}


