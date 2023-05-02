import { Component, NgModule, EventEmitter } from "@angular/core";
import {
  DxButtonModule,
  DxPopupModule,
  DxTemplateModule,
} from "devextreme-angular";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-editing-alert",
  templateUrl: "./editing-alert.component.html",
  styleUrls: ["./editing-alert.component.scss"],
})
export class EditingAlertComponent {
  visible = false;
  doNavigate = new EventEmitter<boolean>();

  constructor() {}

  cancelClick() {
    this.visible = false;
    this.doNavigate.emit(false);
  }

  continueClick() {
    this.visible = false;
    this.doNavigate.emit(true);
  }
}

@NgModule({
  imports: [CommonModule, DxButtonModule, DxPopupModule, DxTemplateModule],
  declarations: [EditingAlertComponent],
  exports: [EditingAlertComponent],
})
export class EditingAlertModule {}
