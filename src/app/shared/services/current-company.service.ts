import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrentCompanyService {

  constructor() { }

    getCompany() {
      let data = window.localStorage.getItem('companyStorage');
      const processedData = (data !== null) ? JSON.parse(data) : null;
      return processedData;
    }
    setCompany(societe) {
      window.localStorage.setItem('companyStorage', JSON.stringify(societe));
      return;
    }

}
