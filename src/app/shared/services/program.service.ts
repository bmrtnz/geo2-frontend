import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

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

  /** Name of the body parameter in the backend */
  public static bodyName = "chunk";

  /** Build the import URL that match the program */
  public static buildImportUrl(program: Program): string {
    return `${environment.apiEndpoint}/program/${program.toString()}`;
  }

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

}
