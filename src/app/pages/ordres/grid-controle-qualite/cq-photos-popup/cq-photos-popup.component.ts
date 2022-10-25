import { Component, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-cq-photos-popup",
  templateUrl: "./cq-photos-popup.component.html",
  styleUrls: ["./cq-photos-popup.component.scss"]
})
export class CqPhotosPopupComponent implements OnChanges {

  @Input() public ordreLigne;
  @Output() public ordreLigneId: string;
  @Input() public readOnlyMode: boolean;
  @Output() public clientInfo: any;

  visible: boolean;
  titleStart: string;
  titleMid: string;
  titleEnd: string;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  constructor(
    private localization: LocalizationService,
  ) {
  }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    if (this.ordreLigne) {
      this.titleStart = this.localization.localize("controle-qualité-popup-title");
      this.titleMid = this.ordreLigne.ordre.numero;
      this.titleEnd = this.ordreLigne.id;
      this.ordreLigneId = this.ordreLigne.id;
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("encours-client-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
  }

  hidePopup() {
    this.popup.visible = false;
  }

}


