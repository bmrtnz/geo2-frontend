import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  ViewChild
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
import { FormUtilsService } from "app/shared/services/form-utils.service";
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
import { GridsService } from "../grids.service";

let self;

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
    public gridsService: GridsService,
    public formUtilsService: FormUtilsService,
    private functionsService: FunctionsService,
    private envoisService: EnvoisService,
    private ar: FluxArService,
  ) {
    self = this;
    this.mailsDouanes = this.fluxService.mailsDouanes();
  }

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
    "numeroAcces2",
    "traite",
    "dateEnvoi",
    "dateSoumission",
    "dateDemande",
  ];

  readonly USER_MAIL = this.authService.currentUser.email;

  gridData: DataSource;
  rowKeys: any[];
  fluxSource: DataSource;
  societeSource: DataSource;
  moyenCommunicationSource: DataSource;
  imprimanteSource: DataSource;
  codeTiers: string;
  typeTiers: string;
  typeTiersLabel: string;
  public mailsDouanes: any[];
  public canBeSent: boolean;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public SelectBoxPopupWidth: number;
  columnChooser = environment.columnChooser;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
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

  onSelectBoxKeyUp(event, cell) {
    if (cell.column.dataField === "numeroAcces1" && this.USER_MAIL) {
      const myInput = event.element?.querySelector("input.dx-texteditor-input");
      if (myInput.value === "@") myInput.value = this.USER_MAIL
    }
  }

  onContentReady(event) {
    this.contentReadyEvent.emit(event);
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

  onCellClick(e) {
    if (e.rowType !== "data") return;

    // Handle CUSINV + Mail selectbox functionality
    if (e.column.dataField === "numeroAcces1") {
      if (e.data?.moyenCommunication?.id === 'MAI' && e.data?.flux.id === "CUSINV") {
        this.SelectBoxPopupWidth = 200;
        e.cellElement.classList.remove("no-arrow");
      } else {
        this.SelectBoxPopupWidth = 0;
      }
    }
  }

  onRowClick({ rowIndex }) {
    this.dataGrid.instance.editRow(rowIndex);
  }

  onValueChanged(event, cell) {
    if (cell.setValue) cell.setValue(event.value);
  }

  onCustomValueChanged(event, cell) {
    if (cell.setValue) {
      if (event.value.mail) {
        cell.setValue(event.value.mail); // Asssign mail (but we see description)
      } else {
        cell.setValue(event.value); // Or custom text
      }
    }
  }

  displayExpr(data) {
    if (data) {
      const match = self.mailsDouanes.find(d => d.mail === data);
      // We show description and not mail
      if (match) return match.description;
      return data.description ?? data;
    }
    return null;
  }

  clearTemps() {
    this.envoisService.getList(
      `ordre.id==${this.ordre.id} and traite==A`,
      ["id"]).subscribe(res => {
        const temps = res.data.allEnvoisList.map(({ id }) => ({ id }));
        this.envoisService.deleteTempEnvois(temps).toPromise()
      });
  }

  // Used to override std arrows behaviour
  onKeyDown({ event }: { event: { originalEvent: KeyboardEvent } }) {
    const keyCode = event.originalEvent?.code;
    const columnOptions = this.dataGrid.instance.columnOption(this.dataGrid.focusedColumnIndex);
    if (!["ArrowUp", "ArrowDown"].includes(keyCode) || columnOptions.name !== "numeroAcces2") return;
    this.saveCurrentCell((keyCode === "ArrowDown" ? 1 : -1));
  }

  async saveCurrentCell(dir) {
    this.dataGrid.instance.cellValue(
      this.dataGrid.focusedRowIndex,
      "numeroAcces2",
      this.dataGrid.instance.$element()[0].querySelector(".dx-focused .dx-texteditor-input")?.value
    );
    await this.gridsService.waitUntilAllGridDataSaved(this.dataGrid)
    this.moveRows(dir);
  }

  moveRows(dir) {
    this.dataGrid.instance.closeEditCell();
    // switch focus
    this.dataGrid.instance.focus(
      this.dataGrid.instance.getCellElement(
        this.dataGrid.focusedRowIndex + dir,
        this.dataGrid.focusedColumnIndex
      )
    );
  }

  reload(annuleOrdre?) {
    this.canBeSent = false;
    this.functionsService
      .geoPrepareEnvois(
        this.ordre.id,
        this.fluxID,
        false,
        !!annuleOrdre ? !!annuleOrdre : false,
        this.authService.currentUser.nomUtilisateur
      )
      .pipe(
        // on prepare aussi les envois en mode non annulation
        // de ce fait, on est sure d'avoir tout les tiers possibles
        concatMapTo(this.functionsService
          .geoPrepareEnvois(
            this.ordre.id,
            this.fluxID,
            false,
            !annuleOrdre ? !!annuleOrdre : false,
            this.authService.currentUser.nomUtilisateur
          )),
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

          // on retire les duplicats
          let uniqueEnvois = [];
          data.forEach(value => {
            if (!uniqueEnvois.find(v =>
              value.codeTiers === v.codeTiers &&
              value.numeroAcces1 === v.numeroAcces1 &&
              value.typeTiers.id === v.typeTiers.id
            ))
              uniqueEnvois.push(value);
          });
          // handle annule&remplace
          if (this.ar?.hasData) {
            const { ignoredTiers, reasons } = this.ar.get();
            uniqueEnvois = uniqueEnvois
              .filter((e) => !ignoredTiers.includes(e.codeTiers))
              .map((e) => {
                e.numeroAcces2 = reasons?.[e.codeTiers];
                return e;
              });
          } else {
            if (this.annuleOrdre) {
              uniqueEnvois = uniqueEnvois.map((e) => {
                e.numeroAcces2 = "COMMANDE ANNULEE";
                return e;
              });
            }
            // We pre-fill comments when complementary order
            if (this.fluxID === "ORDRE" && this.ordre.type.id === "COM")
              this.addComplComment(uniqueEnvois);
          }
          this.gridData = new DataSource(uniqueEnvois);
          setTimeout(() => {
            this.dataGrid.instance.selectAll().then((_) => this.canBeSent = true);
          }, 1000);
        },
        error: (message) => notify({ message }, "error", 7000),
      });
  }

  private addComplComment(data) {
    data = data.map((e) => {
      const comInt = this.ordre.commentaireUsageInterne;
      const typeTiers = e.typeTiers.id;
      if (typeTiers === "C") {
        e.numeroAcces2 = comInt;
      } else {
        let filter = `ordre.numero==${comInt.slice(
          -6
        )} and typeTiers.id==${typeTiers} and `;
        filter += `codeTiers==${e.codeTiers} and (traite==N or traite==O)`;
        this.envoisService.countBy(filter).subscribe((res) => {
          if (res.data.countBy) {
            e.numeroAcces2 = comInt;
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
          FormUtilsService.cleanTypenames({
            ...envoi,
            ...envoi.imprimante?.id !== null ? { imprimante: envoi.imprimante } : { imprimante: null },
            ...envoi.moyenCommunication?.id !== null ? { moyenCommunication: envoi.moyenCommunication } : { moyenCommunication: null },
            ...envoi.typeTiers?.id !== null ? { typeTiers: envoi.typeTiers } : { typeTiers: null },
            traite: "N"
          })
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
