import { Component, EventEmitter, Input, NgModule, ViewChild } from "@angular/core";
import { LocalizePipe } from "app/shared/pipes";
import { SharedModule } from "app/shared/shared.module";
import { DxButtonModule, DxPopupComponent, DxPopupModule } from "devextreme-angular";

@Component({
  selector: "app-question-popup",
  templateUrl: "./question-popup.component.html",
  styleUrls: ["./question-popup.component.scss"]
})
export class QuestionPopupComponent {

  @ViewChild(DxPopupComponent) private popup: DxPopupComponent;
  public question: string;
  private response = new EventEmitter<boolean>();

  /** Present the popup */
  public prompt(question: string) {
    this.popup.visible = true;
    this.question = question;
    return this.response.asObservable();
  }

  public onSelectClick() {
    this.popup.visible = false;
    this.response.emit(true);
  }

  public onCancelClick() {
    this.popup.visible = false;
    this.response.emit(false);
  }

}

@NgModule({
  imports: [
    DxPopupModule,
    DxButtonModule,
    SharedModule,
  ],
  providers: [LocalizePipe],
  declarations: [QuestionPopupComponent],
  exports: [QuestionPopupComponent],
})
export class QuestionPopupModule { }
