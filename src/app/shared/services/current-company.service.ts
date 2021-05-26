import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrentCompanyService {

  constructor() { }

  getCompany() {
    const data = window.sessionStorage.getItem('companyStorage');
    const processedData = (data !== null) ? JSON.parse(data) : null;
    if (processedData) {this.showCompanyColorOnLogo(processedData);}
    return processedData;
  }
  
  setCompany(societe) {
    window.sessionStorage.removeItem('openOrders');
    window.sessionStorage.setItem('companyStorage', JSON.stringify(societe));
    this.showCompanyColorOnLogo(societe)
    return;
  }

  showCompanyColorOnLogo(societe) {
    const list = document.getElementsByClassName('header-logo')[0];
    if (list) {
      list.setAttribute("style", "background-color: " + this.stringToHexaColor(societe.raisonSocial) + ";");
    }
  }

  stringToHexaColor(str) { // Converts any string into a specific hex color #XXXXXX
    let hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = (hash & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();
    return "#000000".substring(0, 7 - color.length) + color;
  } 

}
