import {NgModule} from '@angular/core';

import {TiersRoutingModule} from './tiers-routing.module';
import {SharedModule} from '../../shared/shared.module';
import { ContactsModule } from './contacts/contacts.module';


@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    TiersRoutingModule,
    ContactsModule
  ]
})
export class TiersModule { }
