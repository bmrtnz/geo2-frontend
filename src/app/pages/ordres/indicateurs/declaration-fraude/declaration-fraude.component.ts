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
    secteur?: Partial<Secteur>,
    client?: Partial<Client>,
    entrepot?: Partial<Entrepot>,
    transporteur?: Partial<Transporteur>,
    bureauAchat?: Partial<BureauAchat>,
    fournisseur?: Partial<Fournisseur>,
    dateDepartPrevue?: Date,
    dateLivraisonPrevue?: Date,
    dateModification?: Date,
    periode?,
  } = {
      dateDepartPrevue: this.dateManagementService.startOfDay(),
      dateLivraisonPrevue: this.dateManagementService.endOfDay(),
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

    this.preFilterData.dateDepartPrevue = datePeriod.dateDebut;
    this.preFilterData.dateLivraisonPrevue = datePeriod.dateFin;
  }


  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = this.preFilterData.dateDepartPrevue;
    const fin = this.preFilterData.dateLivraisonPrevue;
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains("dateStart")) {
        this.preFilterData.dateLivraisonPrevue = this.dateManagementService.endOfDay(deb);
      } else {
        this.preFilterData.dateDepartPrevue = this.dateManagementService.startOfDay(fin);
      }
    }
    this.preFilterData.periode = null;
  }

}

export default DeclarationFraudeComponent;
