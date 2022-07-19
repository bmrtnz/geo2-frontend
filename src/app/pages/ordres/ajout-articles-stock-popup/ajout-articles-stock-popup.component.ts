import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { ArticlesListComponent } from "app/pages/articles/list/articles-list.component";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { DxButtonComponent, DxPopupComponent, DxScrollViewComponent, DxTagBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";

@Component({
  selector: "app-ajout-articles-stock-popup",
  templateUrl: "./ajout-articles-stock-popup.component.html",
  styleUrls: ["./ajout-articles-stock-popup.component.scss"]
})
export class AjoutArticlesStockPopupComponent implements OnChanges {

  @Input() public ordre: Ordre;
  @Input() public stock: boolean;
  @Output() public lignesChanged = new EventEmitter();

  visible: boolean;
  idArticlesDS: DataSource;
  codeChangeProcess: boolean;
  articlesKO = true;
  validBtnText: string;
  nbARticles: number;
  nbArticlesOld: number;
  chosenArticles: string[];
  ordreInfo = "";
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
    this.titleStart = this.localizeService.localize("ajout-article");
    if (this.ordre) {
      this.titleMid = "n° " + this.ordre.campagne.id + "-" + this.ordre.numero + " - "
        + this.ordre.client.code
        + "/" + this.ordre.entrepot.code;
    }
    this.titleEnd = this.localizeService.localize("via-stock");
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("ajout-articles-stock-popup");
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
    this.lignesChanged.emit(1);
    this.clearAll();
  }

}


