import { AfterViewInit, Component, Input, OnChanges, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-zoom-article-popup",
  templateUrl: "./zoom-article-popup.component.html",
  styleUrls: ["./zoom-article-popup.component.scss"]
})

export class ZoomArticlePopupComponent implements AfterViewInit, OnChanges {

  @Input() public articleLigneId: string;

  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  visible: boolean;
  title: string;

  constructor(
    private localizeService: LocalizationService
  ) { }

  ngAfterViewInit() {
  }

  ngOnChanges() {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.setTitle();
  }

  setTitle() {
    this.title = this.localizeService.localize("zoom-article")
      + " "
      + this.articleLigneId;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("zoom-article-popup");
  }

}


