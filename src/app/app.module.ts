import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SideNavOuterToolbarModule, SingleCardModule} from './layouts';
import {FooterModule, LoginFormModule} from './shared/components';
import {AuthService, ScreenService} from './shared/services';
import {SharedModule} from './shared/shared.module';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    AppRoutingModule,
    SideNavOuterToolbarModule,
    SingleCardModule,
    FooterModule,
    LoginFormModule,
    GraphQLModule,
    HttpClientModule
  ],
  exports: [],
  providers: [AuthService, ScreenService],
  bootstrap: [AppComponent]
})
export class AppModule { }
