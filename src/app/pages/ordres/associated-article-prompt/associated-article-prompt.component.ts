import { Component, EventEmitter, Input, OnInit, ViewChild } from "@angular/core";
import { InfoPopupComponent } from "app/shared/components/info-popup/info-popup.component";
import { Article, OrdreLigne } from "app/shared/models";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxPopupComponent } from "devextreme-angular";
import { EMPTY, of } from "rxjs";
import { concatMap, concatMapTo, filter } from "rxjs/operators";

/** Popup that suggest to add proposed article to associated order-row order */
@Component({
  selector: "app-associated-article-prompt",
  templateUrl: "./associated-article-prompt.component.html",
  styleUrls: ["./associated-article-prompt.component.scss"]
})
export class AssociatedArticlePromptComponent {

  @Input() articleAssocieID: Article["id"];
  @Input() ordreLigneID: OrdreLigne["id"];

  @ViewChild(DxPopupComponent) private popup: DxPopupComponent;

  visible = false;
  doNavigate = new EventEmitter<boolean>();

  constructor(
    private functionsService: FunctionsService,
    private ordreLignesService: OrdreLignesService,
    private currentCompanyService: CurrentCompanyService,
  ) { }

  cancelClick() {
    this.visible = false;
    this.doNavigate.emit(false);
  }

  continueClick() {
    this.visible = false;
    this.doNavigate.emit(true);
  }

  public tryPrompt() {
    if (!this.articleAssocieID) return of({ loading: false });
    this.popup.visible = true;
    return this.doNavigate.pipe(
      concatMap(next => next ? this.addAssociatedArticle() : of({ loading: false })),
    );
  }

  private addAssociatedArticle() {
    return this.ordreLignesService.getOne_v2(this.ordreLigneID, new Set(["ordre.id"]))
      .pipe(
        concatMap(res => this.functionsService.ofInitArticle(
          res.data.ordreLigne.ordre.id,
          this.articleAssocieID,
          this.currentCompanyService.getCompany().id,
        ).valueChanges),
      );
  }

}
