import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { EditingAlertComponent } from '../components/editing-alert/editing-alert.component';

export interface Editable {
  editing: boolean;
  alertComponent: EditingAlertComponent;
}

@Injectable()
export class EditingGuard implements CanDeactivate<any> {

  constructor() {}

  canDeactivate( component: Editable ) {
    if (!component.editing) return true;
    component.alertComponent.visible = true;
    return component.alertComponent.doNavigate.asObservable();
  }

}
