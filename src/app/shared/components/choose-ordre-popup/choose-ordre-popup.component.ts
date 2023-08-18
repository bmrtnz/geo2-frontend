import {
  Component,
  EventEmitter,
  NgModule,
  ViewChild,
} from "@angular/core";
import OrdresSuiviComponent, {
  OrdresSuiviModule,
} from "app/pages/ordres/suivi/ordres-suivi.component";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { SharedModule } from "app/shared/shared.module";
import {
  DxPopupComponent,
  DxPopupModule,
  DxScrollViewModule,
  DxButtonModule
} from "devextreme-angular";
import { finalize, first } from "rxjs/operators";

@Component({
  selector: "app-choose-ordre-popup",
  templateUrl: "./choose-ordre-popup.component.html",
  styleUrls: ["./choose-ordre-popup.component.scss"],
})
export class ChooseOrdrePopupComponent {
  @ViewChild(DxPopupComponent) private popup: DxPopupComponent;
  @ViewChild(OrdresSuiviComponent) private suiviComponent: OrdresSuiviComponent;

  public popupFullscreen: boolean;
  public choosed = new EventEmitter<Ordre["id"]>();
  public title: string;

  constructor(
    public localizeService: LocalizationService,
  ) {
  }

  /** Present the popup */
  public prompt() {
    this.popup.visible = true;
    return this.choosed.pipe(
      first(),
      finalize(() => (this.popup.visible = false))
    );
  }

  public onShowing(e) {
    e.component.content().parentNode.classList.add("choose-ordre-popup");
    this.title = this.localizeService.localize("choose-ordre");
  }

  public onShown() {
    this.suiviComponent.histoGrid.reload();
  }

  hidePopup() {
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

}

@NgModule({
  imports: [OrdresSuiviModule, DxPopupModule, SharedModule, DxScrollViewModule, DxButtonModule],
  declarations: [ChooseOrdrePopupComponent],
  exports: [ChooseOrdrePopupComponent],
})
export class ChooseOrdrePopupModule { }
