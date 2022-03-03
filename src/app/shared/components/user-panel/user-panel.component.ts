import { Component, Input, NgModule, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DxListModule } from "devextreme-angular/ui/list";
import { DxContextMenuModule } from "devextreme-angular/ui/context-menu";
import { AuthService } from "app/shared/services";
import { Utilisateur } from "app/shared/models/utilisateur.model";

@Component({
    selector: "app-user-panel",
    templateUrl: "user-panel.component.html",
    styleUrls: ["./user-panel.component.scss"],
})
export class UserPanelComponent {
    @Input()
    menuItems: any;

    @Input()
    menuMode: string;

    constructor(public authService: AuthService) {}
}

@NgModule({
    imports: [DxListModule, DxContextMenuModule, CommonModule],
    declarations: [UserPanelComponent],
    exports: [UserPanelComponent],
})
export class UserPanelModule {}
