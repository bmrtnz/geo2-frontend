import { Component, NgModule, Output, ViewChild } from "@angular/core";
import { DxButtonModule, DxPopupComponent, DxPopupModule, DxSelectBoxComponent, DxTextBoxModule, DxValidatorModule } from "devextreme-angular";
import { ArticlesService, LocalizationService } from "app/shared/services";
import { SharedModule } from "app/shared/shared.module";
import { ZoomArticlePopupComponent } from "app/pages/ordres/zoom-article-popup/zoom-article-popup.component";
import { OrdresModule } from "app/pages/ordres/ordres.module";
import notify from "devextreme/ui/notify";

@Component({
  selector: 'app-choose-article-zoom-popup',
  templateUrl: './choose-article-zoom-popup.component.html',
  styleUrls: ['./choose-article-zoom-popup.component.scss']
})
export class ChooseArticleZoomPopupComponent {
  constructor(
    private articlesService: ArticlesService,
    private localizeService: LocalizationService
  ) { }

  @Output() articleId: string;

  @ViewChild(DxPopupComponent, { static: false }) popupComponent: DxPopupComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false }) zoomPopup: ZoomArticlePopupComponent;

  @ViewChild("codeArtBWBox", { static: false }) codeArtBWBox: DxSelectBoxComponent;

  public title: string;
  public visible: boolean;


  onHidden() {
    this.codeArtBWBox.instance.reset();
    this.visible = false;
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("choose-article-zoom-popup");
  }

  onShown() {
    this.codeArtBWBox.instance.focus();
  }

  accessArticle() {
    if (!this.codeArtBWBox.value) return;
    let myValue = this.codeArtBWBox.value;
    if (myValue.length > 6) {
      notify(this.localizeService.localize("warn-article-type", myValue), "error", 3000);
    } else {
      myValue = ("000000" + myValue).slice(-6);
      this.articlesService.getOne_v2(myValue, ["id", "valide"]).subscribe((res) => {
        const myArt = res?.data?.article;
        if (!myArt) return notify(this.localizeService.localize("warn-unknown-article", myValue), "error", 3000);
        this.articleId = myValue;
        this.zoomPopup.visible = true;
        this.visible = false;
      });
    }
  }
}

@NgModule({
  imports: [DxPopupModule, DxTextBoxModule, DxButtonModule, DxValidatorModule, SharedModule, OrdresModule],
  declarations: [ChooseArticleZoomPopupComponent],
  exports: [ChooseArticleZoomPopupComponent],
})
export class ChooseArticleZoomPopupModule { }
