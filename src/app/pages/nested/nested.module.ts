import { NgModule } from "@angular/core";
import { NestedComponent } from "./nested.component";
import { SharedModule } from "app/shared/shared.module";
import { NestedRoutingModule } from "./nested-routing.module";
import { ClientsModule } from "../tiers/clients/clients.module";
import { GridNavigatorModule } from "app/shared/components/grid-navigator/grid-navigator.component";
import { FournisseursModule } from "../tiers/fournisseurs/fournisseurs.module";
import { TransporteursModule } from "../tiers/transporteurs/transporteurs.module";
import { LieuxPassageAQuaiModule } from "../tiers/lieux-passage-a-quai/lieux-passage-a-quai.module";
import { ArticlesModule } from "../articles/articles.module";
import { TiersModule } from "../tiers/tiers.module";
import { EntrepotsModule } from "../tiers/entrepots/entrepots.module";
import { EditingGuard } from "app/shared/guards/editing-guard";

@NgModule({
  declarations: [NestedComponent],
  imports: [
    SharedModule,
    NestedRoutingModule,
    GridNavigatorModule,
    ClientsModule,
    FournisseursModule,
    TransporteursModule,
    LieuxPassageAQuaiModule,
    ArticlesModule,
    TiersModule,
    EntrepotsModule,
  ],
  providers: [EditingGuard],
})
export class NestedModule {}
