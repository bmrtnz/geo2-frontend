import { Injectable } from "@angular/core";
import config from "devextreme/core/config";

@Injectable({
  providedIn: "root",
})
export class CurrentCompanyService {
  constructor() { }

  getCompany() {
    const data = window.sessionStorage.getItem("companyStorage");
    const societe = data !== null ? JSON.parse(data) : null;
    if (societe) {
      this.initializeLogoAndOthers(societe);
    }
    return societe;
  }

  setCompany(societe) {
    window.sessionStorage.setItem(
      "companyStorage",
      JSON.stringify(societe),
    );
    this.initializeLogoAndOthers(societe);
    return;
  }

  initializeLogoAndOthers(societe) {
    config({ defaultCurrency: societe?.devise.id });
    const list = document.getElementsByClassName("header-logo")[0];
    document.title = "Geo2" + (societe ? " - " + societe.raisonSocial : "");
    if (list) {
      list.setAttribute(
        "style",
        "background-color: " +
        this.stringToHexaColor(societe.raisonSocial) +
        ";",
      );
    }
  }

  stringToHexaColor(str) {
    // Converts any string into a specific hex color #XXXXXX
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      // eslint-disable-next-line no-bitwise
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // eslint-disable-next-line no-bitwise
    const color = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#000000".substring(0, 7 - color.length) + color;
  }
}
