import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxButtonComponent, DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { from } from "rxjs";
import { concatMap, takeWhile } from "rxjs/operators";
import { GridLignesHistoriqueComponent } from "../grid-lignes-historique/grid-lignes-historique.component";


@Component({
  selector: "app-ajout-articles-histo-popup",
  templateUrl: "./ajout-articles-histo-popup.component.html",
  styleUrls: ["./ajout-articles-histo-popup.component.scss"]
})

export class AjoutArticlesHistoPopupComponent implements OnChanges {

  @Input() public ordre: Ordre;
  @Output() public lignesChanged = new EventEmitter();
  @Output() public clientId: string;
  @Output() public entrepotId: string;
  @Output() public secteurId: string;
  @Output() public popupShown: boolean;

  visible: boolean;
  validBtnText: string;
  nbARticles: number;
  nbArticlesOld: number;
  chosenArticles: string[];
  ordreInfo = "";
  titleStart: string;
  titleMid: string;
  titleEnd: string;
  pulseBtnOn: boolean;

  @ViewChild(GridLignesHistoriqueComponent, { static: false }) gridLignesHisto: GridLignesHistoriqueComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild("addButton", { static: false }) addButton: DxButtonComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  constructor(
    private functionsService: FunctionsService,
    private currentCompanyService: CurrentCompanyService,
    private localizeService: LocalizationService
  ) {
  }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("ajout-articles");
    if (this.ordre) {
      this.titleMid = "n° " + this.ordre.campagne.id + "-" + this.ordre.numero + " - " + this.ordre.client.raisonSocial;
      this.clientId = this.ordre.client.id;
      this.entrepotId = this.ordre.entrepot.id;
      this.secteurId = this.ordre.secteurCommercial.id;
    }
    this.titleEnd = this.localizeService.localize("via-histo-client");
  }

  updateChosenArticles() {
    const selectedRows = this.getGridSelectedArticles();
    this.chosenArticles = [];
    this.chosenArticles = selectedRows.map(row => row.article.id);
    this.nbARticles = this.chosenArticles.length;
    this.validBtnText = this.localizeService.localize("btn-valider-article" + (this.nbARticles > 1 ? "s" : ""))
      .replace("&&", this.nbARticles.toString());
    if (this.nbARticles !== this.nbArticlesOld) {
      this.pulseBtnOn = false;
      setTimeout(() => this.pulseBtnOn = true, 1);
    }
    this.nbArticlesOld = this.nbARticles;
    if (this.nbARticles) this.addButton.instance.option("hint", this.chosenArticles.join(" - "));
  }

  getGridSelectedArticles() {
    return this.gridLignesHisto.datagrid.instance.getSelectedRowsData();
  }

  selectFromGrid(e) {
    this.updateChosenArticles();
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("ajout-articles-histo-popup");
    this.popupShown = true;
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
  }

  clearAll() {
    this.gridLignesHisto.datagrid.dataSource = null;
    this.updateChosenArticles();
  }

  hidePopup() {
    this.popup.visible = false;
    this.popupShown = false;
  }

  clearAndHidePopup() {

    this.hidePopup();
    this.lignesChanged.emit(this.nbARticles);
    this.clearAll();
  }

  insertArticles() {
    const info = this.localizeService.localize("ajout-article" + (this.nbARticles > 1 ? "s" : "")) + "...";
    notify(info, "info", 3000);
    from(this.chosenArticles)
      .pipe(
        concatMap(articleID => this.functionsService
          .ofInitArticleHistory(
            this.ordre.id,
            articleID,
            this.currentCompanyService.getCompany().id,
            this.gridLignesHisto.datagrid.instance.getSelectedRowKeys()[0]
          )
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


