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
  @Input() public disabledButtons: string[];
  @Input() public noMinimizeButton: boolean;
  @Input() public popup;
  @Output() public changeSize = new EventEmitter();
  @Output() public closePopup = new EventEmitter();

  private restPositions = ["right bottom", "center"];
  private reducedHeight = 64;
  private initialHeight;
  public minimized: boolean;

  constructor() { }

  minimizePopup(fullscreen: boolean = false) {
    this.minimized = !this.minimized;
    this.changeSize.emit(this.minimized);
    if (this.minimized) this.initialHeight = this.popup.popup.instance.option("height");
    this.popup.popup.instance.option("height", this.minimized ? this.reducedHeight : this.initialHeight);
    this.popup.popupFullscreen = fullscreen;
    setTimeout(() => {
      const pos = this.minimized ? 0 : 1;
      this.popup.popup.instance.option({
        position: { my: this.restPositions[pos], at: this.restPositions[pos] },
        height: this.minimized ? this.reducedHeight : this.initialHeight
      });
    });
  }

  resizePopup() {
    this.popup.popupFullscreen = !this.popup.popupFullscreen;
    if (this.popup.popupFullscreen && this.minimized) this.minimizePopup(true);
    if (this.popup.popupFullscreen) {
      this.popup.popup.instance.option({
        position: { my: this.restPositions[1], at: this.restPositions[1] },
      });
    }
  }

  quitPopup() {
    this.minimized = false;
    this.closePopup.emit();
    // Restoring state when hidden
    setTimeout(() => {
      this.popup.popup.instance.option({
        position: { my: this.restPositions[1], at: this.restPositions[1] },
        height: this.initialHeight
      });
    }, 500);
  }

}

@NgModule({
  imports: [DxButtonModule, CommonModule, SharedModule],
  declarations: [TopRightPopupButtonsComponent],
  exports: [TopRightPopupButtonsComponent],
})
export class TopRightPopupButtonsModule { }
