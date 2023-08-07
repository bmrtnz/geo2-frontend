import { AfterViewInit, Component, Input, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-zoom-fournisseur-popup",
  templateUrl: "./zoom-fournisseur-popup.component.html",
  styleUrls: ["./zoom-fournisseur-popup.component.scss"],
})
export class ZoomFournisseurPopupComponent {
  @Input() public fournisseurLigneId: string;
  @Input() public fournisseurCode: string;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  public visible: boolean;
  public title: string;
  public popupFullscreen: boolean;

  constructor(private localizeService: LocalizationService) { }

  setTitle(fournisseur) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.title =
      this.localizeService.localize("zoom-fournisseur") + " " + fournisseur;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("zoom-fournisseur-popup");
  }

  hidePopup() {
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

}
