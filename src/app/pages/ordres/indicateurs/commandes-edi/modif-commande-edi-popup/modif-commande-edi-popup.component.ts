import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent } from "devextreme-angular";
import GridModifCommandeEdiComponent from "../grid-modif-commande-edi/grid-modif-commande-edi.component";

@Component({
  selector: "app-modif-commande-edi-popup",
  templateUrl: "./modif-commande-edi-popup.component.html",
  styleUrls: ["./modif-commande-edi-popup.component.scss"],
})
export class ModifCommandeEdiPopupComponent implements OnChanges {
  @Input() public commandeEdiId: string;
  @Input() public commandeId: string;
  @Input() public showMode: boolean;
  @Input() public canalCde: string;
  @Input() public gridCommandes;
  @Input() public articleRowKey;
  @Input() public single;
  @Input() public fullOrderNumber;
  @Input() public allowMutations;
  @Input() public histoLigneOrdreText;
  @Input() public histoLigneOrdreReadOnlyText;
  @Input() public ordre

  @Output() public ordreEdiId: string;
  @Output() public ordreId: string;
  @Output() refreshGrid = new EventEmitter();
  @Output() gridTitle = "";
  @Output() public lignesChanged = new EventEmitter();

  @ViewChild(GridModifCommandeEdiComponent) public gridComponent: GridModifCommandeEdiComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  public visible: boolean;
  public popupFullscreen: boolean;
  public titleStart: string;
  public titleMid: string;
  public titleEnd: string;

  constructor(
    private localizeService: LocalizationService
  ) { }

  ngOnChanges() {
    this.ordreEdiId = this.commandeEdiId;
    this.ordreId = this.commandeId;
    this.setTitle();
  }

  setTitle() {
    if (this.showMode) {
      this.titleStart = `${this.localizeService.localize("commande")} ${this.canalCde}`;
      if (this.commandeEdiId) this.titleMid = " n° " + this.commandeEdiId;
      this.titleEnd = `- ${this.localizeService.localize('click-ordre-row')}`;
    } else {
      this.titleStart = this.localizeService.localize("ordre-edi-modification");
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("modif-commande-edi-popup");
  }

  onShown() {
    this.gridComponent.enableFilters();
  }

  hidePopup() {
    this.gridComponent.datagrid.dataSource = null;
    this.gridComponent.ediLigneIdSelected = null;
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  onLignesChanged(e) {
    this.lignesChanged.emit(e);
  }

  clotureOrdreEdi() {
    this.refreshGrid.emit();
    this.visible = false;
  }
}
