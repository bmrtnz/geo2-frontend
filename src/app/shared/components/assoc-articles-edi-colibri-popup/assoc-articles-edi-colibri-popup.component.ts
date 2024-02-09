import { Component, NgModule, ViewChild } from "@angular/core";
import { DxPopupComponent, DxPopupModule } from "devextreme-angular";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared.module";
import { ArticlesModule } from "app/pages/articles/articles.module";
import { TopRightPopupButtonsComponent, TopRightPopupButtonsModule } from "../top-right-popup-buttons/top-right-popup-buttons.component";
import dxPopup from "devextreme/ui/popup";

@Component({
  selector: "app-assoc-articles-edi-colibri-popup",
  templateUrl: "./assoc-articles-edi-colibri-popup.component.html",
  styleUrls: ["./assoc-articles-edi-colibri-popup.component.scss"],
})
export class AssocArticlesEdiColibriPopupComponent {

  constructor() { }

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(TopRightPopupButtonsComponent, { static: false }) topRightButtons: TopRightPopupButtonsComponent;

  public visible: boolean;
  public dxpopup;

  onShowing(e) {
    this.dxpopup = e.component;
    this.dxpopup.content().parentNode.classList.add("assoc-articles-edi-colibri-popup");
    this.dxpopup.content().parentNode.classList.add("heightControl");
  }

  hidePopup() {
    this.popup.visible = false;
  }

  changeSize(minimized) {
    if (minimized) {
      this.dxpopup.content().parentNode.classList.remove("heightControl");
    } else {
      this.dxpopup.content().parentNode.classList.add("heightControl");
    }
  }

}

@NgModule({
  declarations: [AssocArticlesEdiColibriPopupComponent],
  exports: [AssocArticlesEdiColibriPopupComponent],
  imports: [
    CommonModule,
    DxPopupModule,
    SharedModule,
    ArticlesModule,
    TopRightPopupButtonsModule
  ],
})
export class AssocArticlesEdiColibriPopupModule { }
