import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NestedPart } from 'app/pages/nested/nested.component';
import { EditingAlertComponent } from 'app/shared/components/editing-alert/editing-alert.component';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
import { PushHistoryPopupComponent } from 'app/shared/components/push-history-popup/push-history-popup.component';
import { Editable } from 'app/shared/guards/editing-guard';
import { AuthService } from 'app/shared/services';
import { AlveolesService } from 'app/shared/services/api/alveoles.service';
import { CalibresMarquageService } from 'app/shared/services/api/calibres-marquage.service';
import { CalibresUnifiesService } from 'app/shared/services/api/calibres-unifies.service';
import { CategoriesService } from 'app/shared/services/api/categories.service';
import { CiragesService } from 'app/shared/services/api/cirages.service';
import { ColorationsService } from 'app/shared/services/api/colorations.service';
import { ConditionsSpecialesService } from 'app/shared/services/api/conditions-speciales.service';
import { EmballagesService } from 'app/shared/services/api/emballages.service';
import { EspecesService } from 'app/shared/services/api/especes.service';
import { EtiquettesColisService } from 'app/shared/services/api/etiquettes-colis.service';
import { EtiquettesEvenementiellesService } from 'app/shared/services/api/etiquettes-evenementielles.service';
import { EtiquettesUcService } from 'app/shared/services/api/etiquettes-uc.service';
import { HistoryType } from 'app/shared/services/api/historique.service';
import { MarquesService } from 'app/shared/services/api/marques.service';
import { ModesCultureService } from 'app/shared/services/api/modes-culture.service';
import { OriginesService } from 'app/shared/services/api/origines.service';
import { PenetrosService } from 'app/shared/services/api/penetros.service';
import { RangementsService } from 'app/shared/services/api/rangements.service';
import { StickeursService } from 'app/shared/services/api/stickeurs.service';
import { SucresService } from 'app/shared/services/api/sucres.service';
import { TypesVenteService } from 'app/shared/services/api/types-vente.service';
import { TypesService } from 'app/shared/services/api/types.service';
import { VarietesService } from 'app/shared/services/api/varietes.service';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { of } from 'rxjs';
import { concatAll, switchAll, switchMap, tap } from 'rxjs/operators';
import {
    Article
} from '../../../shared/models';
import { ArticlesService } from '../../../shared/services/api/articles.service';

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
        preSaisie: [''],
        matierePremiere: this.fb.group({
            espece: [''],
            variete: [''],
            type: [''],
            modeCulture: [''],
            origine: [''],
            calibreUnifie: [''],
            typeVente: [''],
            codePlu: [''],
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
        // descrSpecialeCalClt: [''],
    });
    contentReadyEvent = new EventEmitter<any>();
    refreshGrid = new EventEmitter();
    @ViewChild(EditingAlertComponent, { static: true }) alertComponent: EditingAlertComponent;
    @ViewChild(FileManagerComponent, { static: false }) fileManagerComponent: FileManagerComponent;
    @ViewChild(PushHistoryPopupComponent, { static: false })
    validatePopup: PushHistoryPopupComponent;
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
    validateCommentPromptVisible = false;
    readOnlyMode = true;
    cloneMode = false;
    preSaisie: string;

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
        public authService: AuthService,
    ) { }

    ngOnInit() {

        this.route.params
            .pipe(
                tap(_ => this.formGroup.reset()),
                switchMap(async params => await this.articlesService.getOne(params.id)),
                switchAll(),
            )
            .subscribe(res => {
                this.article = new Article(res.data.article);
                this.formGroup.patchValue(this.article);
                this.contentReadyEvent.emit();
                this.preSaisie = this.article.preSaisie === true ? 'preSaisie' : '';
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
            if (this.cloneMode) {
                article.preSaisie = true;
            } else {
                if (article.valide === true) {
                    article.preSaisie = false;
                    this.preSaisie = '';
                }
            }

            (article.valide !== undefined && this.article.valide !== article.valide ?
                this.validatePopup.present(
                    HistoryType.ARTICLE,
                    { article: { id: article.id }, valide: article.valide },
                ) : of(undefined))
                .pipe(
                    tap( _ => console.log(article)),
                    switchMap(_ => this.articlesService.save({
                        article,
                        clone: this.cloneMode,
                    })),
                    concatAll(),
                )
                .subscribe({
                    next: (event) => {
                        notify('Sauvegardé', 'success', 3000);
                        this.refreshGrid.emit();
                        this.article = {
                            ...this.article,
                            ...this.formGroup.getRawValue(),
                        };
                        if (this.cloneMode)
                            this.router.navigate([`/articles/${event.data.saveArticle.id}`]);
                        this.cloneMode = false;
                        this.readOnlyMode = true;
                        this.editing = false;
                        this.article.historique = event.data.saveArticle.historique;
                        this.formGroup.markAsPristine();
                    },
                    error: () => notify('Echec de la sauvegarde', 'error', 3000),
                });
        }
    }

    onEspeceChange(event) {
        const filter = event.value ? ['espece.id', '=', event.value.id] : [];

        this.especes = this.especesService.getDataSource();
        this.varietes = this.varietesService.getDataSource();
        this.varietes.filter(filter);
        this.types = this.typesService.getDataSource();
        this.types.filter(filter);
        this.modesCulture = this.modesCultureService.getDataSource();
        this.origines = this.originesService.getDataSource();
        this.origines.filter(filter);
        this.calibresUnifies = this.calibresUnifiesService.getDataSource();
        this.calibresUnifies.filter(filter);
        this.calibresMarquage = this.calibresMarquageService.getDataSource();
        this.calibresMarquage.filter(filter);
        this.colorations = this.colorationsService.getDataSource();
        this.colorations.filter(filter);
        this.typesVente = this.typesVenteService.getDataSource();
        this.stickeurs = this.stickeursService.getDataSource();
        this.stickeurs.filter(filter);
        this.marques = this.marquesService.getDataSource();
        this.marques.filter(filter);
        this.emballages = this.emballagesService.getDataSource();
        this.emballages.filter(filter);
        this.conditionsSpecials = this.conditionsSpecialesService.getDataSource();
        this.conditionsSpecials.filter(filter);
        this.alveoles = this.alveolesService.getDataSource();
        this.alveoles.filter(filter);
        this.categories = this.categoriesService.getDataSource();
        this.categories.filter(filter);
        this.sucres = this.sucresService.getDataSource();
        this.sucres.filter(filter);
        this.penetros = this.penetrosService.getDataSource();
        this.penetros.filter(filter);
        this.cirages = this.ciragesService.getDataSource();
        this.cirages.filter(filter);
        this.rangements = this.rangementsService.getDataSource();
        this.rangements.filter(filter);
        this.etiquettesColis = this.etiquettesColisService.getDataSource();
        this.etiquettesColis.filter(filter);
        this.etiquettesUc = this.etiquettesUcService.getDataSource();
        this.etiquettesUc.filter(filter);
        this.etiquettesEvenementielle = this.etiquettesEvenementiellesService.getDataSource();
        this.etiquettesEvenementielle.filter(filter);
    }

    fileManagerClick() {
        this.fileManagerComponent.visible = true;
    }

}
