import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { ArticlesService } from '../../../shared/services/articles.service';
import { ActivatedRoute, Router } from '@angular/router';
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
import { CalibresMarquageService } from 'app/shared/services/calibres-marquage.service';
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
import { NestedPart } from 'app/pages/nested/nested.component';
import { switchMap, tap } from 'rxjs/operators';
import { Editable } from 'app/shared/guards/editing-guard';
import { EditingAlertComponent } from 'app/shared/components/editing-alert/editing-alert.component';

@Component({
    selector: 'app-articles',
    templateUrl: './article-details.component.html',
    styleUrls: ['./article-details.component.scss']
})
export class ArticleDetailsComponent implements OnInit, NestedPart, Editable {

    formGroup = this.fb.group({
        id: [''],
        description: [''],
        blueWhaleStock: [''],
        valide: [''],
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
            articleClient: [''],
            calibreMarquage: ['']
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
    contentReadyEvent = new EventEmitter<any>();
    @ViewChild(EditingAlertComponent, { static: true }) alertComponent: EditingAlertComponent;
    editing = false;

    article: Article;

    especes: DataSource;
    varietes: DataSource;
    types: DataSource;
    modesCulture: DataSource;
    origines: DataSource;
    calibresUnifies: DataSource;
    calibresMarquage: DataSource;
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
    readOnlyMode = true;
    cloneMode = false;

    id: string;

    constructor(
        private articlesService: ArticlesService,
        private especesService: EspecesService,
        private varietesService: VarietesService,
        private typesService: TypesService,
        private modesCultureService: ModesCultureService,
        private originesService: OriginesService,
        private calibresUnifiesService: CalibresUnifiesService,
        private calibresMarquageService: CalibresMarquageService,
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
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
    ) {}

    ngOnInit() {

        this.route.params
        .pipe(
            tap( _ => this.formGroup.reset()),
            switchMap( params => this.articlesService.getOne(params.id)),
        )
        .subscribe( res => {
            this.article = new Article(res.data.article);
            this.formGroup.patchValue(this.article);
            this.contentReadyEvent.emit();
        });

    }

    onCancel() {
        this.cloneMode = false;
        this.readOnlyMode = true;
        this.editing = false;
        this.formGroup.reset(this.article);
    }

    onClone() {
        this.readOnlyMode = false;
        this.cloneMode = true;
        this.editing = true;
        Object.keys(this.formGroup.controls).forEach(key => {
            this.formGroup.get(key).markAsDirty();
        });
    }

    onSubmit() {
        if (!this.formGroup.pristine && this.formGroup.valid) {
            const article = this.articlesService.extractDirty(this.formGroup.controls);
            this.articlesService
                .save({ article, clone: this.cloneMode })
                .subscribe({
                next: (event) => {
                    notify('Sauvegardé', 'success', 3000);
                    this.article = { id: this.article.id, ...this.formGroup.getRawValue() };
                    if (this.cloneMode)
                        this.router.navigate([`/articles/${event.data.saveArticle.id}`]);
                    this.cloneMode = false;
                    this.readOnlyMode = true;
                    this.editing = false;
                },
                error: () => notify('Echec de la sauvegarde', 'error', 3000),
                });
        }
      }

    onEspeceChange(event) {
        const dsOptions = {
            search: event.value ? 'espece.id==' + event.value.id : '',
        };

        this.especes = this.especesService.getDataSource();
        this.varietes = this.varietesService.getDataSource(dsOptions);
        this.types = this.typesService.getDataSource(dsOptions);
        this.modesCulture = this.modesCultureService.getDataSource();
        this.origines = this.originesService.getDataSource(dsOptions);
        this.calibresUnifies = this.calibresUnifiesService.getDataSource(dsOptions);
        this.calibresMarquage = this.calibresMarquageService.getDataSource(dsOptions);
        this.colorations = this.colorationsService.getDataSource(dsOptions);
        this.typesVente = this.typesVenteService.getDataSource();
        this.stickeurs = this.stickeursService.getDataSource(dsOptions);
        this.marques = this.marquesService.getDataSource(dsOptions);
        this.emballages = this.emballagesService.getDataSource(dsOptions);
        this.conditionsSpecials = this.conditionsSpecialesService.getDataSource(dsOptions);
        this.alveoles = this.alveolesService.getDataSource(dsOptions);
        this.categories = this.categoriesService.getDataSource(dsOptions);
        this.sucres = this.sucresService.getDataSource(dsOptions);
        this.penetros = this.penetrosService.getDataSource(dsOptions);
        this.cirages = this.ciragesService.getDataSource(dsOptions);
        this.rangements = this.rangementsService.getDataSource(dsOptions);
        this.etiquettesColis = this.etiquettesColisService.getDataSource(dsOptions);
        this.etiquettesUc = this.etiquettesUcService.getDataSource(dsOptions);
        this.etiquettesEvenementielle = this.etiquettesEvenementiellesService.getDataSource(dsOptions);
    }

}
