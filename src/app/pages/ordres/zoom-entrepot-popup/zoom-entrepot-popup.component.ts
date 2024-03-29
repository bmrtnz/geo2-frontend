import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-zoom-entrepot-popup",
  templateUrl: "./zoom-entrepot-popup.component.html",
  styleUrls: ["./zoom-entrepot-popup.component.scss"],
})
export class ZoomEntrepotPopupComponent implements OnChanges {
  @Input() public entrepotId: string;
  @Input() public entrepotCode: string;
  @Input() public entrepotTitle: string;

  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  public visible: boolean;
  public title: string;
  public popupFullscreen: boolean;

  constructor(private localizeService: LocalizationService) { }

  ngOnChanges() {
    if (!this.entrepotId) return;
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.setTitle();
  }

  setTitle() {
    this.title =
      this.localizeService.localize(
        "zoom-" + (this.entrepotTitle ?? "entrepot")
      ) +
      " " +
      this.entrepotCode;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("zoom-entrepot-popup", "zoom-popup");
  }

  hidePopup() {
    this.popup.visible = false;
  }
}
