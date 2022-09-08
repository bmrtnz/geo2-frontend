import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import CommandeEdi from "app/shared/models/commande-edi.model";
import { ClientsService, EntrepotsService } from "app/shared/services";
import { DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";


@Component({
  selector: "app-choix-entrepot-commande-edi-popup",
  templateUrl: "./choix-entrepot-commande-edi-popup.component.html",
  styleUrls: ["./choix-entrepot-commande-edi-popup.component.scss"]
})
export class ChoixEntrepotCommandeEdiPopupComponent implements OnChanges {

  @Input() public commandeEdi: Partial<CommandeEdi>;
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
    if (this.commandeEdi) {
      this.clientDS = this.clientsService.getDataSource_v2(["id", "raisonSocial"]);
      this.entrepotDS = this.entrepotsService.getDataSource_v2(["id", "code", "raisonSocial"]);
      this.entrepotDS.filter([
        ["valide", "=", true],
        "and",
        ["client.id", "=", this.commandeEdi.client?.id]
      ]);
    }
  }


  applyClick() {
    this.entrepotId = this.entrepotSB.value.id;
    this.entrepotChosen.emit(this.entrepotId);
    this.visible = false;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("choix-entrepot-commande-edi-popup");
    // Autocomplete
    this.entrepotDS.load().then(ent => {
      if (ent?.length === 1) this.entrepotSB.value = { id: ent[0].id };
    });
  }

  displayCodeBefore(data) {
    return data ?
      ((data.code ? data.code : data.id) + " - " + (data.nomUtilisateur ? data.nomUtilisateur :
        (data.raisonSocial ? data.raisonSocial : data.description)))
      : null;
  }

  onHidden() {
    this.clearData();
  }

  clearData() {
    this.entrepotSB.value = null;
  }

}
