import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { ArticlesListComponent } from "app/pages/articles/list/articles-list.component";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { DxButtonComponent, DxPopupComponent, DxScrollViewComponent, DxTagBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";

@Component({
  selector: "app-article-reservation-ordre-popup",
  templateUrl: "./article-reservation-ordre-popup.component.html",
  styleUrls: ["./article-reservation-ordre-popup.component.scss"]
})
export class ArticleReservationOrdrePopupComponent implements OnChanges {

  @Input() public ordreLigne: OrdreLigne;
  @Output() public changeLigne = new EventEmitter<Partial<OrdreLigne>>();

  visible: boolean;
  idArticlesDS: DataSource;
  codeChangeProcess: boolean;
  articlesKO = true;
  validBtnText: string;
  nbARticles: number;
  nbArticlesOld: number;
  chosenArticles: string[];
  titleStart: string;
  titleMid: string;
  titleEnd: string;
  pulseBtnOn: boolean;

  @ViewChild(ArticlesListComponent, { static: false }) catalogue: ArticlesListComponent;
  @ViewChild(DxTagBoxComponent, { static: false }) saisieCode: DxTagBoxComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild("addButton", { static: false }) addButton: DxButtonComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  constructor(
    private localizeService: LocalizationService
  ) { }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    console.log(this.ordreLigne);
    this.titleStart = this.localizeService.localize("title-start-article-reservation-ordre-popup");
    if (this.ordreLigne) {
      this.titleMid = "n° " + this.ordreLigne.ordre.numero + " / " + this.ordreLigne.ordre.entrepot.code;
      this.titleEnd = this.localizeService.localize("title-end-article-reservation-ordre-popup")
        .replace("&A", this.ordreLigne.article.id.toString())
        .replace("&C", this.ordreLigne.nombreColisCommandes.toString());
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("article-reservation-ordre-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
  }

  clearAll() {

  }

  hidePopup() {
    this.popup.visible = false;
  }

  clearAndHidePopup() {
    this.hidePopup();
    this.changeLigne.emit();
    this.clearAll();
  }

}


