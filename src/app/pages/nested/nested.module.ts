import { NgModule } from '@angular/core';
import { NestedComponent } from './nested.component';
import { SharedModule } from 'app/shared/shared.module';
import { NestedRoutingModule } from '../nested-routing/nested-routing.module';
import { ClientsModule } from '../tiers/clients/clients.module';
import { GridNavigatorModule } from 'app/shared/components/grid-navigator/grid-navigator.component';
import { FournisseursModule } from '../tiers/fournisseurs/fournisseurs.module';
import { TransporteursModule } from '../tiers/transporteurs/transporteurs.module';
import { LieuxPassageAQuaiModule } from '../tiers/lieux-passage-a-quai/lieux-passage-a-quai.module';

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
  ]
})
export class NestedModule { }
