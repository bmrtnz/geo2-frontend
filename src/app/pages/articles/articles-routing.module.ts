import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticlesListComponent } from './list/articles-list.component';
import { ArticleDetailsComponent } from './details/article-details.component';
import { NestedGuard } from 'app/shared/guards/nested-guard';
import { EditingGuard } from 'app/shared/guards/editing-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  }, {
    path: 'list',
    component: ArticlesListComponent,
  }, {
    path: 'create',
    component: ArticleDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  }, {
    path: ':id',
    component: ArticleDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticlesRoutingModule { }

