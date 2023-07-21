import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import { ArticlesListComponent } from "app/pages/articles/list/articles-list.component";
import Ordre from "app/shared/models/ordre.model";
import { ArticlesService, LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import {
  DxButtonComponent,
  DxPopupComponent,
  DxScrollViewComponent,
  DxTagBoxComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { from } from "rxjs";
import { concatMap, takeWhile, tap } from "rxjs/operators";
import { AssociatedArticlePromptComponent } from "../associated-article-prompt/associated-article-prompt.component";
import { GridCommandesComponent } from "../grid-commandes/grid-commandes.component";
import { ZoomArticlePopupComponent } from "../zoom-article-popup/zoom-article-popup.component";

@Component({
  selector: "app-ajout-articles-manu-popup",
  templateUrl: "./ajout-articles-manu-popup.component.html",
  styleUrls: ["./ajout-articles-manu-popup.component.scss"],
})
export class AjoutArticlesManuPopupComponent implements OnChanges {
  @Input() public ordre: Ordre;
  @Input() public articleRowKey: string;
  @Input() public single: boolean;
  @Input() gridCommandes: GridCommandesComponent;
  @Output() public lignesChanged = new EventEmitter();
  @Output() public articleLigneId: string;

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
  titleEnd: string;
  pulseBtnOn: boolean;
  remplacementArticle: boolean;
  popupFullscreen = true;
  multipleItems: number;
  maxRowNumber: number;

  @ViewChild(ArticlesListComponent, { static: false })
  catalogue: ArticlesListComponent;
  @ViewChild(DxTagBoxComponent, { static: false })
  saisieCode: DxTagBoxComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild("addButton", { static: false }) addButton: DxButtonComponent;
  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;
  @ViewChild(AssociatedArticlePromptComponent)
  associatedPrompt: AssociatedArticlePromptComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false })
  zoomArticlePopup: ZoomArticlePopupComponent;

  constructor(
    private articlesService: ArticlesService,
    public OrdreLigneService: OrdreLignesService,
    private gridConfiguratorService: GridConfiguratorService,
    private functionsService: FunctionsService,
    private gridUtilsService: GridUtilsService,
    private currentCompanyService: CurrentCompanyService,
    private localizeService: LocalizationService
  ) {
    this.maxRowNumber = 100;
  }

  ngOnChanges() {
    this.remplacementArticle = !!this.articleRowKey;
    this.setTitle();
  }

  setTitle() {
    this.titleStart = this.localizeService.localize(
      this.remplacementArticle ? "remplacement-article" : "ajout-articles"
    );
    if (!this.ordre) return;
    this.titleEnd =
      "n° " +
      this.ordre.campagne.id +
      "-" +
      this.ordre.numero +
      " - " +
      this.ordre.client.code +
      "/" +
      this.ordre.entrepot.code;
  }

  openZoomArticle(e) {
    this.articleLigneId = e;
    this.zoomArticlePopup.visible = true;
  }

  articleOverflow() {
    this.saisieCode.value.pop();
    this.saisieCode.instance.repaint();
    this.saisieCode.instance.focus();
    notify(this.localizeService.localize("article-overflow"), "warning");
  }

  updateChosenArticles() {
    const articleTags: any = this.saisieCode.value ? this.saisieCode.value : [];

    // Ex 96000x6
    if (this.multipleItems) {
      this.multipleItems = this.remplacementArticle ? 1 : this.multipleItems;
      const lastArt = articleTags[articleTags.length - 1]
      if ((this.gridCommandes.gridRowsTotal + this.multipleItems + this.saisieCode.value.length - 1) > this.maxRowNumber) {
        this.multipleItems = 0;
        return this.articleOverflow();
      }
      for (let i = 0; i < this.multipleItems - 1; i++) articleTags.push(lastArt);
      this.multipleItems = 0;
    } else {
      if ((this.gridCommandes.gridRowsTotal + this.saisieCode.value.length) > this.maxRowNumber) {
        return this.articleOverflow();
      }
    }

    this.chosenArticles = articleTags.concat(this.getGridSelectedArticles());
    this.nbARticles = this.chosenArticles.length;
    this.articlesKO = !this.nbARticles;
    if (!this.remplacementArticle) {
      this.validBtnText = this.localizeService
        .localize("btn-valider-article" + (this.nbARticles > 1 ? "s" : ""))
        .replace("&&", this.nbARticles.toString());
    } else {
      this.validBtnText = this.localizeService.localize(
        "btn-remplacer-article"
      );
    }
    if (this.nbARticles !== this.nbArticlesOld) {
      this.pulseBtnOn = false;
      setTimeout(() => (this.pulseBtnOn = true), 1);
    }
    this.nbArticlesOld = this.nbARticles;
    if (this.nbARticles)
      this.addButton.instance.option(
        "hint",
        this.gridUtilsService.friendlyFormatList(this.chosenArticles)
      );
  }

  getGridSelectedArticles() {
    return this.catalogue?.dataGrid.instance.getSelectedRowKeys();
  }

  selectFromGrid(e) {
    const tagArray = this.saisieCode.value;
    // We do not allow article selection if already tag entered
    if (this.single) {
      if (tagArray?.length) {
        e.component.deselectRows(e.currentSelectedRowKeys);
        return;
      }
      if (e.selectedRowKeys?.length === 2)
        e.component.deselectRows(e.selectedRowKeys[0]);
    }
    this.updateChosenArticles();
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("ajout-articles-manu-popup");
  }

  async onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);

    if (this.remplacementArticle) this.clearAll();

    this.catalogue.dataGrid.selection = {
      mode: "multiple",
      allowSelectAll: false,
      showCheckBoxesMode: "always",
    };
    this.catalogue.valideSB.value = this.catalogue.trueFalse[1];

    // datagrid state loading is not executed automatically in this component...
    const gridConfig = await this.gridConfiguratorService.fetchConfig(
      Grid.Article
    );
    this.catalogue?.dataGrid.instance.state(gridConfig);
    this.catalogue?.dataGrid.instance.repaint();

    this.saisieCode.instance.focus();
  }

  alreadySelected() {
    notify("Cet article est déjà sélectionné", "warning", 3000);
  }

  onValueChanged(e) {
    if (this.codeChangeProcess) return; // To avoid infinite loop
    this.codeChangeProcess = true;
    this.multipleItems = 0;
    const tagArray = e.component.option("value");
    if (tagArray?.length) {
      let myValue = tagArray.pop();
      if (myValue.indexOf("x")) {
        this.multipleItems = parseInt(myValue.split("x")[1]);
        myValue = myValue.split("x")[0];
      }
      if (myValue.length > 6) {
        notify(myValue + ": format/type incorrects", "error", 3000);
      } else {
        myValue = ("000000" + myValue).slice(-6);
        tagArray.push(myValue);
        e.component.option("value", tagArray);
        this.articlesKO = true;
        this.articlesService.getOne(myValue).subscribe((res) => {
          const myArt = res?.data?.article;
          this.articlesKO = !myArt || myArt.valide !== true;
          if (this.articlesKO) {
            notify("L'article " + myValue + " n'existe pas", "error", 3000);
            if (tagArray.includes(myValue)) tagArray.pop();
            e.component.option("value", tagArray);
          }
          this.updateChosenArticles();
          this.codeChangeProcess = false;
        });
        return;
      }
      e.component.option("value", tagArray);
    }
    this.codeChangeProcess = false;
    this.updateChosenArticles();
  }

  clearAll() {
    if (!this.catalogue) return;
    this.codeChangeProcess = true;
    this.saisieCode?.instance.reset();
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

  insertReplaceArticles() {
    if (!this.remplacementArticle) {
      const info =
        this.localizeService.localize(
          "ajout-article" + (this.nbARticles > 1 ? "s" : "")
        ) + "...";
      notify(info, "info", 3000);
      from(this.chosenArticles)
        .pipe(
          concatMap((articleID) =>
            this.functionsService
              .ofInitArticle(
                this.ordre.id,
                articleID,
                this.currentCompanyService.getCompany().id
              )
              .valueChanges.pipe(
                concatMap((res) => {
                  this.associatedPrompt.ordreLigneID =
                    res.data.ofInitArticle.data.new_orl_ref;
                  this.associatedPrompt.articleAssocieID =
                    res.data.ofInitArticle.data.art_ass;
                  return this.associatedPrompt.tryPrompt();
                }),
                takeWhile((res) => res.loading)
              )
          )
        )
        .subscribe({
          error: ({ message }: Error) =>
            notify(this.messageFormat(message), "error", 7000),
          complete: () => this.clearAndHidePopup(),
        });
    } else {
      const ordreLigne = {
        id: this.articleRowKey,
        article: { id: this.chosenArticles[0] },
        listeCertifications: "0",
        origineCertification: null,
      };
      this.OrdreLigneService.save_v2(["id"], { ordreLigne }).subscribe({
        next: (res) => {
          notify("Article remplacé", "success", 3000);
          this.nbARticles = 0;
          this.clearAndHidePopup();
        },
        error: () =>
          notify("Erreur lors du remplacement de l'article", "error", 3000),
      });
    }
  }

  private messageFormat(mess) {
    const functionNames = ["ofInitArticle"];
    functionNames.map(
      (fn) =>
        (mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""))
    );
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }
}
