
import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent } from "devextreme-angular";

@Component({
  selector: "app-annule-remplace-popup",
  templateUrl: "./annule-remplace-popup.component.html",
  styleUrls: ["./annule-remplace-popup.component.scss"]
})
export class AnnuleRemplacePopupComponent implements OnChanges {

  @Input() public ordre: Ordre;

  visible: boolean;
  title: string;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  constructor(
    public localizeService: LocalizationService
  ) { }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    this.title = this.localizeService.localize("annule-et-remplace");
  }
  hidePopup() {
    this.popup.visible = false;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("annule-remplace-popup");
  }

  clearAndHidePopup() {
    this.hidePopup();
  }

  goDocuments() {
  }

}

