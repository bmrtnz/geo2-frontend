import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadsavedatagridstateService {

  constructor() { }

  loadGenericDataGridState() {
    const data = window.localStorage.getItem('fournisseurStorage');
    console.log('load')
    console.log(JSON.parse(data))
    if (data !== null) {

      // Suppression filtres/recherche
      const state = JSON.parse(data);
      for (const myColumn of state.columns) {
        if (myColumn.dataField !== 'valide') {myColumn.filterValue = null;}
      }
      state.searchText = '';

      return state;
    } else {
      return null;
    }

  }

  saveGenericDataGridState(data) {
    window.localStorage.setItem('fournisseurStorage', JSON.stringify(data));
    console.log('save')
    console.log(data)
  }

}
