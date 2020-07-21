import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticlesListComponent } from './list/articles-list.component';
import { ArticleDetailsComponent } from './details/article-details.component';
import { AuthGuardService } from '../../shared/services';
import { NestedGuard } from 'app/shared/guards/nested-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  }, {
    path: 'list',
    component: ArticlesListComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'create',
    component: ArticleDetailsComponent,
    canActivate: [AuthGuardService]
  }, {
    path: ':id',
    component: ArticleDetailsComponent,
    canActivate: [AuthGuardService, NestedGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticlesRoutingModule { }

