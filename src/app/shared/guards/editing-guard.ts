import { Injectable } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import {
    ActivatedRouteSnapshot,
    CanDeactivate,
    RouterStateSnapshot,
} from "@angular/router";
import { tap } from "rxjs/operators";
import { EditingAlertComponent } from "../components/editing-alert/editing-alert.component";

export interface Editable {
    editing: boolean;
    alertComponent: EditingAlertComponent;
    formGroup: UntypedFormGroup;
}

@Injectable()
export class EditingGuard implements CanDeactivate<Editable> {
    private lastUrl = "";

    canDeactivate(
        component: Editable,
        currentRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ) {
        if (
            !component.editing ||
            component.formGroup.pristine ||
            state.url === this.lastUrl
        )
            return true;
        component.alertComponent.visible = true;
        return component.alertComponent.doNavigate
            .asObservable()
            .pipe(tap((value) => value && (this.lastUrl = state.url)));
    }
}
