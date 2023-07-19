import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ArticlesService, FournisseursService } from "app/shared/services";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxNumberBoxComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";

@Component({
  selector: 'app-ajout-article-edi-colibri-popup',
  templateUrl: './ajout-article-edi-colibri-popup.component.html',
  styleUrls: ['./ajout-article-edi-colibri-popup.component.scss']
})
export class AjoutArticleEdiColibriPopupComponent {
  @Input() public ligneEdi: any;

  public visible: boolean;
  public proprietaireSource: DataSource;
  public fournisseurSource: DataSource;
  public articlesDS: DataSource;


  @ViewChild("codeArticleSB", { static: false }) codeArticleSB: DxSelectBoxComponent;
  @ViewChild("proprietaireSB", { static: false }) proprietaireSB: DxSelectBoxComponent;
  @ViewChild("fournisseurSB", { static: false }) fournisseurSB: DxSelectBoxComponent;
  @ViewChild("quantiteSB", { static: false }) quantiteSB: DxNumberBoxComponent;

  constructor(
    private fournisseurService: FournisseursService,
    private articlesService: ArticlesService,
    private currentCompanyService: CurrentCompanyService
  ) {
    this.articlesDS = this.articlesService.getDataSource_v2(["id", "normalisation.articleClient"], "cache-first", "id");
    this.articlesDS.filter(["valide", "=", true]);
  }


  filterFournisseurDS(filters?) {
    const myFilter: any[] = [["valide", "=", true]];
    if (filters?.length) myFilter.push("and", filters);
    this.fournisseurSource = this.fournisseurService.getDataSource_v2(["id", "code", "raisonSocial"]);
    this.fournisseurSource.filter(myFilter);
  }
  filterProprietaireDS(filters) {
    this.proprietaireSource = this.fournisseurService
      .getDataSource_v2(["id", "code", "raisonSocial", "listeExpediteurs"]);
    this.proprietaireSource.filter(filters);
  }

  updateFilterFournisseurDS(proprietaire) {
    let newFourId = null;
    let newFourCode = null;
    const filters = [];

    if (this.currentCompanyService.getCompany().id !== "BUK" || proprietaire?.code.substring(0, 2) !== "BW") {
      const listExp = proprietaire?.listeExpediteurs;
      if (listExp) {
        listExp.split(",").map(exp => {
          filters.push(["code", "=", exp], "or");
          // Automatically selected when included in the list
          if (exp === proprietaire.code) {
            newFourId = proprietaire?.id;
            newFourCode = proprietaire?.code;
          }
        });
        filters.pop();
      } else {
        newFourId = proprietaire?.id;
        newFourCode = proprietaire?.code;
        if (newFourId) filters.push(["id", "=", newFourId]);
      }
    }
    this.filterFournisseurDS(filters);
    return [newFourId, newFourCode];
  }

  onProprietaireChanged(e) {
    if (!e.event) return; // Only user event
    this.fournisseurSB.value = { id: this.updateFilterFournisseurDS(e.value)[0] };
  }

  save() {
    this.visible = false;
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("choix-entrepot-commande-edi-popup");
  }

  onShown() {
    if (this.ligneEdi) {
      // Set values from grid
      this.codeArticleSB.value = { id: this.ligneEdi.article?.id };
      this.proprietaireSB.value = { id: this.ligneEdi.fournisseur?.id, listeExpediteurs: this.ligneEdi.fournisseur?.listeExpediteurs };
      this.fournisseurSB.value = { id: this.ligneEdi.fournisseur?.id };
      this.quantiteSB.instance.reset();
      // Set filters for proprietaire & fournisseur
      this.filterProprietaireDS([["valide", "=", true], "and", ["natureStation", "<>", "F"]]);
      if (!this.proprietaireSB.value) {
        this.filterFournisseurDS();
      } else {
        this.updateFilterFournisseurDS(this.proprietaireSB.value)
      }
    }
  }

  displayCodeBefore(data) {
    return data
      ? (data.code ? data.code : data.id) +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  onHidden() {
    this.codeArticleSB.instance.reset();
    this.proprietaireSB.instance.reset();
    this.fournisseurSB.instance.reset();
    this.quantiteSB.instance.reset();
  }

}
