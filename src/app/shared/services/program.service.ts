import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { AuthService } from "./auth.service";
import { CurrentCompanyService } from "./current-company.service";

export enum Program {
  TESCO = "tesco",
  ORCHARD = "orchard",
}

export const SUPPORTED_MIMES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

@Injectable({
  providedIn: "root"
})
export class ProgramService {

  constructor(
    private currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
  ) { }

  /** Name of the body parameter in the backend */
  public static bodyName = "chunk";

  /** Build the `accept` header */
  public static buildAccept(): string {
    return SUPPORTED_MIMES.join();
  }

  /** Build the download URL */
  public static buildDownloadUrl(): string {
    return `${environment.apiEndpoint}/program/download`;
  }

  /** Try downloadind the last processed program with browser save dialog */
  public static downloadAndSave() {
    const aElm = document.createElement("a");
    aElm.href = ProgramService.buildDownloadUrl();
    aElm.click();
  }

  /** Congifure extra Http request parameters */
  public static setupUploadRequest(request: XMLHttpRequest) {
    request.withCredentials = true;
    request.responseType = "json";
  }

  /** Build the import URL that match the program */
  public static buildImportUrl(program: Program): string {
    return encodeURI(`${environment.apiEndpoint}/program/${program.toString()}`);
  }

  /** Build extra upload data */
  public buildCustomData(genericEntrepot: boolean) {
    const societe = this.currentCompanyService.getCompany().id;
    const utilisateur = this.authService.currentUser.nomUtilisateur;
    return {
      societe,
      utilisateur,
      genericEntrepot: genericEntrepot.toString(),
    };
  }

}
