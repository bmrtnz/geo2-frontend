import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import { EdiLigne } from "app/shared/models";
import Ordre from "app/shared/models/ordre.model";
import { ArticlesService, LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import {
  DxButtonComponent,
  DxPopupComponent,
  DxScrollViewComponent,
} from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { from, lastValueFrom } from "rxjs";
import { concatMap, takeWhile, tap } from "rxjs/operators";
import { AssociatedArticlePromptComponent } from "../../../shared/components/associated-article-prompt/associated-article-prompt.component";
import { GridLignesHistoriqueComponent } from "../grid-lignes-historique/grid-lignes-historique.component";

@Component({
  selector: "app-ajout-articles-histo-popup",
  templateUrl: "./ajout-articles-histo-popup.component.html",
  styleUrls: ["./ajout-articles-histo-popup.component.scss"],
})
export class AjoutArticlesHistoPopupComponent implements OnChanges {
  @Input() public ordre: Ordre;
  @Input() public readOnlyMode: boolean;
  @Input() public single: boolean;
  @Input() public ediLigneID: EdiLigne["id"];
  @Output() public singleSelection: boolean;
  @Output() public gridSelectionEnabled: boolean;
  @Output() public lignesChanged = new EventEmitter();
  @Output() public whenClosed = new EventEmitter();
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
  popupFullscreen = true;
  public running: boolean;

  @ViewChild(GridLignesHistoriqueComponent, { static: false })
  gridLignesHisto: GridLignesHistoriqueComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild("addButton", { static: false }) addButton: DxButtonComponent;
  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;
  @ViewChild(AssociatedArticlePromptComponent)
  associatedPrompt: AssociatedArticlePromptComponent;

  constructor(
    private functionsService: FunctionsService,
    private ordreLignesService: OrdreLignesService,
    private currentCompanyService: CurrentCompanyService,
    private gridUtilsService: GridUtilsService,
    private localizeService: LocalizationService
  ) {
    this.running = false;
  }

  ngOnChanges() {
    this.setTitle();
    this.gridSelectionEnabled = !this.readOnlyMode;
    this.singleSelection = this.single;
  }

  setTitle() {
    if (!this.readOnlyMode) {
      if (this.ordre) {
        this.titleStart = this.localizeService.localize("ajout-articles");
        this.titleMid =
          "n° " +
          this.ordre.campagne?.id +
          "-" +
          this.ordre.numero +
          " - " +
          this.ordre.client?.code +
          "/" +
          this.ordre.entrepot?.code;
        this.clientId = this.ordre.client?.id;
        this.entrepotId = this.ordre.entrepot?.id;
        this.secteurId = this.ordre.secteurCommercial?.id;
        this.titleEnd = this.localizeService.localize("via-histo-client");
      }
    } else {
      this.titleStart = this.localizeService.localize("histo-client") + " ";
      this.titleMid = this.ordre.client.raisonSocial;
      this.titleEnd = "";
    }
  }

  clientChanged(e) {
    if (this.readOnlyMode) this.titleMid = e?.raisonSocial ?? "";
  }

  updateChosenArticles() {
    const selectedRows = this.getGridSelectedArticles();
    this.chosenArticles = [];
    this.chosenArticles = selectedRows.map((row) => row.article.id);
    this.nbARticles = this.chosenArticles.length;
    this.validBtnText = this.localizeService
      .localize("btn-valider-article" + (this.nbARticles > 1 ? "s" : ""))
      .replace("&&", this.nbARticles.toString());
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
    return this.gridLignesHisto.datagrid.instance.getSelectedRowsData();
  }

  selectFromGrid(e) {
    this.updateChosenArticles();
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("ajout-articles-histo-popup");
  }

  onShown(e) {
    this.popupShown = true;
    this.running = false;
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
  }

  clearAll() {
    this.gridLignesHisto.datagrid.dataSource = null;
    this.updateChosenArticles();
  }

  onHidden() {
    this.whenClosed.emit();
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

    this.running = true;
    const info =
      this.localizeService.localize(
        "ajout-article" + (this.nbARticles > 1 ? "s" : "")
      ) + "...";
    notify(info, "info", 3000);
    from(this.chosenArticles)
      .pipe(
        concatMap((articleID, index) =>
          this.functionsService
            .ofInitArticleHistory(
              this.ordre.id,
              articleID,
              this.currentCompanyService.getCompany().id,
              this.gridLignesHisto.datagrid.instance.getSelectedRowKeys()[index]
            )
            .valueChanges.pipe(
              concatMap(async res => {
                if (this.ediLigneID)
                  await lastValueFrom(this.ordreLignesService.save_v2(["id"], {
                    ordreLigne: {
                      id: res.data.ofInitArticleHistory.data.new_orl_ref,
                      ediLigne: { id: this.ediLigneID },
                    },
                  }));
                return res;
              }),
              concatMap((res) => {
                this.associatedPrompt.ordreLigneID =
                  res.data.ofInitArticleHistory.data.new_orl_ref;
                this.associatedPrompt.articleAssocieID =
                  res.data.ofInitArticleHistory.data.art_ass;
                return this.associatedPrompt.tryPrompt();
              }),
              takeWhile((res) => res.loading)
            )
        )
      )
      .subscribe({
        error: ({ message }: Error) => {
          this.running = false;
          notify(this.messageFormat(message), "error", 7000);
        },
        complete: () => this.clearAndHidePopup(),
      });
  }

  private messageFormat(mess) {
    const functionNames = ["ofInitArticleHistory"];
    functionNames.map(
      (fn) =>
        (mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""))
    );
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }
}
