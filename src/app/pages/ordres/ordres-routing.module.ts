import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OrdresTabsPersistGuard } from "app/shared/guards/ordres-tabs-persist.guard";
import { RootComponent } from "./root/root.component";

const routes: Routes = [
    {
        path: ":tabid",
        component: RootComponent,
        canDeactivate: [OrdresTabsPersistGuard],
    },
    {
        path: "",
        component: RootComponent,
        canActivate: [OrdresTabsPersistGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrdresRoutingModule {}
