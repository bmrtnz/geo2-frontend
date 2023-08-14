import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { Article } from "app/shared/models";
import { AuthService, LocalizationService } from "app/shared/services";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  DxPopupComponent,
  DxScrollViewComponent,
  DxSelectBoxComponent,
  DxDateBoxComponent,
} from "devextreme-angular";
import { GridStatArticleClientsComponent } from "./grid-stat-article-clients/grid-stat-article-clients.component";
import { GridStatArticleFournisseursComponent } from "./grid-stat-article-fournisseurs/grid-stat-article-fournisseurs.component";

@Component({
  selector: 'app-statistiques-article-popup',
  templateUrl: './statistiques-article-popup.component.html',
  styleUrls: ['./statistiques-article-popup.component.scss']
})
export class StatistiquesArticlePopupComponent implements OnChanges {
  @Input() public article: Partial<Article>;

  @Output() public articleId: string;
  @Output() public dateMin: string;
  @Output() public dateMax: string;
  @Output() public refreshGrid = new EventEmitter();

  public visible: boolean;
  public title: string;
  public popupFullscreen = false;
  public detailedArticleDescription: string;
  private separator = " ● ";
  public periodes: any[];

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(GridStatArticleClientsComponent, { static: false }) gridClientComponent: GridStatArticleClientsComponent;
  @ViewChild(GridStatArticleFournisseursComponent, { static: false }) gridFournisseurComponent: GridStatArticleFournisseursComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("fromSB", { static: false }) fromSB: DxDateBoxComponent;
  @ViewChild("toSB", { static: false }) toSB: DxDateBoxComponent;

  constructor(
    private localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private authService: AuthService
  ) {
    this.periodes = this.dateManagementService.periods();
  }

  ngOnChanges() {
    this.setTitle();
    this.articleId = this.article?.id;
  }

  setTitle() {
    if (this.article) {
      this.getDetailedArticleDescription();
      this.title = this.localizeService.localize("article-stats");
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("statistiques-article-popup");
  }

  onShown() {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.setDefaultPeriod(this.authService.currentUser?.periode ?? "D1A");
    setTimeout(() => this.refreshGrids());
  }

  onHidden() {
    this.gridClientComponent?.clearDataSource();
    this.gridFournisseurComponent?.clearDataSource();
  }

  hidePopup() {
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  refreshGrids() {
    this.gridClientComponent?.enableFilters();
    this.gridFournisseurComponent?.enableFilters();
  }

  pushText(info) {
    this.detailedArticleDescription += info + this.separator;
  }

  sliceDesc() {
    return this.detailedArticleDescription.slice(0, -this.separator.length);
  }

  getDetailedArticleDescription() {
    const article = this.article;
    this.detailedArticleDescription = "";

    if (article.description) this.pushText(article.description);
    this.pushText(
      article.matierePremiere.variete.description +
      " " +
      article.matierePremiere.origine.description
    );
    if (article.cahierDesCharge.categorie?.description)
      this.pushText(article.cahierDesCharge.categorie.description);
    if (article.normalisation.calibreMarquage?.description)
      this.pushText(article.normalisation.calibreMarquage.description);
    if (article.cahierDesCharge.coloration?.description)
      this.pushText(article.cahierDesCharge.coloration.description);
    if (article.cahierDesCharge.sucre?.description)
      this.pushText(article.cahierDesCharge.sucre.description);
    if (article.cahierDesCharge.penetro?.description)
      this.pushText(article.cahierDesCharge.penetro.description);
    if (article.normalisation.stickeur?.description)
      this.pushText(article.normalisation.stickeur.description);
    if (article.cahierDesCharge.cirage?.description)
      this.pushText(article.cahierDesCharge.cirage.description);
    if (article.cahierDesCharge.rangement?.description)
      this.pushText(article.cahierDesCharge.rangement.description);
    if (article.emballage.emballage?.descriptionTechnique)
      this.pushText(article.emballage.emballage.descriptionTechnique);
    if (article.normalisation.etiquetteEvenementielle?.description)
      this.pushText(article.normalisation.etiquetteEvenementielle.description);
    if (article.normalisation.etiquetteColis?.description)
      this.pushText(article.normalisation.etiquetteColis.description);
    if (article.normalisation.etiquetteUc?.description)
      this.pushText(article.normalisation.etiquetteUc.description);
    if (article.emballage.conditionSpecial?.description)
      this.pushText(article.emballage.conditionSpecial.description);
    if (article.emballage.alveole?.description)
      this.pushText(article.emballage.alveole.description);
    if (article.normalisation.gtinUc)
      this.pushText("GTIN UC: " + article.normalisation.gtinUc);
    if (article.normalisation.gtinColis)
      this.pushText("GTIN Colis: " + article.normalisation.gtinColis);
    if (article.gtinUcBlueWhale && !article.normalisation.gtinUc)
      this.pushText("GTIN UC BW: " + article.gtinUcBlueWhale);
    if (article.gtinColisBlueWhale && !article.normalisation.gtinColis)
      this.pushText("GTIN Colis BW: " + article.gtinColisBlueWhale);
    if (article.normalisation.produitMdd) this.pushText("MDD");
    if (article.normalisation.articleClient)
      this.pushText("Art. Clt: " + article.normalisation.articleClient);
    if (article.instructionStation)
      this.pushText("Instructions: " + article.instructionStation);
    if (article.emballage.emballage?.idSymbolique)
      this.pushText(article.emballage.emballage.idSymbolique);

    this.detailedArticleDescription = this.sliceDesc();
  }

  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.fromSB.value);
    const fin = new Date(this.toSB.value)
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains("dateStart")) {
        this.toSB.value = this.dateManagementService.formatDate(deb);
      } else {
        this.fromSB.value = this.dateManagementService.formatDate(fin);
      }
    }
    this.periodeSB.value = null;
  }

  setDates(e) {
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;
    const datePeriod = this.dateManagementService.getDates(e);

    this.fromSB.value = this.dateManagementService.formatDate(datePeriod.dateDebut);
    this.toSB.value = this.dateManagementService.formatDate(datePeriod.dateFin);
  }

  setDefaultPeriod(periodId) {
    let myPeriod = this.dateManagementService.getPeriodFromId(
      periodId,
      this.periodes
    );
    if (!myPeriod) return;
    this.periodeSB.instance.option("value", myPeriod);
    const datePeriod = this.dateManagementService.getDates({
      value: myPeriod,
    });
    this.fromSB.value = this.dateManagementService.formatDate(datePeriod.dateDebut);
    this.toSB.value = this.dateManagementService.formatDate(datePeriod.dateFin);
  }

}

