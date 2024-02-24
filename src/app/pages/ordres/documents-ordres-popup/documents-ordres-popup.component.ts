import {
  Component,
  EventEmitter,
  Input,
  OnChanges, Output,
  ViewChild
} from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { DxPopupComponent } from "devextreme-angular";
import { confirm } from "devextreme/ui/dialog";
import { lastValueFrom } from "rxjs";
import { GridChoixEnvoisComponent } from "../grid-choix-envois/grid-choix-envois.component";
import { GridEnvoisComponent } from "../grid-envois/grid-envois.component";
import { GridsService } from "../grids.service";
import notify from "devextreme/ui/notify";
import hideToasts from "devextreme/ui/toast/hide_toasts";

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
  public running: boolean;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(GridChoixEnvoisComponent)
  gridChoixEnvoisComponent: GridChoixEnvoisComponent;

  constructor(
    public localizeService: LocalizationService,
    private envoisService: EnvoisService,
    public gridsService: GridsService,
  ) { }

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
    this.gridChoixEnvoisComponent.canBeSent = false;
    this.popup.instance.hide();
    this.whenDone.emit();
  }

  onShowing(e) {
    this.closeConfirm = false;
    this.running = false;
    e.component.content().parentNode.classList.add("documents-ordres-popup");
  }

  onShown(e) {
    this.gridChoixEnvoisComponent.reload(this.annuleOrdre);
  }

  async onHiding(event) {
    if (!this.closeConfirm) {
      event.cancel = true; // cancel popup hiding

      const result = confirm(
        this.localizeService.localize("text-popup-annuler-envoi-docs"),
        "Génération des envois"
      );

      this.closeConfirm = await result;
      if (this.closeConfirm) {
        await lastValueFrom(this.envoisService.clearTemps(this.ordre.id));
        this.hidePopup();
      }
    }
  }

  async goDocuments() {
    this.running = true;
    await this.gridsService.waitUntilAllGridDataSaved(this.gridChoixEnvoisComponent?.dataGrid, true);
    notify({
      message: this.localizeService.localize("document-creating-process"),
      displayTime: 999999
    },
      { position: 'bottom center', direction: 'up-stack' }
    );
    this.gridChoixEnvoisComponent.done().subscribe({
      next: () => {
        this.closeConfirm = true; // Force close popup without confirmation
        hideToasts();
        notify({
          message: this.localizeService.localize("documents-created"),
          type: "success"
        },
          { position: 'bottom center', direction: 'up-stack' }
        );
        this.hidePopup();
        this.gridEnvois?.reload();
      },
      error: (error: Error) => {
        this.running = false;
        hideToasts();
        console.log(error);
        notify({
          message: error.message.replace("Error :", ""),
          type: "error",
          displayTime: 7000
        },
          { position: 'bottom center', direction: 'up-stack' }
        );
      }
    });
  }

  public async open() {
    await this.popup.instance.show();
  }
}
