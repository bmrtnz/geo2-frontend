import { Injectable } from "@angular/core";
// tslint:disable-next-line: max-line-length
import { GridsService } from "app/pages/ordres/grids.service";
import notify from "devextreme/ui/notify";
import { defer, of } from "rxjs";
import { catchError, concatMap, map } from "rxjs/operators";
import { AuthService } from ".";
import { ConfirmationResultPopupComponent } from "../components/confirmation-result-popup/confirmation-result-popup.component";
import { Flux, Societe } from "../models";
import { Ordre } from "../models/ordre.model";
import { DepotEnvoisService } from "./api/depot-envois.service";
import { EnvoisService } from "./api/envois.service";
import { FunctionResult } from "./api/functions.service";
import { CurrentCompanyService } from "./current-company.service";

@Injectable({
  providedIn: "root",
})
export class FluxEnvoisService {
  constructor(
    private currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
    private depotEnvoisService: DepotEnvoisService,
    private envoisService: EnvoisService
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
        case "DECBOL":
          return this.envoisService.fDocumentEnvoiDeclarationBollore(ordreID);
        case "TRACA":
          return this.pushDepotEnvoi("TRACA", ordreID), of(null);
        case "IMPORD":
          return this.pushDepotEnvoi("IMPORD", ordreID), of(null);
        // "CUSINV" | "PROFOR" | "RESLIT" | "INCLIT"
        // No initialization phase, continuing to flux selection
        default:
          return of({ data: { res: 1 } });
      }
    }).pipe(
      map((result) => Object.values(result.data)[0]),
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
        error: (err) =>
          notify(`Erreur de demande de dépôt pour le flux ${fluxID}`, "error"),
        next: (res) =>
          notify(`Demande de dépôt pour le flux ${fluxID} déposée`, "success"),
      });
  }
}
