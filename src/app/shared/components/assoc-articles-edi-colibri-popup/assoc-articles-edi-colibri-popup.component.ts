import { Component, NgModule } from "@angular/core";
import { DxPopupModule } from "devextreme-angular";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared.module";
import { ArticlesModule } from "app/pages/articles/articles.module";

@Component({
  selector: "app-assoc-articles-edi-colibri-popup",
  templateUrl: "./assoc-articles-edi-colibri-popup.component.html",
  styleUrls: ["./assoc-articles-edi-colibri-popup.component.scss"],
})
export class AssocArticlesEdiColibriPopupComponent {

  constructor() { }

  public visible: boolean;

  onShowing(e) {
    e.component.content().parentNode.classList.add("assoc-articles-edi-colibri-popup");
  }
}

@NgModule({
  declarations: [AssocArticlesEdiColibriPopupComponent],
  exports: [AssocArticlesEdiColibriPopupComponent],
  imports: [
    CommonModule,
    DxPopupModule,
    SharedModule,
    ArticlesModule
  ],
})
export class AssocArticlesEdiColibriPopupModule { }
