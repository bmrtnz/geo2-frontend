import { Component, OnInit } from '@angular/core';
import { ArticlesService } from '../../../shared/services/articles.service';
import { ActivatedRoute } from '@angular/router';
import {
    Article
  } from '../../../shared/models';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';
import { EspecesService } from 'app/shared/services/especes.service';
import { VarietesService } from 'app/shared/services/varietes.service';
import { TypesService } from 'app/shared/services/types.service';
import { ModesCultureService } from 'app/shared/services/modes-culture.service';
import { OriginesService } from 'app/shared/services/origines.service';
import { CalibresUnifiesService } from 'app/shared/services/calibres-unifies.service';
import { ColorationsService } from 'app/shared/services/colorations.service';
import { TypesVenteService } from 'app/shared/services/types-vente.service';
import { StickeursService } from 'app/shared/services/stickeurs.service';
import { MarquesService } from 'app/shared/services/marques.service';
import { EmballagesService } from 'app/shared/services/emballages.service';
import { ConditionsSpecialesService } from 'app/shared/services/conditions-speciales.service';
import { AlveolesService } from 'app/shared/services/alveoles.service';
import { CategoriesService } from 'app/shared/services/categories.service';
import { SucresService } from 'app/shared/services/sucres.service';
import { PenetrosService } from 'app/shared/services/penetros.service';
import { CiragesService } from 'app/shared/services/cirages.service';
import { RangementsService } from 'app/shared/services/rangements.service';
import { EtiquettesColisService } from 'app/shared/services/etiquettes-colis.service';
import { EtiquettesUcService } from 'app/shared/services/etiquettes-uc.service';
import { EtiquettesEvenementiellesService } from 'app/shared/services/etiquettes-evenementielles.service';

@Component({
    selector: 'app-articles',
    templateUrl: './article-details.component.html',
    styleUrls: ['./article-details.component.scss']
})
export class ArticleDetailsComponent implements OnInit {

    articleForm = this.fb.group({
        id: [''],
        description: [''],
        blueWhaleStock: [''],
        matierePremiere: this.fb.group({
            espece: [''],
            variete: [''],
            type: [''],
            modeCulture: [''],
            origine: [''],
            calibreUnifie: [''],
            typeVente: [''],
        }),
        cahierDesCharge: this.fb.group({
            instructionStation: [''],
            coloration: [''],
            categorie: [''],
            sucre: [''],
            penetro: [''],
            cirage: [''],
            rangement: [''],
        }),
        normalisation: this.fb.group({
            stickeur: [''],
            marque: [''],
            etiquetteColis: [''],
            etiquetteUc: [''],
            etiquetteEvenementielle: [''],
            gtinColis: [''],
            gtinUc: [''],
            articleClient: ['']
        }),
        emballage: this.fb.group({
            emballage: [''],
            conditionSpecial: [''],
            alveole: [''],
            uniteParColis: [''],
            prepese: [''],
            poidsNetColis: [''],
            poidsNetGaranti: [''],
        }),
        // poidsNetUC: [''],
        // codePLU: [''],
        // categorie: [''],
        // calibreMarquage: [''],
        // descrSpecialeCalClt: [''],
    });

    article: Article;

    especes: DataSource;
    varietes: DataSource;
    types: DataSource;
    modesCulture: DataSource;
    origines: DataSource;
    calibresUnifies: DataSource;
    colorations: DataSource;
    typesVente: DataSource;
    stickeurs: DataSource;
    marques: DataSource;
    emballages: DataSource;
    conditionsSpecials: DataSource;
    alveoles: DataSource;
    categories: DataSource;
    sucres: DataSource;
    penetros: DataSource;
    cirages: DataSource;
    rangements: DataSource;
    etiquettesColis: DataSource;
    etiquettesUc: DataSource;
    etiquettesEvenementielle: DataSource;

    id: string;

    constructor(
        private articlesService: ArticlesService,
        private especesService: EspecesService,
        private varietesService: VarietesService,
        private typesService: TypesService,
        private modesCultureService: ModesCultureService,
        private originesService: OriginesService,
        private calibresUnifiesService: CalibresUnifiesService,
        private colorationsService: ColorationsService,
        private typesVenteService: TypesVenteService,
        private stickeursService: StickeursService,
        private marquesService: MarquesService,
        private emballagesService: EmballagesService,
        private conditionsSpecialesService: ConditionsSpecialesService,
        private alveolesService: AlveolesService,
        private categoriesService: CategoriesService,
        private sucresService: SucresService,
        private penetrosService: PenetrosService,
        private ciragesService: CiragesService,
        private rangementsService: RangementsService,
        private etiquettesColisService: EtiquettesColisService,
        private etiquettesUcService: EtiquettesUcService,
        private etiquettesEvenementiellesService: EtiquettesEvenementiellesService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        ) {
    }

    ngOnInit() {

        this.articlesService
        .getOne(this.route.snapshot.paramMap.get('id'))
        .subscribe( res => {
            this.article = new Article(res.data.article);
            this.articleForm.patchValue(this.article);
        });

        this.especes = this.especesService.getDataSource();
        this.varietes = this.varietesService.getDataSource();
        this.types = this.typesService.getDataSource();
        this.modesCulture = this.modesCultureService.getDataSource();
        this.origines = this.originesService.getDataSource();
        this.calibresUnifies = this.calibresUnifiesService.getDataSource();
        this.colorations = this.colorationsService.getDataSource();
        this.typesVente = this.typesVenteService.getDataSource();
        this.stickeurs = this.stickeursService.getDataSource();
        this.marques = this.marquesService.getDataSource();
        this.emballages = this.emballagesService.getDataSource();
        this.conditionsSpecials = this.conditionsSpecialesService.getDataSource();
        this.alveoles = this.alveolesService.getDataSource();
        this.categories = this.categoriesService.getDataSource();
        this.sucres = this.sucresService.getDataSource();
        this.penetros = this.penetrosService.getDataSource();
        this.cirages = this.ciragesService.getDataSource();
        this.rangements = this.rangementsService.getDataSource();
        this.etiquettesColis = this.etiquettesColisService.getDataSource();
        this.etiquettesUc = this.etiquettesUcService.getDataSource();
        this.etiquettesEvenementielle = this.etiquettesEvenementiellesService.getDataSource();

    }

    onSubmit() {
        if (!this.articleForm.pristine && this.articleForm.valid) {
            const article = this.articlesService.extractDirty(this.articleForm.controls);
            this.articlesService
                .save({ article: { ...article, id: this.article.id } })
                .subscribe({
                next: () => {
                    notify('Sauvegardé', 'success', 3000);
                    this.article = { id: this.article.id, ...this.articleForm.getRawValue() };
                },
                error: () => notify('Echec de la sauvegarde', 'error', 3000),
                });
        }
      }

}
