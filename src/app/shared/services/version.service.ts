import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import packageData from "../../../../package.json";

@Injectable({
  providedIn: "root"
})
export class VersionService {
  getLabel() {
    return environment.production ? `v ${packageData.version}` : `version de développement ( ${packageData.version} )`;
  }
}
