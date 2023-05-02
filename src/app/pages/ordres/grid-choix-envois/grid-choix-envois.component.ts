import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import Envois from "app/shared/models/envois.model";
import Ordre from "app/shared/models/ordre.model";
import TypeTiers from "app/shared/models/type-tiers.model";
import { AuthService, LocalizationService } from "app/shared/services";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { FluxService } from "app/shared/services/api/flux.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { ImprimantesService } from "app/shared/services/api/imprimantes.service";
import { MoyenCommunicationService } from "app/shared/services/api/moyens-communication.service";
import { SocietesService } from "app/shared/services/api/societes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable, zip } from "rxjs";
import { concatMapTo, finalize, map } from "rxjs/operators";
import { FluxArService } from "../flux-ar.service";

@Component({
  selector: "app-grid-choix-envois",
  templateUrl: "./grid-choix-envois.component.html",
  styleUrls: ["./grid-choix-envois.component.scss"],
})
export class GridChoixEnvoisComponent implements OnInit {
  constructor(
    public societeService: SocietesService,
    public fluxService: FluxService,
    public imprimanteService: ImprimantesService,
    public moyenCommunicationService: MoyenCommunicationService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    private functionsService: FunctionsService,
    private envoisService: EnvoisService,
    private ar: FluxArService
  ) {}

  @Input() public ordre: Partial<Ordre>;
  @Input() public fluxID: string;
  @Input() public annuleOrdre: boolean;
  @Input() public fournisseurCode: string;
  @Input() public transporteurLigneId: string;
  @Input() public lieupassageaquaiLigneId: string;

  readonly CHOIX_ENVOIS_FIELDS = [
    "id",
    "codeTiers",
    "typeTiers.id",
    "typeTiers.description",
    "flux.id",
    "flux.description",
    "moyenCommunication.id",
    "numeroAcces1",
    "imprimante.id",
    "nomContact",
    "commentairesAvancement",
    "traite",
    "dateEnvoi",
    "dateSoumission",
    "dateDemande",
  ];

  gridData: DataSource;
  rowKeys: any[];
  fluxSource: DataSource;
  societeSource: DataSource;
  moyenCommunicationSource: DataSource;
  imprimanteSource: DataSource;
  codeTiers: string;
  typeTiers: string;
  typeTiersLabel: string;
  canSelectAll: boolean;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  contentReadyEvent = new EventEmitter<any>();

  /**
   * It takes an array of Envois and an array of Partial<Envois> and returns an array of Envois with
   * the properties of the Partial<Envois> applied to the Envois
   * @param {Envois[]} data - Envois[]
   * @param {Partial<Envois>[]} mask - Partial<Envois>[]
   * @returns - The data is being filtered by the mask.
   *   - The data is being mapped from the mask.
   */
  private static applyMask(data: Envois[], mask: Partial<Envois>[]) {
    const byMatchingTypeTiers = (tt: TypeTiers) => (e: Partial<Envois>) =>
      e.typeTiers.id === tt.id;
    // if (mask.length)
    //   data = data.filter(({ typeTiers }) => mask.find(byMatchingTypeTiers(typeTiers)));

    return (
      data
        // .filter(({ dateEnvoi }) => !dateEnvoi)
        .map((envoi) => {
          // const matching = mask.find(byMatchingTypeTiers(envoi.typeTiers));
          return {
            ...envoi,
            // commentairesAvancement: matching?.commentairesAvancement,
            // imprimante: matching?.imprimante,
            // dateEnvoi: matching?.dateEnvoi,
          };
        })
    );
  }

  ngOnInit() {
    this.societeSource = this.societeService.getDataSource();
    this.fluxSource = this.fluxService.getDataSource();
    this.moyenCommunicationSource =
      this.moyenCommunicationService.getDataSource();
    this.imprimanteSource = this.imprimanteService.getDataSource_v2([
      "id",
      "description",
    ]);
    this.imprimanteSource.filter(["valide", "=", true]);

    // Léa 09/2021
    // Moyen : les moyens EDIFACT et FTP ne doivent pas pouvoir être ajoutés par les utilisateurs de base (uniquement par les admin)
    // Flux : les flux FACTUR et FACDUP ne doivent pas pouvoir être ajoutés par les utilisateurs de base (uniquement par les admin)
    if (!this.authService.currentUser.adminClient) {
      this.moyenCommunicationSource.filter([
        ["id", "<>", "FTP"],
        "and",
        ["id", "<>", "EFT"],
      ]);
      this.fluxSource.filter([
        ["id", "<>", "FACDUP"],
        "and",
        ["id", "<>", "FACTUR"],
      ]);
    }

    if (!this.dataGrid.dataSource) {
      this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
        Grid.ChoixEnvois
      );
      this.columns = from(this.gridConfig).pipe(
        map((config) => config.columns)
      );
    }
  }

  onContentReady(event) {
    this.contentReadyEvent.emit(event);

    // Workaround for select all rows after loading data (without timeout do always select all)
    if (!this.canSelectAll) return;
    setTimeout(() => {
      event.component.selectAll();
      this.canSelectAll = false;
    }, 500);
  }

  displayIDBefore(data) {
    return data
      ? data.id +
          " - " +
          (data.nomUtilisateur
            ? data.nomUtilisateur
            : data.raisonSocial
            ? data.raisonSocial
            : data.description)
      : null;
  }

  onRowClick({ rowIndex }) {
    this.dataGrid.instance.editRow(rowIndex);
  }

  onValueChanged(event, cell) {
    if (cell.setValue) cell.setValue(event.value);
  }

  async clearTemps() {
    const temps: Partial<Envois>[] = this.dataGrid.instance
      .getDataSource()
      .items()
      .map(({ id }) => ({ id }));

    return this.envoisService.deleteTempEnvois(temps).toPromise();
  }

  reload(annuleOrdre?) {
    this.functionsService
      .geoPrepareEnvois(
        this.ordre.id,
        this.fluxID,
        true,
        annuleOrdre ? annuleOrdre : false,
        this.authService.currentUser.nomUtilisateur
      )
      .pipe(
        concatMapTo(
          this.envoisService.getList(
            `ordre.id==${this.ordre.id} and traite==A`,
            this.CHOIX_ENVOIS_FIELDS
          )
        ),
        map(
          (res) =>
            JSON.parse(JSON.stringify(res.data.allEnvoisList)) as Envois[]
        ) // unseal data
      )
      .subscribe({
        next: (data) => {
          this.canSelectAll = true;

          // handle annule&remplace
          if (this.ar?.hasData) {
            const { ignoredTiers, reasons } = this.ar.get();
            data = data
              .filter((e) => !ignoredTiers.includes(e.codeTiers))
              .map((e) => {
                e.commentairesAvancement = reasons?.[e.codeTiers];
                return e;
              });
          } else {
            if (this.annuleOrdre) {
              data = data.map((e) => {
                e.commentairesAvancement = "COMMANDE ANNULEE";
                return e;
              });
            }
            // We pre-fill comments when complementary order
            if (this.fluxID === "ORDRE" && this.ordre.type.id === "COM")
              this.addComplComment(data);
          }
          this.gridData = new DataSource(data);
        },
        error: (message) => notify({ message }, "error", 7000),
      });
  }

  private addComplComment(data) {
    data = data.map((e) => {
      const comInt = this.ordre.commentaireUsageInterne;
      const typeTiers = e.typeTiers.id;
      if (typeTiers === "C") {
        e.commentairesAvancement = comInt;
      } else {
        let filter = `ordre.numero==${comInt.slice(
          -6
        )} and typeTiers.id==${typeTiers} and `;
        filter += `codeTiers==${e.codeTiers} and (traite==N or traite==O)`;
        this.envoisService.countBy(filter).subscribe((res) => {
          if (res.data.countBy) {
            e.commentairesAvancement = comInt;
            this.dataGrid.instance.selectAll();
          }
        });
      }
      return e;
    });
  }

  public done() {
    const allEnvois = this.dataGrid.instance
      .getSelectedRowsData()
      .map(
        (envoi: Partial<Envois>) =>
          new Envois({ ...envoi, traite: "N" }, { deepFetch: true })
      );
    const action = this.ar.hasData ? "duplicateMergeAllEnvois" : "saveAll";

    const allNonEnvois = this.dataGrid.instance
      .getDataSource()
      .items()
      .filter((e) => !allEnvois.some((envoi) => envoi.id === e.id))
      .map(({ id }) => ({ id }));

    return zip(
      this.envoisService[action](allEnvois, new Set(["id", "traite"])),
      this.envoisService.deleteTempEnvois(allNonEnvois)
    ).pipe(finalize(() => this.ar.clear()));
  }
}
