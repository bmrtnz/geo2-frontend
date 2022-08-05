import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { PagesComponent } from "./pages.component";

const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "home",
  },
  {
    path: "",
    component: PagesComponent,
    children: [
      {
        path: "nested",
        loadChildren: () => import("./nested/nested.module").then(m => m.NestedModule),
      },
      {
        path: "tiers",
        loadChildren: () => import("./tiers/tiers.module").then(m => m.TiersModule),
      },
      {
        path: "articles",
        loadChildren: () => import("./articles/articles.module").then(m => m.ArticlesModule),
      },
      {
        path: "ordres",
        loadChildren: () => import("./ordres/ordres.module").then(m => m.OrdresModule),
      },
      {
        path: "stock",
        loadChildren: () => import("./stock/stock.module").then(m => m.StockModule),
      },
      {
        path: "home",
        component: HomeComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), CommonModule],
})
export class PagesRoutingModule { }
