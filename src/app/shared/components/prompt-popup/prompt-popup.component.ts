import { Component, EventEmitter, Input, NgModule, Output, ViewChild } from "@angular/core";
import {
  DxButtonModule,
  DxPopupComponent,
  DxPopupModule,
  DxTextBoxComponent,
  DxTextBoxModule,
  DxValidatorComponent, DxValidatorModule
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

  @ViewChild(DxTextBoxComponent, { static: false })
  commentBox: DxTextBoxComponent;

  @ViewChild(DxValidatorComponent, { static: false })
  commentValidator: DxValidatorComponent;

  @Input() title = "";
  @Input() placeholder = "";

  @Output()
  whenValidate = new EventEmitter<string>();

  @Output()
  whenHiding = new EventEmitter<any>();

  @Output()
  whenShown = new EventEmitter<any>();

  commentValidationRules: (RangeRule | RequiredRule)[];
  validText: string;
  cancelText: string;

  async show(texts?: any) {
    if (texts.validText) this.validText = texts.validText;
    if (texts.cancelText) this.cancelText = texts.cancelText;
    await this.popupComponent.instance.show();
    if (texts.comment) this.setText(texts.comment);
  }

  setText(text: string) {
    this.commentBox.value = text;
  }

  onPopupHiding() {
    this.commentValidationRules = [];

    this.whenHiding.emit();
  }

  onHidden() {
    this.commentBox.instance.reset();
  }

  onShown() {
    this.whenShown.emit();
    this.commentBox.instance.focus();
    this.commentValidationRules = [
      { type: "required" },
      { type: "stringLength", max: 128 }
    ];
  }

  onSubmit(form: NgForm) {
    if (this.commentValidator.instance.validate().isValid) {
      this.whenValidate.emit(form.value.commentaire);
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
    DxValidatorModule,
  ],
  exports: [PromptPopupComponent],
})
export class PromptPopupModule { }
