import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OrdresTabsPersistGuard } from "app/shared/guards/ordres-tabs-persist.guard";
import { GridCommandesComponent } from "./grid-commandes/grid-commandes.component";
import { RootComponent } from "./root/root.component";

const routes: Routes = [
  {
    path: "commandes/:ordre_id",
    component: GridCommandesComponent,
  },
  {
    path: ":tabid",
    component: RootComponent,
    canActivate: [OrdresTabsPersistGuard],
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
