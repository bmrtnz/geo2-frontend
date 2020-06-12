import { Component, OnInit } from '@angular/core';
import { ArticlesService } from '../../../shared/services/articles.service';
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

    especes: any[];
    varietes: any[];
    typesVarietal: any[];
    modesCulture: any[];
    origines: any[];
    calibresUnifie: any[];
    calibresMarquage: any[];
    colorations: any[];
    typesVente: any[];
    stickeurs: any[];
    marques: any[];
    emballages: any[];
    conditionsSpecial: any[];
    alveoles: any[];
    categories: any[];
    sucres: any[];
    penetros: any[];
    cirages: any[];
    rangements: any[];
    etiquettesClient: any[];
    etiquettesUC: any[];
    etiquettesEvenementielle: any[];

    id: string;

    constructor(
        private articlesService: ArticlesService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        ) {
    }

    ngOnInit() {

        this.articlesService.get()
        .then( res => this.articles = res);

        this.articlesService.getEspeces().then(a => {
            this.especes = a;
        });
        this.articlesService.getAlveole().then(a => {
            this.alveoles = a;
        });
        this.articlesService.getVarietes().then(v => {
            this.varietes = v;
        });
        this.articlesService.getTypeVarietal().then(tv => {
            this.typesVarietal = tv;
        });
        this.articlesService.getModeCulture().then(c => {
            this.modesCulture = c;
        });
        this.articlesService.getOrigine().then(o => {
            this.origines = o;
        });
        this.articlesService.getCalibreUnifie().then(cu => {
            this.calibresUnifie = cu;
        });
        this.articlesService.getCalibreMarquage().then(cm => {
            this.calibresMarquage = cm;
        });
        this.articlesService.getColoration().then(co => {
            this.colorations = co;
        });
        this.articlesService.getTypeVente().then(ve => {
            this.typesVente = ve;
        });
        this.articlesService.getStickeur().then(a => {
            this.stickeurs = a;
        });
        this.articlesService.getMarque().then(a => {
            this.marques = a;
        });
        this.articlesService.getEmballage().then(a => {
            this.emballages = a;
        });
        this.articlesService.getConditionsSpecial().then(a => {
            this.conditionsSpecial = a;
        });
        this.articlesService.getCategorie().then(a => {
            this.categories = a;
        });
        this.articlesService.getSucre().then(a => {
            this.sucres = a;
        });
        this.articlesService.getPenetro().then(a => {
            this.penetros = a;
        });
        this.articlesService.getCirage().then(a => {
            this.cirages = a;
        });
        this.articlesService.getRangement().then(a => {
            this.rangements = a;
        });
        this.articlesService.getEtiqClient().then(a => {
            this.etiquettesClient = a;
        });
        this.articlesService.getEtiqUC().then(a => {
            this.etiquettesUC = a;
        });
        this.articlesService.getEtiqEvt().then(a => {
            this.etiquettesEvenementielle = a;
        });

        this.articlesService
        .get(this.route.snapshot.paramMap.get('id'))
        .then(id => {
          this.article = id;
          this.articleForm.patchValue(this.article);
        });

    }

    onSubmit() {
      console.log('submit');
    }

}
