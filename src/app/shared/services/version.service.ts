import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import packageData from "../../../../package.json";

@Injectable({
  providedIn: "root",
})
export class VersionService {
  getLabel() {
    return environment.production
      ? `v ${packageData.version}`
      : `version de dév. ( ${packageData.version} )`;
  }

  getShortLabel() {
    return `v ${packageData.version}`;
  }

  updateCopyrightTextDisplay() {
    if (window.sessionStorage.getItem("HideMainDrawer") !== "true") {
      document.querySelector(".copyright-label")?.classList.add("copyright-labels-full-opacity");
      document.querySelector(".copyright-short-label")?.classList.remove("copyright-labels-full-opacity");
    } else {
      document.querySelector(".copyright-label")?.classList.remove("copyright-labels-full-opacity");
      document.querySelector(".copyright-short-label")?.classList.add("copyright-labels-full-opacity");
    }
  }

}
