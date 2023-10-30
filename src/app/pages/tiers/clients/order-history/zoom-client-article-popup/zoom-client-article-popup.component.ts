import {
  Component,
  Input,
  OnChanges,
  ViewChild,
} from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-zoom-client-article-popup",
  templateUrl: "./zoom-client-article-popup.component.html",
  styleUrls: ["./zoom-client-article-popup.component.scss"],
})
export class ZoomClientArticlePopupComponent implements OnChanges {
  @Input() public articleLigneId: string;

  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  public popupFullscreen: boolean;
  public visible: boolean;
  public title: string;

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
    e.component.content().parentNode.classList.add("zoom-client-article-popup", "zoom-popup");
  }

  hidePopup() {
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

}
