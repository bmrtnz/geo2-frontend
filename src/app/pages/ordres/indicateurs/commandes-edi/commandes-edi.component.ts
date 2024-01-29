import { Component, ViewChild } from "@angular/core";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-commandes-edi",
  templateUrl: "./commandes-edi.component.html",
  styleUrls: ["./commandes-edi.component.scss"],
})
export class CommandesEdiComponent {
  public visible: boolean;
  public popupFullscreen = false;
  public loadingRecap;

  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  constructor() { }

  onShowing(e) {
    e.component.content().parentNode.classList.add("commandes-edi-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
  }

  onHidden() {
    this.loadingRecap = false;
  }

  hidePopup() {
    this.popup.visible = false;
  }

  showHideLoader(e) {
    this.loadingRecap = e;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  capitalize(data) {
    return data?.description
      ? data.description.charAt(0).toUpperCase() +
      data.description.slice(1).toLowerCase()
      : null;
  }
}

export default CommandesEdiComponent;
