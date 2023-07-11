import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ArticlesListComponent } from "./list/articles-list.component";
import { ArticleDetailsComponent } from "./details/article-details.component";
import { NestedGuard } from "app/shared/guards/nested-guard";
import { EditingGuard } from "app/shared/guards/editing-guard";
import { AssociationArticlesEDICOLIBRIComponent } from "./association-articles-edi-colibri/association-articles-edi-colibri.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "list",
    pathMatch: "full",
  },
  {
    path: "list",
    component: ArticlesListComponent,
  },
  {
    path: "association-edi-colibri",
    component: AssociationArticlesEDICOLIBRIComponent,
  },
  {
    path: "create",
    component: ArticleDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  },
  {
    path: ":id",
    component: ArticleDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArticlesRoutingModule { }
