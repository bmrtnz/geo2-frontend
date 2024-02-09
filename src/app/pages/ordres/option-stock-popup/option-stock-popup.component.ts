import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import { Article } from "app/shared/models";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";
import { GridOptionReservationStockComponent } from "./grid-option-reservation-stock/grid-option-reservation-stock.component";

@Component({
  selector: "app-option-stock-popup",
  templateUrl: "./option-stock-popup.component.html",
  styleUrls: ["./option-stock-popup.component.scss"],
})
export class OptionStockPopupComponent implements OnChanges {
  @Input() public article: Partial<Article>;
  @Input() public ligneStockArticle: any;
  @Output() public ligneStock: any;
  @Output() public whenApplied = new EventEmitter();

  public visible: boolean;
  public title: string;
  public okDisabled = false;
  public popupFullscreen = false;
  public detailedArticleDescription: string;
  private separator = " ● ";

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;
  @ViewChild(GridOptionReservationStockComponent)
  gridResa: GridOptionReservationStockComponent;

  constructor(private localizeService: LocalizationService) { }

  ngOnChanges() {
    this.setTitle();
    this.ligneStock = this.ligneStockArticle;
  }

  setTitle() {
    this.title = this.localizeService.localize("title-option-stock-popup");
    if (this.article) {
      this.getDetailedArticleDescription();
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("option-stock-popup");
  }

  onShown(e) {
    this.okDisabled = false;
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    if (this.gridResa) {
      this.gridResa.initFields();
      this.gridResa.reloadSource(this.article.id);
    }
  }

  hidePopup() {
    this.gridResa.datagrid.dataSource = null;
    this.popup.visible = false;
  }

  reservationChange() {
    this.whenApplied.emit();
    this.hidePopup();
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
}
