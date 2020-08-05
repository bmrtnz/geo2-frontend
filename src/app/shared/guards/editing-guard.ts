import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { EditingAlertComponent } from '../components/editing-alert/editing-alert.component';
import { FormGroup } from '@angular/forms';

export interface Editable {
  editing: boolean;
  alertComponent: EditingAlertComponent;
  formGroup: FormGroup;
}

@Injectable()
export class EditingGuard implements CanDeactivate<Editable> {

  constructor() {}

  canDeactivate( component: Editable ) {
    if (!component.editing || component.formGroup.pristine) return true;
    component.alertComponent.visible = true;
    return component.alertComponent.doNavigate.asObservable();
  }

}
