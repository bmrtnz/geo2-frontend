import { DatePipe } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { GraphQLModule } from "./graphql.module";
import { AuthService, ScreenService } from "./shared/services";
import { OrdresIndicatorsService } from "./shared/services/ordres-indicators.service";
import { SharedModule } from "./shared/shared.module";

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        SharedModule,
        AppRoutingModule,
        GraphQLModule,
        HttpClientModule,
    ],
    exports: [],
    providers: [AuthService, ScreenService, DatePipe, OrdresIndicatorsService],
    bootstrap: [AppComponent],
})
export class AppModule {}
