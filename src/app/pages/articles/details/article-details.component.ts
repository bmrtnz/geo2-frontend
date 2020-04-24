import { Component, OnInit } from '@angular/core';
import { ArticlesService, Tab } from '../../../shared/services/articles.service';
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
        typeVente: [''],
        type: [''],
        modeCulture: [''],
        emballage: [''],
        poidsNetReel: [''],
        poidsNetTheo: [''],
        prePese: [''],
        condSpecial: [''],
        nbreUniteColis: [''],
        poidsNetUC: [''],
        alveole: [''],
        stickeur: [''],
        codePLU: [''],
        marque: [''],
        categorie: [''],
        cirage: [''],
        penetro: [''],
        rangement: [''],
        sucre: [''],
        calibreMarquage: [''],
        descrSpecialeCalClt: [''],
        etiqClient: [''],
        etiqUC: [''],
        etiqEvenementielle: [''],
        GTINColis: [''],
        GTINUC: [''],
        articleClient: ['']
    });

    article: Article;
    articles: Article[];
    tabs: Tab[];
    categories: {};
    combination: {};
    itemCount: number;
    id: string;
    articlesCategories = [
        {
            id: 1,
            name: 'Matière première',
            cats: ['espece', 'variete', 'calibreUnifie', 'origine', 'typeVarietal', 'coloration', 'typeVente', 'modeCulture']
        },
        {
            id: 2,
            name: 'Emballage',
            cats: ['emballage', 'poidsNetReel', 'poidsNetTheo', 'prePese', 'condSpecial', 'nbreUniteColis', 'poidsNetUC',
             'alveole', 'stickeur', 'codePLU', 'marque']
        },
        {
            id: 3,
            name: 'CDC',
            cats: ['categorie', 'cirage', 'penetro', 'rangement', 'sucre'],
        },
        {
            id: 4,
            name: 'Normalisation',
            cats: ['calibreMarquage', 'descrSpecialeCalClt', 'etiqClient', 'etiqUC', 'GTINColis', 'GTINUC', 'articleClient'],
        },
        {
            id: 5,
            name: 'Fiche complète'
        }
    ];

    articlesCombination = [];

    constructor(
        private articlesService: ArticlesService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        ) {
        this.tabs = articlesService.getTabs();
        this.categories = this.articlesCategories;
        this.combination = this.articlesCombination;
        this.itemCount = this.tabs.length;
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

        // Create fake data (articlesCombination)
        let cats = [];
        for (let c = 0; c < 4; c++) {
            this.articlesCombination[c] = [];
            cats = this.articlesCategories[c].cats.slice(0, 2);
            let element = {[cats[0]]: '', [cats[1]]: ''};
            for (let i = 1; i <= 10; i++) {
                for (let j = 1; j <= 3; j++) {
                    element = {[cats[0]]: '', [cats[1]]: ''};
                    element[cats[0]] = cats[0] + i;
                    element[cats[1]] = cats[1] + j;
                    this.articlesCombination[c].push(element);
                }
            }
        }

    }

}
