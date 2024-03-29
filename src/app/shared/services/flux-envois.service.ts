import { Injectable } from "@angular/core";
import notify from "devextreme/ui/notify";
import { defer, lastValueFrom, of } from "rxjs";
import { catchError, concatMap, debounceTime, filter, map } from "rxjs/operators";
import { AuthService, LocalizationService } from ".";
import { ConfirmationResultPopupComponent } from "../components/confirmation-result-popup/confirmation-result-popup.component";
import { Flux, Societe } from "../models";
import { Ordre } from "../models/ordre.model";
import { DepotEnvoisService } from "./api/depot-envois.service";
import { EnvoisService } from "./api/envois.service";
import { FunctionResult, FunctionsService } from "./api/functions.service";
import { CurrentCompanyService } from "./current-company.service";

@Injectable({
  providedIn: "root",
})
export class FluxEnvoisService {
  constructor(
    private currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
    private localizationService: LocalizationService,
    private depotEnvoisService: DepotEnvoisService,
    private envoisService: EnvoisService,
    private functionsService: FunctionsService
  ) { }

  prompt(
    fluxID: Flux["id"],
    ordreID: Ordre["id"],
    outputPopup: ConfirmationResultPopupComponent,
    annulation?: boolean
  ) {
    const societe: Societe = this.currentCompanyService.getCompany();
    const user = this.authService.currentUser;

    return defer(() => {
      switch (fluxID) {
        case "ORDRE": {
          if (annulation) return of({ data: { res: 1 } });
          return this.envoisService.fConfirmationCommande(
            ordreID,
            societe.id,
            user.nomUtilisateur
          );
        }
        case "DETAIL":
          return this.envoisService.fDocumentEnvoiDetailsExp(
            ordreID,
            societe.id
          );
        case "MINI":
          return this.envoisService.fDocumentEnvoiConfirmationPrixAchat(
            ordreID
          );
        case "FICPAO":
          return this.envoisService.fDocumentEnvoiFichesPalette(ordreID);
        case "FICPAN":
          return this.envoisService.fDocumentEnvoiGenereTraca(ordreID);
        case "BONLIV":
          return this.envoisService.fDocumentEnvoiBonLivraison(ordreID);
        case "COMINV":
          return this.envoisService.fDocumentEnvoiCominv(ordreID);
        case "BUYCO":
          return this.envoisService.fDocumentEnvoiShipmentBuyco(ordreID);
        case "CUSINV":
        case "DECBOL":
          return this.envoisService.fDocumentEnvoiFactureDouaniere(ordreID);
        case "TRACA":
          return this.pushDepotEnvoi("TRACA", ordreID), of(null);
        case "IMPORD":
          return this.pushDepotEnvoi("IMPORD", ordreID), of(null);
        // "PROFOR" | "RESLIT" | "INCLIT"
        // No initialization phase, continuing to flux selection
        case "DETAIM":
          return this.functionsService
            .geoPrepareEnvois(
              ordreID,
              "DETAIM",
              false,
              false,
              this.authService.currentUser.nomUtilisateur
            );
        //return this.envoisService.fDocumentEnvoiCominv(ordreID);
        default:
          return of({ data: { res: 1 } });
      }
    }).pipe(
      filter(result => !!result),
      map((result) => Object.values(result.data)[0]),
      concatMap(async res => {
        await lastValueFrom(this.envoisService.clearTemps(ordreID));
        return of(res);
      }),
      concatMap((response: any) => {
        if (response.res === FunctionResult.Warning)
          return outputPopup.openAs("WARNING", response.msg);
        return of(true);
      }),
      catchError((err: Error) => outputPopup.openAs("ERROR", err.message))
    );
  }

  /** Submit 'envoi' request in DB */
  public pushDepotEnvoi(
    fluxID: "TRACA" | "IMPORD" | "RECINT",
    ordreID: Ordre["id"]
  ) {
    this.depotEnvoisService
      .save(
        {
          ordre: { id: ordreID },
          fluxID,
          dateDepot: new Date().toISOString(),
          mailUtilisateur: this.authService.currentUser.email,
        },
        ["id"]
      )
      .subscribe({
        error: (err) => {
          console.log(err);
          notify({
            message: this.localizationService.localize("erreur-demande", fluxID),
            type: "error",
            displayTime: 7000
          },
            { position: 'bottom center', direction: 'up-stack' }
          )
        },
        next: (res) =>
          notify({
            message: this.localizationService.localize("demande-depot", fluxID),
            type: "success"
          },
            { position: 'bottom center', direction: 'up-stack' }
          )
      });
  }
}
