import { Component, NgModule, OnInit, Output, ViewChild } from "@angular/core";
import { DxButtonModule, DxPopupComponent, DxPopupModule, DxSelectBoxComponent, DxSelectBoxModule, DxValidatorModule } from "devextreme-angular";
import { ArticlesService } from "app/shared/services";
import DataSource from "devextreme/data/data_source";
import { SharedModule } from "app/shared/shared.module";
import { ZoomArticlePopupComponent } from "app/pages/ordres/zoom-article-popup/zoom-article-popup.component";
import { OrdresModule } from "app/pages/ordres/ordres.module";

@Component({
  selector: 'app-choose-article-zoom-popup',
  templateUrl: './choose-article-zoom-popup.component.html',
  styleUrls: ['./choose-article-zoom-popup.component.scss']
})
export class ChooseArticleZoomPopupComponent implements OnInit {
  constructor(
    private articlesService: ArticlesService
  ) { }

  @Output() articleId: string;

  @ViewChild(DxPopupComponent, { static: false }) popupComponent: DxPopupComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false }) zoomPopup: ZoomArticlePopupComponent;

  @ViewChild("codeArtBWBox", { static: false }) codeArtBWBox: DxSelectBoxComponent;

  public articlesDS: DataSource;
  public title: string;
  public visible: boolean;

  ngOnInit() {
    this.articlesDS = this.articlesService.getDataSource_v2(["id"], "cache-first", "id");
    this.articlesDS.filter(["valide", "=", true]);
  }

  onHidden() {
    this.codeArtBWBox.instance.reset();
    this.visible = false;
  }

  onShown(e) {
    this.codeArtBWBox.instance.focus();
    e.component
      .content()
      .parentNode.classList.add("choose-article-zoom-popup");
  }

  accessArticle() {
    if (!this.codeArtBWBox.value?.id) return;
    this.articleId = this.codeArtBWBox.value.id;
    this.zoomPopup.visible = true;
    this.visible = false;
  }
}

@NgModule({
  imports: [DxPopupModule, DxSelectBoxModule, DxButtonModule, DxValidatorModule, SharedModule, OrdresModule],
  declarations: [ChooseArticleZoomPopupComponent],
  exports: [ChooseArticleZoomPopupComponent],
})
export class ChooseArticleZoomPopupModule { }
