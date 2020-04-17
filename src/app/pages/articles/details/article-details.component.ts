import { Component, OnInit } from '@angular/core';
import { ArticlesService, Company } from '../../../shared/services/articles.service';
import { ActivatedRoute } from '@angular/router';
import {
    Article
  } from '../../../shared/models';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';


@Component({
    selector: 'app-articles',
    templateUrl: './article-details.component.html',
    styleUrls: ['./article-details.component.scss']
})
export class ArticleDetailsComponent implements OnInit {

    articleForm = this.fb.group({
        id: [''],
        descriptAbregee: [''],
        BWSTOCK: [''],
        instructStation: [''],
        espece: [''],
        variete: [''],
        calibreUnifie: [''],
        origine: [''],
        typeVarietal: [''],
        coloration: [''],
        typeVente: ['']
    });

    article: Article;
    articles: Article[];
    companies: Company[];
    categories: {};
    itemCount: number;
    id: string;
    articlesCategories: {} = [
        {
            id: 1,
            name: 'Matière première',
            cats: ['espece', 'variete', 'calibreUnifie', 'origine', 'typeVarietal', 'coloration', 'typeVente'],
        },
        {
            id: 2,
            name: 'Emballage',
            cats: ['emb cat 1', 'emb cat 2', 'emb cat 3'],
        },
        {
            id: 3,
            name: 'CDC',
            cats: ['CDC cat 1', 'CDC cat 2', 'CDC cat 3'],
        },
        {
            id: 4,
            name: 'Normalisation',
            cats: ['norm cat 1', 'norm cat 2', 'norm cat 3'],
        }
    ];

    constructor(
        private articlesService: ArticlesService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        ) {
        this.companies = articlesService.getCompanies();
        this.categories = this.articlesCategories;
        this.itemCount = this.companies.length;
    }

    ngOnInit() {

        this.articlesService.get()
        .then( res => this.articles = res);

        this.articlesService
        .get(this.route.snapshot.paramMap.get('id'))
        .then(id => {
          this.article = id;
          this.articleForm.patchValue(this.article);
        });

    }

}
