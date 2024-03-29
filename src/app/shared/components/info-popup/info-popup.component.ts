import { Component, NgModule, EventEmitter, Input } from "@angular/core";
import {
  DxButtonModule,
  DxPopupModule,
  DxTemplateModule,
} from "devextreme-angular";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared.module";

@Component({
  selector: "app-info-popup",
  templateUrl: "./info-popup.component.html",
  styleUrls: ["./info-popup.component.scss"],
})
export class InfoPopupComponent {
  visible = false;
  doNavigate = new EventEmitter<boolean>();

  @Input() customText: string;

  constructor() {}

  cancelClick() {
    this.visible = false;
    this.doNavigate.emit(false);
  }

  continueClick() {
    this.visible = false;
    this.doNavigate.emit(true);
  }
  onShowing(e) {
    e.component.content().parentNode.classList.add("info-popup");
  }
}

@NgModule({
  declarations: [InfoPopupComponent],
  exports: [InfoPopupComponent],
  imports: [
    CommonModule,
    DxButtonModule,
    DxPopupModule,
    DxTemplateModule,
    SharedModule,
  ],
})
export class InfoPopupModule {}
