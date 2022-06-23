import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class BrowserService {

  constructor() { }

  /**
   * Open wiki on tiers section with given element path.
   *
   * Exemple : "Transporteurs"
   */
  openWiki(element) {
    const baseUrl = "http://svr_wiki:8080/xwiki/bin/view/GEO TIERS/";

    window.open(encodeURI(`${baseUrl}${element}`), "_blank");
  }

}
