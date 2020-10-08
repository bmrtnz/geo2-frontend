import { Component, EventEmitter, Input, NgModule, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FetchResult } from 'apollo-link';
import { HistoriqueService, HistoryType } from 'app/shared/services/historique.service';
import {
  DxButtonModule,
  DxPopupComponent,
  DxPopupModule,
  DxTextBoxComponent,
  DxTextBoxModule,
  DxValidatorComponent,
  DxValidatorModule
} from 'devextreme-angular';
import { RangeRule, RequiredRule } from 'devextreme/ui/validation_engine';
import { Observable } from 'rxjs';
import { mergeAll, take } from 'rxjs/operators';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-push-history-popup',
  templateUrl: './push-history-popup.component.html',
  styleUrls: ['./push-history-popup.component.scss']
})
export class PushHistoryPopupComponent {

  @ViewChild(DxPopupComponent, { static: false })
  popupComponent: DxPopupComponent;

  @ViewChild(DxTextBoxComponent, { static: false })
  commentBox: DxTextBoxComponent;

  @ViewChild(DxValidatorComponent, { static: false })
  commentValidator: DxValidatorComponent;

  @Input() title = '';
  @Input() placeholder = '';
  persist = new EventEmitter<Observable<FetchResult>>();

  commentValidationRules: (RangeRule | RequiredRule)[];
  historyType: HistoryType;
  sourceData: {};

  constructor(
    private historiqueService: HistoriqueService,
  ) { }

  async onSubmit(form: NgForm) {
    if (this.commentValidator.instance.validate().isValid) {
      const save = await this.historiqueService
        .saveByType(this.historyType, {
          ...this.sourceData,
          commentaire: form.value.commentaire,
        });
      this.persist.emit(save);
      this.popupComponent.instance.hide();
    }
  }

  onHiding() {
    this.commentValidationRules = [];
  }

  onHidden() {
    this.commentBox.instance.reset();
  }

  onShowing() {
    this.commentValidationRules = [
      { type: 'required' },
      { type: 'stringLength', min: 5 },
    ];
  }

  onShown() {
    this.commentBox.instance.focus();
  }

  present(type: HistoryType, data) {
    this.historyType = type;
    this.sourceData = data;
    this.popupComponent.instance.show();
    return this.persist.asObservable()
      .pipe(take(1), mergeAll());
  }

}

@NgModule({
  declarations: [PushHistoryPopupComponent],
  imports: [
    SharedModule,
    FormsModule,
    DxPopupModule,
    DxTextBoxModule,
    DxButtonModule,
    DxValidatorModule,
  ],
  exports: [PushHistoryPopupComponent]
})
export class PushHistoryPopupModule { }
