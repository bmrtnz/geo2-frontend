import { NgModule } from '@angular/core';
import { NestedComponent } from './nested.component';
import { SharedModule } from 'app/shared/shared.module';
import { NestedRoutingModule } from '../nested-routing/nested-routing.module';
import { ClientsModule } from '../tiers/clients/clients.module';
import { GridNavigatorModule } from 'app/shared/components/grid-navigator/grid-navigator.component';

@NgModule({
  declarations: [NestedComponent],
  imports: [
    SharedModule,
    NestedRoutingModule,
    GridNavigatorModule,
    ClientsModule,
  ]
})
export class NestedModule { }
