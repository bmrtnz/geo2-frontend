import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { ArticlesListComponent } from "app/pages/articles/list/articles-list.component";
import Ordre from "app/shared/models/ordre.model";
import { ArticlesService, LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { DxButtonComponent, DxPopupComponent, DxTagBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { from } from "rxjs";
import { concatMap, takeWhile } from "rxjs/operators";

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

  constructor(
    private articlesService: ArticlesService,
    private gridConfiguratorService: GridConfiguratorService,
    private functionsService: FunctionsService,
    private currentCompanyService: CurrentCompanyService,
    private localizeService: LocalizationService
  ) { }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("ajout-article");
    if (this.ordre) {
      this.titleMid = "n° " + this.ordre.campagne.id + "-" + this.ordre.numero + " - " + this.ordre.client.raisonSocial;
    }
    this.titleEnd = this.localizeService.localize("via-stock");
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("ajout-articles-stock-popup");
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

  insertArticles() {
    notify(this.localizeService.localize("ajout-article"), "info", 3000);
    from(this.chosenArticles)
      .pipe(
        concatMap(articleID => this.functionsService
          .ofInitArticle(this.ordre.id, articleID, this.currentCompanyService.getCompany().id)
          .valueChanges
          .pipe(takeWhile(res => res.loading))
        ),
      )
      .subscribe({
        error: ({ message }: Error) => notify(message, "error"),
        complete: () => this.clearAndHidePopup(),
      });

  }

}


