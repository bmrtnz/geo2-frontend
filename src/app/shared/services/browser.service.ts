import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class BrowserService {
  constructor() { }

  /**
   * Open wiki on tiers section with given element path.
   *
   * Exemple : "Transporteurs"
   */
  openWiki(element) {
    const baseUrl = "http://svr_wiki:8080/xwiki/bin/view/GEO 2/GEO TIERS/";

    window.open(encodeURI(`${baseUrl}${element}`), "_blank");
  }

  openWikiMain() {
    const baseUrl = "http://svr_wiki:8080/xwiki/wiki/geo/view/Main/";

    window.open(encodeURI(`${baseUrl}`), "_blank");
  }

}
