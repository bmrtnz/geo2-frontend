import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import {
  DxButtonComponent,
  DxPopupComponent,
  DxScrollViewComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { confirm } from "devextreme/ui/dialog";
import { from, lastValueFrom } from "rxjs";
import { concatMap, takeWhile } from "rxjs/operators";
import { ReferencesClientService } from "app/shared/services/api/references-client.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { GridArticlesRefClientComponent } from "./grid-articles-ref-client/grid-articles-ref-client.component";
import { AssociatedArticlePromptComponent } from "../associated-article-prompt/associated-article-prompt.component";
import { EdiLigne } from "app/shared/models";


@Component({
  selector: "app-ajout-articles-ref-client-popup",
  templateUrl: "./ajout-articles-ref-client-popup.component.html",
  styleUrls: ["./ajout-articles-ref-client-popup.component.scss"],
})
export class AjoutArticlesRefClientPopupComponent implements OnChanges {
  @Input() public ordre: Ordre;
  @Input() public single: boolean;
  @Input() public ediLigneID: EdiLigne["id"];
  @Output() public additionnalFilter: any;
  @Output() public lignesChanged = new EventEmitter();
  @Output() public whenClosed = new EventEmitter();

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

  @ViewChild(GridArticlesRefClientComponent, { static: false })
  catalogueRefsClt: GridArticlesRefClientComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild("addButton", { static: false }) addButton: DxButtonComponent;
  @ViewChild("deleteButton", { static: false }) deleteButton: DxButtonComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  @ViewChild(AssociatedArticlePromptComponent) associatedPrompt: AssociatedArticlePromptComponent;


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
    if (this.ordre)
      this.additionnalFilter = [
        "and",
        ["referencesClient.client.id", "=", this.ordre.client?.id],
      ];
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("ajout-articles");
    if (this.ordre) {
      this.titleMid =
        "n° " +
        this.ordre.campagne?.id +
        "-" +
        this.ordre.numero +
        " - " +
        this.ordre.client?.code +
        "/" +
        this.ordre.entrepot?.code;
    }
    this.titleEnd = this.localizeService.localize("via-refs-client");
  }

  updateChosenArticles() {
    this.chosenArticles = this.getGridSelectedArticles();
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
    if (this.nbARticles) {
      const hintArticles = this.gridUtilsService.friendlyFormatList(
        this.chosenArticles
      );
      this.addButton.instance.option("hint", hintArticles);
      this.deleteButton.instance.option("hint", hintArticles);
    }
  }

  getGridSelectedArticles() {
    return this.catalogueRefsClt?.dataGrid.instance.getSelectedRowKeys();
  }

  selectFromGrid(e) {
    this.updateChosenArticles();
  }

  async deleteFromRefClient() {
    if (
      await confirm(
        this.localizeService
          .localize("confirm-deferencement-client")
          .replace("&DA", this.deleteButton.text),
        this.localizeService.localize("references-client")
      )
    ) {
      let artIds = this.chosenArticles;
      artIds = [...new Set(artIds)]; // Removing duplicates
      this.referencesClientService
        .removeRefs(this.ordre.client.id, artIds)
        .subscribe({
          next: () => {
            const trad = this.vowelTest(this.ordre.client.code[0])
              ? "-vowel"
              : "";
            const message = this.localizeService
              .localize(`articles-supprimes-refs-client${trad}`)
              .split("&&")
              .join(artIds.length > 1 ? "s" : "")
              .replace("&A", this.gridUtilsService.friendlyFormatList(artIds))
              .replace("&C", this.ordre.client.code);
            this.catalogueRefsClt.dataGrid.instance.clearSelection();
            this.catalogueRefsClt.refreshArticlesGrid();
            notify(message, "success", 7000);
          },
          error: () =>
            notify(
              "Erreur lors de la suppression référence(s) client",
              "error",
              5000
            ),
        });
    }
  }

  vowelTest(text) {
    return /^[AEIOUYaeiouy]$/i.test(text);
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("app-ajout-articles-ref-client-popup");
  }

  async onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);

    this.catalogueRefsClt.dataGrid.selection = {
      mode: "multiple",
      allowSelectAll: false,
      showCheckBoxesMode: "always",
    };
    this.catalogueRefsClt.valideSB.value = this.catalogueRefsClt.trueFalse[1];

    // datagrid state loading is not executed automatically in this component...
    const gridConfig = await this.gridConfiguratorService.fetchConfig(
      Grid.Article
    );
    this.catalogueRefsClt?.dataGrid.instance.state(gridConfig);
    // this.catalogue?.dataGrid.instance.repaint();
    this.catalogueRefsClt?.refreshArticlesGrid(); // Show grid values
  }

  clearAll() {
    if (!this.catalogueRefsClt) return;
    this.codeChangeProcess = true;
    this.catalogueRefsClt.dataGrid.dataSource = [];
    this.updateChosenArticles();
    this.catalogueRefsClt.dataGrid.instance.clearSelection();
    this.catalogueRefsClt.especesSB.instance.reset();
    this.catalogueRefsClt.varietesSB.instance.reset();
    this.catalogueRefsClt.modesCultureSB.instance.reset();
    this.catalogueRefsClt.emballagesSB.instance.reset();
    this.catalogueRefsClt.originesSB.instance.reset();
    this.codeChangeProcess = false;
  }

  onHidden() {
    this.whenClosed.emit();
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
              concatMap(async res => {
                if (this.ediLigneID)
                  await lastValueFrom(this.OrdreLigneService.save_v2(["id"], {
                    ordreLigne: {
                      id: res.data.ofInitArticle.data.new_orl_ref,
                      ediLigne: { id: this.ediLigneID },
                    },
                  }));
                return res;
              }),
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
