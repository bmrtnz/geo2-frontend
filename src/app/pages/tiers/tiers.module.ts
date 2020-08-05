import {NgModule} from '@angular/core';
import {TiersRoutingModule} from './tiers-routing.module';
import {SharedModule} from '../../shared/shared.module';
import { ContactsModule } from './contacts/contacts.module';
import { NestedGuard } from 'app/shared/guards/nested-guard';

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    TiersRoutingModule,
    ContactsModule
  ],
  providers: [NestedGuard],
})
export class TiersModule { }
