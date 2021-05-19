import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrentCompanyService {

  constructor() { }

  getCompany() {
    const data = window.sessionStorage.getItem('companyStorage');
    const processedData = (data !== null) ? JSON.parse(data) : null;
    return processedData;
  }
  setCompany(societe) {
    window.sessionStorage.removeItem('openOrders');
    window.sessionStorage.setItem('companyStorage', JSON.stringify(societe));
    return;
  }

}
