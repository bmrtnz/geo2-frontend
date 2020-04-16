import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticlesListComponent } from './list/articles-list.component';
import { ArticleDetailsComponent } from './details/article-details.component';
import { AuthGuardService } from '../../shared/services';

const routes: Routes = [
  {
    path: '',
    component: ArticlesListComponent,
    canActivate: [AuthGuardService]
  }, {
    path: ':id',
    component: ArticleDetailsComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticlesRoutingModule { }

