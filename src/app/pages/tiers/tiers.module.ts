import {NgModule} from '@angular/core';

import {TiersRoutingModule} from './tiers-routing.module';
import {SharedModule} from '../../shared/shared.module';
import { ContactsModule } from './contacts/contacts.module';
import {ClientsModule} from './clients/clients.module';


@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    TiersRoutingModule,
    ClientsModule,
    ContactsModule
  ]
})
export class TiersModule { }
