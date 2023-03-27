import { Component, EventEmitter, HostListener, NgModule, Output, ViewChild } from "@angular/core";
import { OrdresModule } from "app/pages/ordres/ordres.module";
import OrdresSuiviComponent, { OrdresSuiviModule } from "app/pages/ordres/suivi/ordres-suivi.component";
import Ordre from "app/shared/models/ordre.model";
import { SharedModule } from "app/shared/shared.module";
import { DxPopupComponent, DxPopupModule, DxScrollViewModule } from "devextreme-angular";
import { EMPTY, of } from "rxjs";
import { concatMap, finalize, first, tap } from "rxjs/operators";

@Component({
  selector: "app-choose-ordre-popup",
  templateUrl: "./choose-ordre-popup.component.html",
  styleUrls: ["./choose-ordre-popup.component.scss"]
})
export class ChooseOrdrePopupComponent {
  @ViewChild(DxPopupComponent) private popup: DxPopupComponent;
  @ViewChild(OrdresSuiviComponent) private suiviComponent: OrdresSuiviComponent;
  protected choosed = new EventEmitter<Ordre["id"]>();

  /** Present the popup */
  public prompt() {
    this.popup.visible = true;
    return this.choosed.pipe(
      first(),
      finalize(() => this.popup.visible = false),
    );
  }

  protected onShowing() {
    this.suiviComponent.histoGrid.reload();
  }

}

@NgModule({
  imports: [
    OrdresSuiviModule,
    DxPopupModule,
    SharedModule,
    DxScrollViewModule,
  ],
  declarations: [ChooseOrdrePopupComponent],
  exports: [ChooseOrdrePopupComponent],
})
export class ChooseOrdrePopupModule { }
