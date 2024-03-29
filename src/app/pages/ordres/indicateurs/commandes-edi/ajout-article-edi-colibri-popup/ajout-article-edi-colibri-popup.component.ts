import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ArticlesService, FournisseursService, LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxButtonComponent, DxNumberBoxComponent, DxSelectBoxComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";
import DataSource from "devextreme/data/data_source";

@Component({
  selector: 'app-ajout-article-edi-colibri-popup',
  templateUrl: './ajout-article-edi-colibri-popup.component.html',
  styleUrls: ['./ajout-article-edi-colibri-popup.component.scss']
})
export class AjoutArticleEdiColibriPopupComponent {
  @Input() public ligneEdi: any;
  @Output() whenValidate = new EventEmitter();

  public visible: boolean;
  public proprietaireSource: DataSource;
  public fournisseurSource: DataSource;
  public articlesDS: DataSource;
  public popupShown: boolean;


  @ViewChild("codeArticleSB", { static: false }) codeArticleSB: DxSelectBoxComponent;
  @ViewChild("proprietaireSB", { static: false }) proprietaireSB: DxSelectBoxComponent;
  @ViewChild("fournisseurSB", { static: false }) fournisseurSB: DxSelectBoxComponent;
  @ViewChild("quantiteSB", { static: false }) quantiteSB: DxNumberBoxComponent;
  @ViewChild("saveBtn", { static: false }) saveBtn: DxButtonComponent;

  constructor(
    private fournisseurService: FournisseursService,
    private articlesService: ArticlesService,
    private functionsService: FunctionsService,
    private localize: LocalizationService,
    private currentCompanyService: CurrentCompanyService,
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
    return { id: newFourId, code: newFourCode };
  }

  onProprietaireChanged(e) {
    if (!e.event) return; // Only user event
    const fourn = this.updateFilterFournisseurDS(e.value);
    this.fournisseurSB.value = fourn;
  }

  save() {
    this.functionsService.wAjoutArtRecapEdiColibri(
      this.codeArticleSB.value.id,
      this.fournisseurSB.value.code,
      this.proprietaireSB.value.code,
      this.quantiteSB.value ?? this.ligneEdi.ligneEdi.quantiteColis,
      this.ligneEdi.id,
    ).subscribe({
      next: () => {
        notify(this.localize.localize("article-ajoute"), "success", 1500);
        this.whenValidate.emit();
        this.visible = false;
      },
      error: ({ message }: Error) => notify(message, "error"),
    });
  }

  onShowing(e) {
    this.popupShown = false;
    e.component
      .content()
      .parentNode.classList.add("choix-entrepot-commande-edi-popup");
  }

  onShown() {
    if (this.ligneEdi) {
      // Set values from grid
      this.codeArticleSB.value = { id: this.ligneEdi.article?.id };
      this.proprietaireSB.value = { id: this.ligneEdi.proprietaire?.id, code: this.ligneEdi.proprietaire?.code, listeExpediteurs: this.ligneEdi.proprietaire?.listeExpediteurs };
      this.fournisseurSB.value = { id: this.ligneEdi.fournisseur?.id, code: this.ligneEdi.fournisseur?.code };
      this.quantiteSB.instance.reset();
      // Set filters for proprietaire & fournisseur
      this.filterProprietaireDS([["valide", "=", true], "and", ["natureStation", "<>", "F"]]);
      this.updateFilterFournisseurDS(this.proprietaireSB.value);
      if (!this.proprietaireSB.value?.id) {
        this.proprietaireSB.instance.focus();
      } else {
        this.quantiteSB.instance.focus();
      }

    }
    this.popupShown = true;
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
