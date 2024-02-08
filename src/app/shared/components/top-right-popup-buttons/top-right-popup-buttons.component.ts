import { Component, EventEmitter, Input, NgModule, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DxButtonModule } from "devextreme-angular";
import { SharedModule } from "app/shared/shared.module";

@Component({
  selector: "app-top-right-popup-buttons",
  templateUrl: "top-right-popup-buttons.component.html",
  styleUrls: ["./top-right-popup-buttons.component.scss"],
})
export class TopRightPopupButtonsComponent {

  @Input() public noCloseButton: boolean;
  @Input() public noResizeButton: boolean;
  @Input() public popupFullscreen: boolean;
  @Output() public closePopup = new EventEmitter();
  @Output() public resizePopup = new EventEmitter();

  constructor() { }
}

@NgModule({
  imports: [DxButtonModule, CommonModule, SharedModule],
  declarations: [TopRightPopupButtonsComponent],
  exports: [TopRightPopupButtonsComponent],
})
export class TopRightPopupButtonsModule { }
