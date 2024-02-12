import { Component, NgModule, Output, ViewChild } from "@angular/core";
import { DxButtonModule, DxPopupComponent, DxPopupModule, DxSelectBoxComponent, DxTextBoxModule, DxValidatorModule } from "devextreme-angular";
import { ArticlesService, LocalizationService } from "app/shared/services";
import { SharedModule } from "app/shared/shared.module";
import { ZoomArticlePopupComponent } from "app/pages/ordres/zoom-article-popup/zoom-article-popup.component";
import { OrdresModule } from "app/pages/ordres/ordres.module";
import notify from "devextreme/ui/notify";
import { TopRightPopupButtonsModule } from "app/shared/components/top-right-popup-buttons/top-right-popup-buttons.component";

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
  public running: boolean;
  public notValid: string[];


  onHidden() {
    this.codeArtBWBox.instance.reset();
    this.visible = false;
  }

  onShowing(e) {
    this.notValid = [];
    e.component
      .content()
      .parentNode.classList.add("choose-article-zoom-popup");
  }

  closePopup() {
    this.visible = false;
  }

  onShown() {
    this.running = false;
    this.codeArtBWBox.instance.focus();
  }

  wrongValue() {
    return this.notValid?.includes(("000000" + this.codeArtBWBox?.value).slice(-6)) ||
      !new RegExp("^[0-9]{1,6}$").test(this.codeArtBWBox?.value);
  }

  accessArticle() {
    if (!this.codeArtBWBox.value) return;
    let myValue = this.codeArtBWBox.value;

    this.running = true;
    myValue = ("000000" + myValue).slice(-6);
    this.articlesService.getOne_v2(myValue, ["id", "valide"]).subscribe((res) => {
      this.running = false;
      const myArt = res?.data?.article;
      if (!myArt) {
        this.notValid.push(myValue);
        return notify(this.localizeService.localize("warn-unknown-article", myValue), "error", 3000);
      }
      this.articleId = myValue;
      this.zoomPopup.visible = true;
      this.visible = false;
    });
  }
}

@NgModule({
  imports: [
    DxPopupModule,
    DxTextBoxModule,
    DxButtonModule,
    DxValidatorModule,
    SharedModule,
    OrdresModule,
    TopRightPopupButtonsModule,
  ],
  declarations: [ChooseArticleZoomPopupComponent],
  exports: [ChooseArticleZoomPopupComponent],
})
export class ChooseArticleZoomPopupModule { }
