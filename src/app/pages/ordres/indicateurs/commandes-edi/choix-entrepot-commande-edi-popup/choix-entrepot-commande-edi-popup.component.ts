import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";

import { ClientsService, EntrepotsService } from "app/shared/services";
import { DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";

@Component({
  selector: "app-choix-entrepot-commande-edi-popup",
  templateUrl: "./choix-entrepot-commande-edi-popup.component.html",
  styleUrls: ["./choix-entrepot-commande-edi-popup.component.scss"],
})
export class ChoixEntrepotCommandeEdiPopupComponent implements OnChanges {
  @Input() public clientId: string;
  @Input() public title: string;
  @Output() public entrepotChosen = new EventEmitter();

  visible: boolean;
  clientDS: DataSource;
  entrepotDS: DataSource;
  entrepotId: string;

  @ViewChild("clientSB", { static: false }) clientSB: DxSelectBoxComponent;
  @ViewChild("entrepotSB", { static: false }) entrepotSB: DxSelectBoxComponent;

  constructor(
    private clientsService: ClientsService,
    private entrepotsService: EntrepotsService
  ) { }

  ngOnChanges() {
    if (this.clientId) {
      this.clientDS = this.clientsService.getDataSource_v2([
        "id",
        "code",
        "raisonSocial"
      ]);
    }
  }

  applyClick() {
    this.entrepotChosen.emit(this.entrepotSB.value);
    this.visible = false;
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("choix-entrepot-commande-edi-popup");
    this.entrepotDS = this.entrepotsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "instructionLogistique"
    ]);
    this.entrepotDS.filter([
      ["valide", "=", true],
      "and",
      ["client.id", "=", this.clientId],
    ]);
  }

  displayCodeBefore(data) {
    return data
      ? (data.code ? data.code : data.id) +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  onHidden() {
    this.clearData();
  }

  clearData() {
    this.entrepotSB.value = null;
    this.entrepotDS = null;
  }
}
