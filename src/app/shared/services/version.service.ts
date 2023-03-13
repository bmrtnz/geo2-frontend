import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { version } from "../../../../package.json";

@Injectable({
  providedIn: "root"
})
export class VersionService {
  getLabel() {
    return environment.production ? `v ${version}` : `version de développement ( ${version} )`;
  }
}
