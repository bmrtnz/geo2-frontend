import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

export enum Program {
  TESCO = "tesco",
  ORCHARD = "orchard",
}

@Injectable({
  providedIn: "root"
})
export class ProgramService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  private static buildUrl(program: Program): string {
    return `${environment.apiEndpoint}/program/${program}`;
  }

  public fetch(program: Program, body) {
    return this.httpClient.post(ProgramService.buildUrl(program), body, {
      withCredentials: true,
    });
  }

}
