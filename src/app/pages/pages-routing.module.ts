import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PagesComponent } from './pages.component';

const routes: Routes = [
    {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: 'nested',
        loadChildren: './nested/nested.module#NestedModule',
      },
      {
        path: 'tiers',
        loadChildren: './tiers/tiers.module#TiersModule'
      },
      {
        path: 'articles',
        loadChildren: './articles/articles.module#ArticlesModule',
      },
      {
        path: 'ordres',
        loadChildren: './ordres/ordres.module#OrdresModule'
      },
      {
        path: 'stock',
        loadChildren: './stock/stock.module#StockModule'
      },
      {
        path: 'home',
        component: HomeComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
  ]
})
export class PagesRoutingModule { }
