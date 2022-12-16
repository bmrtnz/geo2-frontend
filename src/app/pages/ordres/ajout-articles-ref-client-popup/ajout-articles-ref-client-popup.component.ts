import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { ArticlesListComponent } from "app/pages/articles/list/articles-list.component";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { DxButtonComponent, DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { confirm } from "devextreme/ui/dialog";
import { from } from "rxjs";
import { concatMap, takeWhile } from "rxjs/operators";
import { ReferencesClientService } from "app/shared/services/api/references-client.service";
import { GridCommandesComponent } from "../grid-commandes/grid-commandes.component";
import { GridUtilsService } from "app/shared/services/grid-utils.service";

@Component({
  selector: "app-ajout-articles-ref-client-popup",
  templateUrl: "./ajout-articles-ref-client-popup.component.html",
  styleUrls: ["./ajout-articles-ref-client-popup.component.scss"]
})
export class AjoutArticlesRefClientPopupComponent implements OnChanges {

  @Input() public ordre: Ordre;
  @Output() public additionnalFilter: any;
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
  remplacementArticle: boolean;
  popupFullscreen = true;


  @ViewChild(ArticlesListComponent, { static: false }) catalogue: ArticlesListComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild("addButton", { static: false }) addButton: DxButtonComponent;
  @ViewChild("deleteButton", { static: false }) deleteButton: DxButtonComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  constructor(
    public OrdreLigneService: OrdreLignesService,
    public referencesClientService: ReferencesClientService,
    private gridConfiguratorService: GridConfiguratorService,
    private functionsService: FunctionsService,
    private gridUtilsService: GridUtilsService,
    private currentCompanyService: CurrentCompanyService,
    private localizeService: LocalizationService
  ) { }

  ngOnChanges() {
    this.setTitle();
    if (this.ordre) this.additionnalFilter = ["and", ["referencesClient.client.id", "=", this.ordre.client.id]];
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("ajout-articles");
    if (this.ordre) {
      this.titleMid = "n° " + this.ordre.campagne.id + "-" + this.ordre.numero + " - "
        + this.ordre.client.code
        + "/" + this.ordre.entrepot.code;
    }
    this.titleEnd = this.localizeService.localize("via-refs-client");
  }

  updateChosenArticles() {
    this.chosenArticles = this.getGridSelectedArticles();
    this.nbARticles = this.chosenArticles.length;
    this.articlesKO = !this.nbARticles;
    if (!this.remplacementArticle) {
      this.validBtnText = this.localizeService.localize("btn-valider-article" + (this.nbARticles > 1 ? "s" : ""))
        .replace("&&", this.nbARticles.toString());
    } else {
      this.validBtnText = this.localizeService.localize("btn-remplacer-article");
    }
    if (this.nbARticles !== this.nbArticlesOld) {
      this.pulseBtnOn = false;
      setTimeout(() => this.pulseBtnOn = true, 1);
    }
    this.nbArticlesOld = this.nbARticles;
    if (this.nbARticles) {
      const hintArticles = this.gridUtilsService.friendlyFormatList(this.chosenArticles);
      this.addButton.instance.option("hint", hintArticles);
      this.deleteButton.instance.option("hint", hintArticles);
    }
  }

  getGridSelectedArticles() {
    return this.catalogue?.dataGrid.instance.getSelectedRowKeys();
  }

  selectFromGrid(e) {
    this.updateChosenArticles();
  }

  async deleteFromRefClient() {

    if (await confirm(
      this.localizeService.localize("confirm-deferencement-client").replace("&DA", this.deleteButton.text),
      this.localizeService.localize("references-client"))) {
      let artIds = this.chosenArticles;
      artIds = [...new Set(artIds)]; // Removing duplicates
      this.referencesClientService.removeRefs(this.ordre.client.id, artIds).subscribe({
        next: () => {
          const message = this.localizeService.localize("articles-supprimes-refs-client")
            .split("&&").join(artIds.length > 1 ? "s" : "")
            .replace("&A", this.gridUtilsService.friendlyFormatList(artIds))
            .replace("&C", this.ordre.client.code);
          this.catalogue.dataGrid.instance.clearSelection();
          this.catalogue.refreshArticlesGrid();
          notify(message, "success", 7000);
        },
        error: () => notify("Erreur lors de la suppression référence(s) client", "error", 5000)
      });
    }

  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("app-ajout-articles-ref-client-popup");
  }

  async onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);

    this.catalogue.dataGrid.selection = { mode: "multiple", allowSelectAll: false, showCheckBoxesMode: "always" };
    this.catalogue.valideSB.value = this.catalogue.trueFalse[1];

    // datagrid state loading is not executed automatically in this component...
    const gridConfig = await this.gridConfiguratorService.fetchConfig(Grid.Article);
    this.catalogue?.dataGrid.instance.state(gridConfig);
    // this.catalogue?.dataGrid.instance.repaint();
    this.catalogue?.refreshArticlesGrid(); // Show grid values
  }

  clearAll() {
    if (!this.catalogue) return;
    this.codeChangeProcess = true;
    this.catalogue.dataGrid.dataSource = [];
    this.updateChosenArticles();
    this.catalogue.dataGrid.instance.clearSelection();
    this.catalogue.especeSB.instance.reset();
    this.catalogue.varieteSB.instance.reset();
    this.catalogue.modesCultureSB.instance.reset();
    this.catalogue.emballageSB.instance.reset();
    this.catalogue.origineSB.instance.reset();
    this.codeChangeProcess = false;
  }

  hidePopup() {
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
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

