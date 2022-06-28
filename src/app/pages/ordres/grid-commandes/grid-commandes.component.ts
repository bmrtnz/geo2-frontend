import { Component, Injector, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ColumnsSettings } from "app/shared/components/entity-cell-template/entity-cell-template.component";
import { Fournisseur } from "app/shared/models";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import Ordre from "app/shared/models/ordre.model";
import { FournisseursService, LocalizationService } from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { CertificationsModesCultureService } from "app/shared/services/api/certifications-modes-culture.service";
import { CodesPromoService } from "app/shared/services/api/codes-promo.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { TypesPaletteService } from "app/shared/services/api/types-palette.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { Change, GridColumn, OnSavingEvent } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { Observable, of } from "rxjs";
import { concatMap, filter, first, map, tap } from "rxjs/operators";
import { ArticleCertificationPopupComponent } from "../article-certification-popup/article-certification-popup.component";

class GridCommandesFeatures implements OnInit, OnChanges {

  public certifsMD: any;
  public certifMDDS: DataSource;
  public ordre: Partial<Ordre>;
  public certificationText: string;

  @Input() ordreID: string;
  @Output() public ordreLigne: OrdreLigne;
  @ViewChild(ArticleCertificationPopupComponent) articleCertificationPopup: ArticleCertificationPopupComponent;

  constructor(
    public injector: Injector,
  ) {
    this.certificationText = this.injector
      .get(LocalizationService)
      .localize("btn-certification");
  }

  ngOnInit() {
    this.certifMDDS = this.injector
      .get(CertificationsModesCultureService)
      .getDataSource_v2(["id", "description", "type"], 100);
    this.certifMDDS.filter(["type", "=", "CERTIF"]);
    this.certifMDDS.load().then(res => {
      this.certifsMD = res; // Store certifications Mode culture
    });
  }

  ngOnChanges() { }

  showCertificationCheck(data) {
    let isCert = false;
    if (data.listeCertifications) { // Already recorded
      this.certifsMD?.map(certType => {
        if (data.listeCertifications?.split(",").includes(certType.id.toString()))
          isCert = true;
      });
    } else { // Default certifications from customer file
      isCert = this.ordre?.client?.certifications?.length > 0;
    }
    return this.certificationText + (isCert ? " ✓" : "");
  }

  openCertificationPopup(ligne) {
    this.ordreLigne = ligne;
    this.articleCertificationPopup.visible = true;
  }

}

@Component({
  selector: "app-grid-commandes",
  templateUrl: "./grid-commandes.component.html",
  styleUrls: [
    "./grid-commandes.component.scss",
    "../grid-lignes/grid-lignes.component.scss", // legacy style
  ]
})
export class GridCommandesComponent
  extends GridCommandesFeatures
  implements OnInit, OnChanges {

  public FEATURE = {
    margePrevisionelle: true,
    columnCertifications: true,
  };

  public readonly gridID = Grid.LignesCommandes;
  public columns: Observable<GridColumn[]>;
  public allowMutations = false;
  public changes: Change<Partial<OrdreLigne>>[] = [];
  public columnsSettings: ColumnsSettings;

  @Input() ordreID: string;
  @ViewChild(DxDataGridComponent) private grid: DxDataGridComponent;

  constructor(
    public injector: Injector,
    private gridConfigurator: GridConfiguratorService,
    private ordresService: OrdresService,
    private ordreLignesService: OrdreLignesService,
    private route: ActivatedRoute,
    private currentCompanyService: CurrentCompanyService,
    private fournisseursService: FournisseursService,
    private basesTarifService: BasesTarifService,
    private codesPromoService: CodesPromoService,
    private typesPaletteService: TypesPaletteService,
  ) {
    super(injector);
    const fournisseursDataSource = this.fournisseursService
      .getDataSource_v2(["id", "code", "raisonSocial"]);
    const sharedBaseTarifDatasource = this.basesTarifService
      .getDataSource_v2(["id", "description"]);
    const sharedTypePaletteDatasource = this.typesPaletteService
      .getDataSource_v2(["id", "description"]);
    this.columnsSettings = {
      "proprietaireMarchandise.id": {
        dataSource: this.fournisseursService
          .getDataSource_v2(["id", "code", "raisonSocial"]),
        displayExpression: "raisonSocial",
      },
      "fournisseur.id": {
        dataSource: fournisseursDataSource,
        displayExpression: "raisonSocial",
      },
      "venteUnite.id": {
        dataSource: sharedBaseTarifDatasource,
        displayExpression: "description",
      },
      "codePromo.id": {
        dataSource: this.codesPromoService
          .getDataSource_v2(["id", "description"]),
        displayExpression: "description",
      },
      "achatUnite.id": {
        dataSource: sharedBaseTarifDatasource,
        displayExpression: "description",
      },
      "typePalette.id": {
        dataSource: sharedTypePaletteDatasource,
        displayExpression: "description",
      },
      "paletteInter.id": {
        dataSource: sharedTypePaletteDatasource,
        displayExpression: "description",
      },
      "fraisUnite.id": {
        dataSource: sharedBaseTarifDatasource,
        displayExpression: "description",
      },
    };
  }

  public gridConfigHandler = event =>
    this.gridConfigurator.init(this.gridID, {
      ...event,
      title: "Lignes de commande",
      onColumnsChange: this.onColumnsConfigurationChange.bind(this),
    })

  ngOnInit(): void {
    this.route.paramMap
      .pipe(filter(params => params.has("ordre_id")))
      .subscribe({
        next: params => {
          this.ordreID = params.get("ordre_id");
          this.updateRestrictions();
        },
      });
    this.columns = this.gridConfigurator.fetchColumns(this.gridID);
    super.ngOnInit();
  }

  ngOnChanges() {
    super.ngOnChanges();
    if (this.ordreID) this.updateRestrictions();
  }

  focusedColumnIndexChange() {
    this.grid.instance.saveEditData();
  }

  onSaving(event: OnSavingEvent) {
    if (event.component.hasEditData())
      while (this?.changes.length) {

        if (this?.changes[0]?.type !== "update") continue;

        const change = this.changes.shift();
        event.cancel = true;
        event.promise = new Promise((rsv, rjt) => {

          const source = this.grid.dataSource as DataSource;
          const store = source.store() as CustomStore;

          // push initial cell change to prevent data flickering
          store.push([change]);

          /* tslint:disable-next-line:prefer-const */
          let [name, value] = Object.entries(change.data)[0];

          // update "fournisseur" field when "proprietaire" value changed
          if (name === "proprietaireMarchandise") {
            const fournisseur = this.updateFilterFournisseurDS(event.changes[0].data.proprietaireMarchandise);
            event.component.cellValue(
              event.component.getRowIndexByKey(event.changes[0].key),
              "fournisseur",
              fournisseur,
            );
            this.changes.push({
              ...event.changes[0],
              data: { fournisseur },
            });
          }

          // map object value
          if (typeof value === "object")
            value = value.id;

          // request mutation
          this.columns
            .pipe(
              GridConfiguratorService.getVisible(),
              GridConfiguratorService.getFields(),
              concatMap(fields => this.ordreLignesService.updateField(
                name,
                value,
                change.key,
                this.currentCompanyService.getCompany().id,
                ["id", ...fields],
              )),
              first(),
            )
            .subscribe({

              // build and push response data
              next: ({ data }) => {
                store.push([{
                  key: data.updateField.id,
                  type: "update",
                  data: data.updateField,
                }]);
              },

              // reject on error
              error: err => {
                notify(err.message, "error", 5000);
                rjt(err);
              },

              complete: async () => {
                await this.grid.instance.saveEditData();
                rsv();
              },
            });
        });
      }
  }

  onColumnsConfigurationChange({ current }: { current: GridColumn[] }) {
    this.refreshData(current);
  }

  private refreshData(columns: GridColumn[]) {
    if (this.ordreID)
      of(columns)
        .pipe(
          GridConfiguratorService.getVisible(),
          GridConfiguratorService.getFields(),
          map(fields => this.ordreLignesService.getListDataSource([
            OrdreLigne.getKeyField() as string,
            // grid config + visible
            ...fields,

            // display expressions
            ...Object
              .entries(this.columnsSettings)
              .map(([keyField, column]) => {
                const members = keyField.split(".");
                members.splice(-1, 1, column.displayExpression);
                return members.join(".");
              }),

            // extra features
            ...this.FEATURE.columnCertifications ? ["listeCertifications"] : [],
          ])),
          tap(datasource => datasource.filter([
            ["ordre.id", "=", this.ordreID],
            "and",
            ["valide", "=", true],
            "and",
            ["article.id", "isnotnull", "null"],
          ])),
        )
        .subscribe(datasource => {
          this.grid.dataSource = datasource;
        });
  }

  private async updateRestrictions() {
    const isCloture = await this.ordresService.isCloture({ id: this.ordreID });
    this.allowMutations = !environment.production && !isCloture;
  }

  // OLD codebase beyond this point (grid-lignes.component)

  private updateFilterFournisseurDS(proprietaireMarchandise?: Partial<Fournisseur>) {

    let fournisseur: Partial<Fournisseur>;
    const filters = [];

    if (
      this.currentCompanyService.getCompany().id !== "BUK"
      || proprietaireMarchandise?.code.substring(0, 2) !== "BW"
    ) {
      const listExp = proprietaireMarchandise?.listeExpediteurs;
      if (listExp) {
        listExp.split(",").map(exp => {
          filters.push(["code", "=", exp], "or");
          // Automatically selected when included in the list
          if (exp === proprietaireMarchandise.code) {
            fournisseur = proprietaireMarchandise;
          }
        });
        filters.pop();
      } else {
        fournisseur = proprietaireMarchandise;
        if (proprietaireMarchandise.id !== null)
          filters.push(["id", "=", proprietaireMarchandise.id]);
      }
    }
    this.columnsSettings["fournisseur.id"].dataSource.filter(filters);
    return fournisseur;

  }

}
