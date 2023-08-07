import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent } from "devextreme-angular";
import { confirm } from "devextreme/ui/dialog";
import { GridChoixEnvoisComponent } from "../grid-choix-envois/grid-choix-envois.component";
import { GridEnvoisComponent } from "../grid-envois/grid-envois.component";

@Component({
  selector: "app-documents-ordres-popup",
  templateUrl: "./documents-ordres-popup.component.html",
  styleUrls: ["./documents-ordres-popup.component.scss"],
})
export class DocumentsOrdresPopupComponent implements OnChanges {
  @Input() public ordre: Partial<Ordre>;
  @Input() public flux: string;
  @Input() public gridEnvois: GridEnvoisComponent;
  @Output() public annuleOrdre: boolean;
  @Output() public currOrdre: Partial<Ordre>;
  @Output() public whenDone = new EventEmitter();

  public visible: boolean;
  public closeConfirm = false;
  public titleStart: string;
  public titleEnd: string;
  public popupFullscreen: boolean;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(GridChoixEnvoisComponent)
  gridChoixEnvoisComponent: GridChoixEnvoisComponent;

  constructor(public localizeService: LocalizationService) { }

  ngOnChanges() {
    this.setTitle();
    this.currOrdre = this.ordre;
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("documents-ordres");
    if (!this.ordre) return;
    this.titleEnd =
      this.ordre.numero +
      " - " +
      this.localizeService.localize("tiers-contacts-flux") +
      " " +
      this.flux;
  }

  async hidePopup() {
    this.popup.instance.hide();
    this.whenDone.emit();
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  onShowing(e) {
    this.closeConfirm = false;
    e.component.content().parentNode.classList.add("documents-ordres-popup");
  }

  onShown(e) {
    this.gridChoixEnvoisComponent.reload(this.annuleOrdre);
  }

  async onHiding(event) {
    if (!this.closeConfirm) {
      console.log("hiding ?")
      event.cancel = true; // cancel popup hiding

      const result = confirm(
        this.localizeService.localize("text-popup-annuler-envoi-docs"),
        "Génération des envois"
      );

      this.closeConfirm = await result;
      if (this.closeConfirm) {
        await this.gridChoixEnvoisComponent.clearTemps();
        this.hidePopup();
      }
    }
  }

  goDocuments() {
    this.gridChoixEnvoisComponent.done().subscribe({
      complete: () => {
        this.closeConfirm = true; // Force close popup without confirmation
        this.hidePopup();
        this.gridEnvois?.reload();
      },
    });
  }

  public async open() {
    await this.popup.instance.show();
  }
}
