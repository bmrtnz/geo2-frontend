import { FetchResult } from "@apollo/client/core";
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  ViewChild,
} from "@angular/core";

import {
  HistoriqueService,
  HistoryType,
} from "app/shared/services/api/historique.service";
import { Observable } from "rxjs";
import { mergeAll, take } from "rxjs/operators";
import { SharedModule } from "../../shared.module";
import { ModifiedFieldsService } from "app/shared/services/modified-fields.service";
import {
  PromptPopupComponent,
  PromptPopupModule,
} from "../prompt-popup/prompt-popup.component";

@Component({
  selector: "app-push-history-popup",
  templateUrl: "./push-history-popup.component.html",
  styleUrls: ["./push-history-popup.component.scss"],
})
export class PushHistoryPopupComponent {
  @ViewChild(PromptPopupComponent, { static: false })
  promptPopupComponent: PromptPopupComponent;

  @Input() title = "";
  @Input() placeholder = "";
  @Input() modifUserIds;

  persist = new EventEmitter<Observable<FetchResult>>();

  historyType: HistoryType;
  sourceData: {};

  constructor(
    private historiqueService: HistoriqueService,
    private modifiedFieldsService: ModifiedFieldsService
  ) {}

  async onSubmit(comment: string) {
    const modifiedFields = this.modifiedFieldsService.getModifiedFields();
    const save = this.historiqueService.saveByType(this.historyType, {
      ...this.sourceData,
      // Adding modified fields list to user comment
      commentaire: comment + (modifiedFields ? " " + modifiedFields : ""),
    });
    this.persist.emit(save);
  }

  onHiding() {
    this.modifiedFieldsService.clearModifiedFields();
  }

  onShown() {
    // If applicable, populates field with the ids of the users who suggested modifications
    if (this.modifUserIds?.length)
      this.promptPopupComponent.setText(`(${this.modifUserIds.join(" / ")}) `);
  }

  present(type: HistoryType, data) {
    this.historyType = type;
    this.sourceData = data;
    this.promptPopupComponent.show();
    return this.persist.asObservable().pipe(take(1), mergeAll());
  }
}

@NgModule({
  declarations: [PushHistoryPopupComponent],
  imports: [SharedModule, PromptPopupModule],
  exports: [PushHistoryPopupComponent],
})
export class PushHistoryPopupModule {}
