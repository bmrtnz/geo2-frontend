import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-zoom-article-popup",
  templateUrl: "./zoom-article-popup.component.html",
  styleUrls: ["./zoom-article-popup.component.scss"],
})
export class ZoomArticlePopupComponent implements OnChanges {
  @Input() public articleLigneId: string;

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
      this.localizeService.localize("zoom-article") + " " + this.articleLigneId;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("zoom-article-popup", "zoom-popup");
  }

  hidePopup() {
    this.popup.visible = false;
  }

}
