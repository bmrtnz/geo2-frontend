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
    styleUrls: ['./article-details.component.scss'],
    // providers: [ArticlesService],
    // preserveWhitespaces: true
})
export class ArticleDetailsComponent implements OnInit {

    articleForm = this.fb.group({
        id: [''],
        descriptAbregee: [''],
        BWSTOCK: [''],
        instructStation: ['']
    });

    article: Article[];
    companies: Company[];
    itemCount: number;
    id: string;

    constructor(
        private articlesService: ArticlesService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        ) {
        this.companies = articlesService.getCompanies();
        this.itemCount = this.companies.length;
    }

    ngOnInit() {
        // this.code = this.route.snapshot.paramMap.get('code');

        this.articlesService
        .get(this.route.snapshot.paramMap.get('id'))
        .then(id => {
          this.article = id;
          this.articleForm.patchValue(this.article);
        });


    }

}
