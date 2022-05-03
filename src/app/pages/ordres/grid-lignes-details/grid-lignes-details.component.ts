import { Component, Input, OnChanges, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import Ordre from "app/shared/models/ordre.model";
import * as gridConfig from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { LocalizationService } from "app/shared/services/localization.service";
import { DxDataGridComponent } from "devextreme-angular";
import { SummaryType } from "app/shared/services/api.service";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridConfiguratorService, Grid, GridConfig } from "app/shared/services/grid-configurator.service";
import { ArticlesService } from "app/shared/services";
import { TypesPaletteService } from "app/shared/services/api/types-palette.service";


@Component({
    selector: "app-grid-lignes-details",
    templateUrl: "./grid-lignes-details.component.html",
    styleUrls: ["./grid-lignes-details.component.scss"]
})
export class GridLignesDetailsComponent implements AfterViewInit, OnChanges {

    public dataSource: DataSource;
    public typePaletteSource: DataSource;
    public paletteInterSource: DataSource;
    public columnChooser = environment.columnChooser;
    public columns: Observable<GridColumn[]>;
    private gridConfig: Promise<GridConfig>;
    public itemsWithSelectBox: string[];
    public allowMutations = false;
    public env = environment;
    public totalItems: { column: string, summaryType: SummaryType, displayFormat?: string }[] = [];
    @Input() public ordre: Ordre;
    @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

    constructor(
        public ordreLignesService: OrdreLignesService,
        public articlesService: ArticlesService,
        public typePaletteService: TypesPaletteService,
        public paletteInterService: TypesPaletteService,
        public gridConfiguratorService: GridConfiguratorService,
        public localizeService: LocalizationService
    ) {
        this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreLigneDetails);
        this.columns = from(this.gridConfig).pipe(map(config => config.columns));
        this.itemsWithSelectBox = [
            "typePalette",
            "paletteInter"
        ];
    }

    ngAfterViewInit() {
        this.typePaletteSource = this.typePaletteService.getDataSource_v2(["id", "description"]);
        this.typePaletteSource.filter([
            ["valide", "=", true],
        ]);
        this.paletteInterSource = this.typePaletteSource;
        this.enableFilters();
    }

    ngOnChanges() {
        this.allowMutations = !this.env.production && !Ordre.isCloture(this.ordre);
    }

    async enableFilters() {
        if (!this.datagrid) return;
        if (this?.ordre?.id) {
            const fields = this.columns.pipe(map(columns => columns.map(column => {
                return (this.addKeyToField(column.dataField));
            })));

            this.dataSource = this.ordreLignesService.getDataSource_v2(await fields.toPromise());
            this.dataSource.filter([
                ["ordre.id", "=", this.ordre.id],
            ]);
            this.datagrid.dataSource = this.dataSource;
        } else if (this.datagrid)
            this.datagrid.dataSource = null;
    }

    displayCodeBefore(data) {
        return data ?
            ((data.code ? data.code : data.id) + " - " + (data.nomUtilisateur ? data.nomUtilisateur :
                (data.raisonSocial ? data.raisonSocial : data.description)))
            : null;
    }

    addKeyToField(field) {
        if (this.itemsWithSelectBox.includes(field)) {
            field += `.${this[field + "Service"].model.getKeyField()}`;
        }
        return field;
    }

    onCellPrepared(e) {
        if (e.rowType === "data") {
            // Descript. article
            if (e.column.dataField === "article.id") {
                const infoArt = this.articlesService.concatArtDescript(e.data.article);
                e.cellElement.innerText = infoArt.concatDesc;
                e.cellElement.title = infoArt.concatDesc.substring(2) + "\r\n";
            }
        }
    }

    onValueChanged(event, cell) {
        if (cell.setValue) {
            cell.setValue(event.value);
        }
    }

    onEditorPreparing(e) {
        if (e.parentType === "dataRow") {
            e.editorOptions.onFocusIn = (elem) => {
                if (e.dataField !== "fournisseur.code")
                    elem.element.querySelector(".dx-texteditor-input")?.select();
            };
        }
    }

    defineTemplate(field) {
        let templ;
        if (this.itemsWithSelectBox.includes(field)) templ = "selectBoxEditTemplate";
        if (field === "article.matierePremiere.variete.id") templ = "modifAutoBtnTemplate";
        return templ ? templ : false;
    }

    autoDetailExp(cell) {
        console.log(this.ordre.client);
    }

    modifDetailExp(cell) {
    }

    showAutoButton(cell) {
        const data = cell.data;
        const unlock = data.expedie && (
            data.ordre.client.modificationDetail !== false ||
            !data.fournisseur.indicateurModificationDetail !== false ||
            (data.fournisseur.indicateurModificationDetail === false && data.article.emballage.emballage.groupe.id === "PALOX") ||
            data.ordre.secteurCommercial.id === "IND" ||
            data.ordre.secteurCommercial.id === "PAL" ||
            data.ordre.societe.id === "IMP" ||
            // data.utilisateur.client === "2" ||
            data.ordre.type.id === "REF" ||
            data.ordre.type.id === "RPO" ||
            data.ordre.type.id === "RPR" ||
            data.ordre.type.id === "RDF" ||
            data.article.matierePremiere.variete.modificationDetail ||
            data.ordre.societe.id === "IUK"
        );
        return unlock;
    }

    showModifButton(cell) {
        const data = cell.data;
        let unlock = !data.expedie;
        if (data.expedie) unlock = (
            data.ordre.client.modificationDetail !== false ||
            !data.fournisseur.indicateurModificationDetail !== false ||
            data.ordre.secteurCommercial.id === "PAL" ||
            // data.utilisateur.client === "2" ||
            data.ordre.societe.id === "UDC" ||
            data.article.cahierDesCharge.espece.id.substring(0, 5) === "EMBAL" ||
            data.ordre.type.id === "REF" ||
            data.ordre.type.id === "REF" ||
            data.ordre.type.id === "RPO" ||
            data.ordre.type.id === "RPR" ||
            data.ordre.type.id === "RDF" ||
            data.article.matierePremiere.variete.modificationDetail ||
            data.ordre.societe.id === "IUK"
        );
        return unlock;
    }
}

// ordre.client.modificationDetail
// fournisseur.indicateurModificationDetail
// ordre.societe.id
// ordre.secteurCommercial.id
// ordre.type.id
// article.matierePremiere.variete.modificationDetail
// article.emballage.emballage.id
// article.emballage.emballage.groupe.id
// expedie

