import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateManagementService {

  constructor() { }

  friendlyDate(theDate) {
    // e.g. 17/09/2020 (11h37 44s)
    const mydate = new Date(theDate);
    const myTime = mydate.toLocaleTimeString().replace(':', 'h').replace(':', ' ') + 's';
    return mydate.toLocaleDateString() + '  (' + myTime + ')';
  }

}
