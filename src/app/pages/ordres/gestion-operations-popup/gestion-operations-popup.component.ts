import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { LitigeCausesService } from "app/shared/services/api/litige-causes.service";
import { LitigeConsequencesService } from "app/shared/services/api/litige-consequences.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { DxListComponent, DxPopupComponent, DxRadioGroupComponent } from "devextreme-angular";
import { GridsService } from "../grids.service";

@Component({
  selector: "app-gestion-operations-popup",
  templateUrl: "./gestion-operations-popup.component.html",
  styleUrls: ["./gestion-operations-popup.component.scss"]
})
export class GestionOperationsPopupComponent implements OnChanges {

  @Input() public ordre: Partial<Ordre>;
  @Input() public infosLitige: any;

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

  constructor(
    private localizeService: LocalizationService,
    public causesService: LitigeCausesService,
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
        typeTiers: "R",
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
        if (this.selectedResponsible !== "transporteur")
          this.consequenceItems.filter(c => c.id === "G")[0].visible = false;

      });
  }

  changeResponsible(e) {
    this.selectedResponsible = e.value?.id;
    this.updateCauseConseq(e.value.typeTiers);
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
    }
  }

  quitPopup() {
    this.hidePopup();
  }

}


