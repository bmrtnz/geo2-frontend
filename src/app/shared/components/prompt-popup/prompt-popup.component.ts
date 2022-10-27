import { Component, EventEmitter, Input, NgModule, Output, ViewChild } from "@angular/core";
import {
  DxButtonModule,
  DxPopupComponent,
  DxPopupModule,
  DxTextBoxComponent,
  DxTextBoxModule,
  DxSelectBoxModule,
  DxValidatorComponent, DxValidatorModule, DxSelectBoxComponent
} from "devextreme-angular";
import { FormsModule, NgForm } from "@angular/forms";
import { RangeRule, RequiredRule } from "devextreme/ui/validation_rules";
import { SharedModule } from "../../shared.module";

@Component({
  selector: "app-prompt-popup",
  templateUrl: "./prompt-popup.component.html",
  styleUrls: ["./prompt-popup.component.scss"]
})
export class PromptPopupComponent {

  @ViewChild(DxPopupComponent, { static: false })
  popupComponent: DxPopupComponent;

  @ViewChild("commentBox", { static: false }) commentBox: DxTextBoxComponent;
  @ViewChild("commentSelectBox", { static: false }) commentSelectBox: DxSelectBoxComponent;

  @ViewChild("validator", { static: false }) commentValidator: DxValidatorComponent;
  @ViewChild("validatorSB", { static: false }) commentSBValidator: DxValidatorComponent;

  @Input() title = "";
  @Input() purpose = "";
  @Input() placeholder = "";

  @Output() whenValidate = new EventEmitter<string>();
  @Output() whenHiding = new EventEmitter<any>();
  @Output() whenShown = new EventEmitter<any>();

  commentValidationRules: (RangeRule | RequiredRule)[];
  validText: string;
  cancelText: string;
  commentMaxLength: number;
  commentMinLength: number;
  commentTitle: string;
  commentItemsList: string[];

  async show(texts?: any) {
    if (texts?.validText) this.validText = texts.validText;
    if (texts?.cancelText) this.cancelText = texts.cancelText;
    if (texts?.commentMaxLength) this.commentMaxLength = texts.commentMaxLength;
    if (texts?.commentMinLength) this.commentMinLength = texts.commentMinLength;
    if (texts?.commentTitle) this.commentTitle = texts.commentTitle;
    if (texts?.commentItemsList) this.commentItemsList = texts.commentItemsList;
    await this.popupComponent.instance.show();
    if (texts?.comment) this.setText(texts.comment);
  }

  setText(text: string) {
    this.commentBox.value = text;
  }

  setValidationRules() {
    this.commentValidationRules = [
      { type: "required" },
      { type: "stringLength", min: this.commentMinLength ?? 1 },
      { type: "stringLength", max: this.commentMaxLength ?? 512 }
    ];
  }

  onPopupHiding() {
    this.commentValidationRules = [];
    this.whenHiding.emit();
  }

  onHidden() {
    this.commentBox.instance.reset();
    this.commentSelectBox.instance.reset();
  }

  onShown() {
    this.whenShown.emit();
    this.commentBox?.instance.focus();
    this.setValidationRules();
  }

  onSubmit(form: NgForm) {
    if (this.commentValidator.instance.validate().isValid || this.commentSBValidator.instance.validate().isValid) {
      this.whenValidate.emit(form.value.commentaire || form.value.commentaireSB);
      this.popupComponent.instance.hide();
    }
  }

}

@NgModule({
  declarations: [PromptPopupComponent],
  imports: [
    SharedModule,
    FormsModule,
    DxPopupModule,
    DxTextBoxModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxValidatorModule,
  ],
  exports: [PromptPopupComponent],
})
export class PromptPopupModule { }
