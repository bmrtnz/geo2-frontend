import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-article-reservation-ordre-popup",
  templateUrl: "./article-reservation-ordre-popup.component.html",
  styleUrls: ["./article-reservation-ordre-popup.component.scss"]
})
export class ArticleReservationOrdrePopupComponent implements OnChanges {

  @Input() public ordreLigne: OrdreLigne;
  @Output() public ordreLigneInfo: OrdreLigne;
  @Output() public changeLigne = new EventEmitter<Partial<OrdreLigne>>();

  visible: boolean;
  titleStart: string;
  titleMid: string;
  titleEnd: string;
  logText: string;
  detailedArticleDescription: string;
  separator = " ● ";

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  constructor(
    private localizeService: LocalizationService
  ) {
    this.logText = "tout est OK, rien à modifier\r\n";
    this.logText += "changement de fournisseur 3D/3D --> VERGERDANJOU/VERGERDANJOU demandé\r\n";
    this.logText += "1 réservation effectuée sur VERGERDANJOU/3D\r\n";
    this.logText += "tout est OK, rien à modifier";
  }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("title-start-article-reservation-ordre-popup");
    if (this.ordreLigne) {
      this.ordreLigneInfo = this.ordreLigne;
      this.titleMid = "n° " + this.ordreLigne.ordre.numero + " / " + this.ordreLigne.ordre.entrepot.code;
      this.titleEnd = this.localizeService.localize("title-end-article-reservation-ordre-popup")
        .replace("&A", this.ordreLigne.article.id.toString())
        .replace("&C", this.ordreLigne.nombreColisCommandes.toString());
      this.getDetailedArticleDescription();
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("article-reservation-ordre-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
  }

  clearAll() {
    this.logText = "";
  }

  hidePopup() {
    this.popup.visible = false;
  }

  clearAndHidePopup() {
    this.hidePopup();
    this.changeLigne.emit();
    this.clearAll();
  }

  applyClick() {
    // On ferme en renvoyant le fournisseur courant et le nbre de réservation

    this.clearAndHidePopup();
  }

  pushText(info) {
    this.detailedArticleDescription += info + this.separator;
  }

  sliceDesc() {
    return this.detailedArticleDescription.slice(0, -this.separator.length);
  }

  getDetailedArticleDescription() {

    const article = this.ordreLigne.article;
    this.detailedArticleDescription = "";
    if (article.description) this.pushText(article.description);
    this.pushText(article.matierePremiere.variete.description + " " + article.matierePremiere.origine.description);
    if (article.cahierDesCharge.categorie?.description) this.pushText(article.cahierDesCharge.categorie.description);
    if (article.normalisation.calibreMarquage?.description) this.pushText(article.normalisation.calibreMarquage.description);
    if (article.cahierDesCharge.coloration?.description) this.pushText(article.cahierDesCharge.coloration.description);
    if (article.cahierDesCharge.sucre?.description) this.pushText(article.cahierDesCharge.sucre.description);
    if (article.cahierDesCharge.penetro?.description) this.pushText(article.cahierDesCharge.penetro.description);
    if (article.normalisation.stickeur?.description) this.pushText(article.normalisation.stickeur.description);
    if (article.cahierDesCharge.cirage?.description) this.pushText(article.cahierDesCharge.cirage.description);
    if (article.cahierDesCharge.rangement?.description) this.pushText(article.cahierDesCharge.rangement.description);
    if (article.emballage.emballage?.descriptionTechnique) this.pushText(article.emballage.emballage.descriptionTechnique);
    if (article.normalisation.etiquetteEvenementielle?.description)
      this.pushText(article.normalisation.etiquetteEvenementielle.description);
    if (article.normalisation.etiquetteColis?.description) this.pushText(article.normalisation.etiquetteColis.description);
    if (article.normalisation.etiquetteUc?.description) this.pushText(article.normalisation.etiquetteUc.description);
    if (article.emballage.conditionSpecial?.description) this.pushText(article.emballage.conditionSpecial.description);
    if (article.emballage.alveole?.description) this.pushText(article.emballage.alveole.description);
    if (article.normalisation.gtinUc) this.pushText("GTIN UC: " + article.normalisation.gtinUc);
    if (article.normalisation.gtinColis) this.pushText("GTIN Colis: " + article.normalisation.gtinColis);
    if (article.gtinUcBlueWhale && !article.normalisation.gtinUc) this.pushText("GTIN UC BW: " + article.gtinUcBlueWhale);
    if (article.gtinColisBlueWhale && !article.normalisation.gtinColis) this.pushText("GTIN Colis BW: " + article.gtinColisBlueWhale);
    if (article.normalisation.produitMdd) this.pushText("MDD");
    if (article.normalisation.articleClient) this.pushText("Art. Clt: " + article.normalisation.articleClient);
    if (article.instructionStation) this.pushText("Instructions: " + article.instructionStation);
    if (article.emballage.emballage?.idSymbolique) this.pushText(article.emballage.emballage.idSymbolique);

    this.detailedArticleDescription = this.sliceDesc();

  }

}


