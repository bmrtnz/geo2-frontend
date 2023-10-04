import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-zoom-lieupassageaquai-popup",
  templateUrl: "./zoom-lieupassageaquai-popup.component.html",
  styleUrls: ["./zoom-lieupassageaquai-popup.component.scss"],
})
export class ZoomLieupassageaquaiPopupComponent implements OnChanges {
  @Input() public lieupassageaquaiLigneId: string;
  @Input() public lieupassageaquaiTitle: string;

  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  public visible: boolean;
  public title: string;
  public popupFullscreen: boolean;

  constructor(private localizeService: LocalizationService) { }

  ngOnChanges() {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.setTitle();
  }

  setTitle() {
    this.title =
      this.localizeService.localize(
        "zoom-" + (this.lieupassageaquaiTitle ?? "transporteur")
      ) +
      " " +
      this.lieupassageaquaiLigneId;
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("zoom-lieupassageaquai-popup");
  }

  hidePopup() {
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

}
