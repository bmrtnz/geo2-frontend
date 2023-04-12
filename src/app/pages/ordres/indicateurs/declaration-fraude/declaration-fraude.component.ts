import { Component, OnInit } from "@angular/core";
import { BureauAchat, Client, Entrepot, Fournisseur, Secteur, Transporteur } from "app/shared/models";
import { ClientsService, EntrepotsService, FournisseursService, TransporteursService } from "app/shared/services";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";

@Component({
  selector: "app-declaration-fraude",
  templateUrl: "./declaration-fraude.component.html",
  styleUrls: ["./declaration-fraude.component.scss"]
})
export class DeclarationFraudeComponent {

  public preFilterData: {
    secteur?: Secteur["id"],
    client?: Client["id"],
    entrepot?: Entrepot["id"],
    transport?: Transporteur["id"],
    bureauAchat?: BureauAchat["id"],
    fourni?: Fournisseur["id"],
    dateDebut?: Date,
    dateFin?: Date,
    periode?,
  } = {
      dateDebut: this.dateManagementService.startOfDay(),
      dateFin: this.dateManagementService.endOfDay(),
    };

  public periodes: string[];

  public secteurLookupStore = this.secteursService
    .getLookupStore(["id"], "valide==true");
  public clientLookupStore = this.clientsService
    .getLookupStore(["id", "code"], `valide==true and societe.id == ${this.currentCompanyService.getCompany().id}`);
  public entrepotLookupStore = this.entrepotsService
    .getLookupStore(["id", "code"], `valide==true and societe.id == ${this.currentCompanyService.getCompany().id}`);
  public transportLookupStore = this.transporteursService
    .getLookupStore(["id"], `valide==true`);
  public bureauAchatLookupStore = this.bureauxAchatService
    .getLookupStore(["id"], `valide==true`);
  public fournisseurLookupStore = this.fournisseursService
    .getLookupStore(["id", "code"], `valide==true`);

  constructor(
    public currentCompanyService: CurrentCompanyService,
    public secteursService: SecteursService,
    public clientsService: ClientsService,
    public entrepotsService: EntrepotsService,
    public transporteursService: TransporteursService,
    public bureauxAchatService: BureauxAchatService,
    public fournisseursService: FournisseursService,
    private dateManagementService: DateManagementService,
  ) {
    [
      this.clientLookupStore,
      this.entrepotLookupStore,
      this.fournisseurLookupStore,
    ].forEach(storeConfig => {
      storeConfig.sort = [{ selector: "code" }];
    });
    this.periodes = this.dateManagementService.periods();
  }

  public applyPrefilter(event) {
    console.log(this.preFilterData);
  }

  setDates(e) {
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;

    const datePeriod = this.dateManagementService.getDates(e);

    this.preFilterData.dateDebut = datePeriod.dateDebut;
    this.preFilterData.dateFin = datePeriod.dateFin;
  }


  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = this.preFilterData.dateDebut;
    const fin = this.preFilterData.dateFin;
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains("dateStart")) {
        this.preFilterData.dateFin = this.dateManagementService.endOfDay(deb);
      } else {
        this.preFilterData.dateDebut = this.dateManagementService.startOfDay(fin);
      }
    }
    this.preFilterData.periode = null;
  }

}

export default DeclarationFraudeComponent;
