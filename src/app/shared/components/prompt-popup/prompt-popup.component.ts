import {Component, EventEmitter, Input, NgModule, OnInit, Output, ViewChild} from '@angular/core';
import {
  DxButtonModule,
  DxPopupModule,
  DxTextBoxComponent,
  DxTextBoxModule,
  DxValidatorComponent,
  DxValidatorModule
} from 'devextreme-angular';
import {SharedModule} from '../../shared.module';

@Component({
  selector: 'app-prompt-popup',
  templateUrl: './prompt-popup.component.html',
  styleUrls: ['./prompt-popup.component.scss']
})
export class PromptPopupComponent implements OnInit {

  @ViewChild(DxTextBoxComponent, { static: false })
  commentBox: DxTextBoxComponent;

  @ViewChild(DxValidatorComponent, { static: false })
  commentValidator: DxValidatorComponent;

  @Input() title = '';
  @Input() placeholder = '';
  @Input() cancellable = true;

  @Output() validate = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  submitted = false;
  commentValid = false;

  constructor() {}

  ngOnInit() {
  }

  onSubmit(e) {
    this.submitted = true;
    this.visible = false;
  }

  onCancel(e) {
    this.visible = false;
  }

  onHide(e) {
    this.visibleChange.emit(this.visible);
    if (!this.submitted) {
      this.cancel.emit();
    } else {
      this.validate.emit(this.commentBox.value);
    }
  }

  onShow(e) {
    this.submitted = false;
    if (this.commentBox) {
      this.commentBox.value = '';
      this.commentBox.instance.focus();
    }
    if (this.commentValidator) {
      this.commentValidator.instance.validate();
    }
  }
}

@NgModule({
  declarations: [PromptPopupComponent],
  imports: [
    SharedModule,
    DxPopupModule,
    DxTextBoxModule,
    DxButtonModule,
    DxValidatorModule,
  ],
  exports: [PromptPopupComponent]
})
export class PromptPopupModule { }
