// tslint:disable-next-line: max-line-length
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, Pipe, PipeTransform, SimpleChanges, ViewChild } from "@angular/core";
import LigneReservation from "app/shared/models/ligne-reservation.model";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import { LocalizationService } from "app/shared/services";
import { CalibresFournisseurService } from "app/shared/services/api/calibres-fournisseur.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";
import { concatMap, finalize, map } from "rxjs/operators";
import { GridReservationStockEnCoursComponent } from "../grid-reservation-stock-en-cours/grid-reservation-stock-en-cours.component";
import { GridReservationStockComponent, Reservation } from "../grid-reservation-stock/grid-reservation-stock.component";
import { GridsService } from "../grids.service";

@Component({
  selector: "app-article-reservation-ordre-popup",
  templateUrl: "./article-reservation-ordre-popup.component.html",
  styleUrls: ["./article-reservation-ordre-popup.component.scss"]
})
export class ArticleReservationOrdrePopupComponent implements OnChanges {

  @Input() public ordreLigne: OrdreLigne;
  @Output() public ordreLigneInfo: OrdreLigne;
  @Output() public whenApplied = new EventEmitter();

  visible: boolean;
  titleStart: string;
  titleMid: string;
  titleEnd: string;
  logs: Array<string> = [];
  detailedArticleDescription: string;
  separator = " ● ";
  quantiteAReserver: number;
  resaStatus: LigneReservation[];
  public okDisabled = false;
  public popupFullscreen = false;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  @ViewChild(GridReservationStockComponent) gridResa: GridReservationStockComponent;
  @ViewChild(GridReservationStockEnCoursComponent) gridResaEnCours: GridReservationStockEnCoursComponent;

  constructor(
    private calibresFournisseurService: CalibresFournisseurService,
    private localizeService: LocalizationService,
    private cd: ChangeDetectorRef,
    private ordreLignesService: OrdreLignesService,
    private currentCompanyService: CurrentCompanyService,
    private grids: GridsService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ordreLigne.currentValue !== undefined) {
      this.quantiteAReserver = changes.ordreLigne.currentValue.nombreColisCommandes;
      this.logQuantity();
    }

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
    this.clearAll();
    this.okDisabled = false;
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.gridResaEnCours.reloadSource(this.ordreLigne.id);
    // this.gridResa.reloadSource(this.ordreLigne.article.id);
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  clearAll() {
    this.logs = [];
    if (this.gridResa) this.gridResa.clearDataSource();
    if (this.gridResaEnCours) this.gridResaEnCours.clearDataSource();
  }

  pushLog(log: string) {
    this.logs = [...this.logs, log];
  }

  applyClick() {
    // On ferme en renvoyant le fournisseur courant et le nbre de réservation
    this.okDisabled = true;
    this.updateNombreResa().subscribe(() => this.popup.visible = false);
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

  onReservationChange([nombreReservations, quantiteDisponible, fournisseur]: Reservation) {
    if (nombreReservations === 0)
      this.pushLog(`ERREUR : Aucun déstockage effectué sur ${fournisseur}`);
    else
      this.pushLog(`${nombreReservations} déstockage(s) effectué(s) sur ${fournisseur}`);
    this.gridResaEnCours.reloadSource(this.ordreLigne.id);
    this.cd.detectChanges();
  }

  onReservationEnCoursChange(status: LigneReservation[]) {
    this.logQuantity();
    this.gridResa.reloadSource(this.ordreLigne.article.id);
    this.resaStatus = status;
    if (this.resaStatus.length) this.logOK();
    this.cd.detectChanges();
  }

  private logOK() {
    // Clearing logs
    if (this.logs.length > 1) {
      if (this.logs[this.logs.length - 2].indexOf("Quantité à déstocker") === 0) {
        this.logs.splice(this.logs.length - 2);
      }
    }
    this.pushLog(`Tout est OK, rien a modifier`);
  }

  private logQuantity() {
    this.pushLog(`Quantité à déstocker = ${this.quantiteAReserver}`);
  }

  private updateNombreResa() {
    return this.ordreLignesService.fGetInfoResa(this.ordreLigneInfo.id)
      .pipe(
        map(res => {
          const qteDispo = res.data.fGetInfoResa.data.ll_tot_qte_ini - res.data.fGetInfoResa.data.ll_tot_qte_res;
          const newNbResa = res.data.fGetInfoResa.data.ll_tot_nb_resa;
          if (newNbResa === 0) return 0; // pas de stock réservé
          if (qteDispo < 0) return -1; // dépassement de stock
          if (newNbResa) return 1; // stock réservé ok
          return null;
        }),
        concatMap(indicateurResa => this.ordreLignesService.updateField(
          "nombreReservationsSurStock",
          indicateurResa,
          this.ordreLigneInfo.id,
          this.currentCompanyService.getCompany().id,
          ["id", "nombreReservationsSurStock"],
        )),
        finalize(() => {
          this.whenApplied.emit();
          this.grids.reload("SyntheseExpeditions", "DetailExpeditions");
        }
        )
      );
  }

}

@Pipe({ name: "list" })
export class ListPipe implements PipeTransform {

  transform(value: string[]): string {
    return value
      .filter((line, index, self) => self[index - 1] !== line)
      .join("\r\n");
  }

}
