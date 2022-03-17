import { AfterViewInit, Component, Input, OnChanges } from "@angular/core";
import { LocalizationService } from "app/shared/services";

@Component({
  selector: "app-zoom-article-popup",
  templateUrl: "./zoom-article-popup.component.html",
  styleUrls: ["./zoom-article-popup.component.scss"]
})

export class ZoomArticlePopupComponent implements AfterViewInit, OnChanges {

  @Input() public articleLigneId: string;

  visible: boolean;
  title: string;

  constructor(
    private localizeService: LocalizationService
  ) { }

  ngAfterViewInit() {
  }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    this.title = this.localizeService.localize("zoom-article") + this.articleLigneId;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("zoom-article-popup");
  }

}


