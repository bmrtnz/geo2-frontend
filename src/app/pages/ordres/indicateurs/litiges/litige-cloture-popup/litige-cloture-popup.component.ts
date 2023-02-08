import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxListComponent, DxPopupComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";


@Component({
  selector: "app-litige-cloture-popup",
  templateUrl: "./litige-cloture-popup.component.html",
  styleUrls: ["./litige-cloture-popup.component.scss"]
})
export class LitigeCloturePopupComponent implements OnInit, OnChanges {

  @Input() public infosLitige: any;

  visible: boolean;
  titleStart: string;
  titleEnd: string;
  tiersList: any[];
  enableCloture: boolean;
  oneIsCloture: boolean;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxListComponent, { static: false }) list: DxListComponent;

  constructor(
    private localizeService: LocalizationService
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.infosLitige) {
      this.setTitle();
      this.oneIsCloture = this.infosLitige.clientClos || this.infosLitige.fournisseurClos;
    }
  }

  resetList() {
    this.tiersList = [
      {
        text: "Client",
        disabled: this.infosLitige.clientClos,
        value: this.oneIsCloture
      },
      {
        text: "Responsable",
        disabled: this.infosLitige.fournisseurClos,
        value: this.oneIsCloture
      },
      {
        text: "Client ET Responsable",
        disabled: this.oneIsCloture
      }
    ];
    this.list.selectedItemKeys = [];
    this.tiersList.map(tiers => {
      if (tiers.value) this.list.selectedItemKeys.push(tiers);
    });
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("title-cloture-popup");
    this.titleEnd = "réf. " + this.infosLitige.litige.id;
  }

  changeTiers(e) {
    this.enableCloture = !!this.list.selectedItemKeys?.length || this.oneIsCloture;
    // Do not allow multiple selection when no cloture yet
    if (this.list.selectedItems.length && !this.oneIsCloture) this.list.selectedItemKeys.shift();
  }

  onShowing(e) {
    this.resetList();
    e.component.content().parentNode.classList.add("litige-cloture-popup");
  }

  validateCloture() {
    /////////////////////////////////
    // Cloture function
    /////////////////////////////////
  }

  hidePopup() {
    this.enableCloture = false;
    this.popup.visible = false;
  }

}



