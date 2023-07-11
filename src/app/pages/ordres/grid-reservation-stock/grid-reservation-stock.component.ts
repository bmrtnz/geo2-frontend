import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import LigneReservation from "app/shared/models/ligne-reservation.model";
import StockReservation from "app/shared/models/stock-reservation.model";
import {
  AuthService,
  FournisseursService,
  LocalizationService,
} from "app/shared/services";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { StockMouvementsService } from "app/shared/services/api/stock-mouvements.service";
import { StocksService } from "app/shared/services/api/stocks.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { concat, defer, from, Observable, of, zip } from "rxjs";
import {
  concatMap,
  concatMapTo,
  filter,
  last,
  map,
  withLatestFrom,
} from "rxjs/operators";
import { PromptPopupComponent } from "../../../shared/components/prompt-popup/prompt-popup.component";
import { GridsService } from "../grids.service";

let self;

export type Reservation = [number, number, string];

@Component({
  selector: "app-grid-reservation-stock",
  templateUrl: "./grid-reservation-stock.component.html",
  styleUrls: ["./grid-reservation-stock.component.scss"],
})
export class GridReservationStockComponent implements OnInit, OnChanges {
  @Input() public ordreLigneInfo: any;
  @Input() public articleID: string;
  @Input() private resaStatus: LigneReservation[];
  @Output() selectChange = new EventEmitter<any>();
  @Output() reservationChange = new EventEmitter<Reservation>();

  contentReadyEvent = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, { static: true })
  datagrid: DxDataGridComponent;
  @ViewChild(PromptPopupComponent, { static: false })
  promptPopupComponent: PromptPopupComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  private gridReady: boolean;
  columnChooser = environment.columnChooser;
  reservationsSource: Observable<DataSource>;
  public summaryFields = [
    "quantiteDisponible",
    "quantiteInitiale",
    "quantiteReservee",
    "quantiteCalculee1",
    "quantiteCalculee2",
    "quantiteCalculee3",
    "quantiteCalculee4",
  ];

  constructor(
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public authService: AuthService,
    private stocksService: StocksService,
    private stockMouvementsService: StockMouvementsService,
    private ordreLignesService: OrdreLignesService,
    private currentCompanyService: CurrentCompanyService,
    public gridUtilsService: GridUtilsService,
    private fournisseursService: FournisseursService,
    public gridsService: GridsService
  ) {
    self = this;
    this.gridReady = false;
  }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreReservationStock
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  ngOnChanges() {
    this.gridReady = false;
    this.datagrid?.instance?.option("grouping", { autoExpandAll: false });
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Fond jaune pour les stocks J9-21 si stock et police vert/rouge selon stock
      if (
        ["quantiteCalculee3", "quantiteCalculee4"].includes(e.column.dataField)
      ) {
        if (e.value) {
          e.cellElement.classList.add("highlight-stockJ9-21-cell");
          if (e.value < 0)
            e.cellElement.classList.add("highlight-negativeStock-cell");
          if (e.value > 0)
            e.cellElement.classList.add("highlight-positiveStock-cell");
        }
      }
      // Fond jaune pour le fournisseur avec stocks J9-21
      if (e.column.dataField === "fournisseurCode") {
        if (e.data.quantiteCalculee3 || e.data.quantiteCalculee4) {
          e.cellElement.classList.add("highlight-stockJ9-21-cell");
        }
      }
    }
    // Higlight important columns
    if (
      e.column.dataField?.indexOf("quantiteCalculee") === 0 ||
      e.column.dataField === "quantiteDisponible"
    ) {
      e.cellElement.classList.add("bold-text");
    }
    // Focus on current fournisseur
    if (e.rowType === "group") {
      if (e.column.dataField === "Fournisseur" && this.ordreLigneInfo) {
        let data = e.data.items ?? e.data.collapsedItems;
        data = data[0];
        if (
          data.proprietaireCode ===
          this.ordreLigneInfo.proprietaireMarchandise?.code &&
          data.fournisseurCode === this.ordreLigneInfo.fournisseur?.code
        ) {
          this.datagrid.instance.option("focusedRowIndex", e.rowIndex);
        }
      }
    }
  }

  private pushReservation(event) {
    const fournisseur = event.data.fournisseurCode;
    const proprietaire = event.data.proprietaireCode;
    let desc =
      // eslint-disable-next-line max-len
      `Ordre ${this.ordreLigneInfo.ordre.numero}/${this.ordreLigneInfo.ordre.entrepot.code} (${this.authService.currentUser.nomUtilisateur})`;
    desc = desc.substring(0, 35); // Database limitation
    this.ordreLignesService
      .getOne_v2(this.ordreLigneInfo.id, ["ordre.id"])
      .pipe(
        concatMap((ol) =>
          this.stockMouvementsService.fResaUneLigne(
            fournisseur,
            proprietaire,
            this.articleID,
            this.authService.currentUser.nomUtilisateur,
            this.ordreLigneInfo.nombreColisCommandes,
            ol.data.ordreLigne.ordre.id,
            this.ordreLigneInfo.id,
            desc,
            event.data.typePaletteCode
          )
        )
      )
      .subscribe({
        next: (res) => {
          const { nb_resa: nombreResa, nb_dispo: quantiteDisponible } =
            res.data.fResaUneLigne.data;
          this.reservationChange.emit([
            nombreResa,
            quantiteDisponible,
            event.data.fournisseurCode,
          ]);
          // Updating new ordreLigneInfo for grid focus purposes
          this.ordreLigneInfo.proprietaireMarchandise = { code: proprietaire };
          this.ordreLigneInfo.fournisseur = { code: fournisseur };
        },
        error: (message) => notify({ message }, "error", 7000),
        complete: () => this.reloadSource(this.articleID),
      });
  }

  /** Spawn alert popup with confirmation in case of negative stock prediction */
  private alertNegativeReservation(
    quantiteDisponible: number,
    fournisseur: string
  ) {
    return defer(() =>
      of(quantiteDisponible - this.ordreLigneInfo.nombreColisCommandes)
    ).pipe(
      concatMap((prediction) =>
        prediction < 0
          ? // eslint-disable-next-line max-len
          confirm(
            `le fournisseur ${fournisseur} va passer en dispo négatif de ${prediction} colis, voulez-vous quand même déstocker ?`,
            "Attention"
          )
          : of(true)
      ),
      filter((result) => !!result)
    );
  }

  /** Spawn alert popup with confirmation in case of different user reservation */
  private alertOtherReservation(otherReservation: boolean, other: string) {
    return defer(() => of(otherReservation)).pipe(
      concatMap((prediction) =>
        prediction
          ? confirm(
            `Voulez-vous vraiment déstocker en utilisant une réservation prise par ${other} ?`,
            "Attention"
          )
          : of(true)
      ),
      filter((result) => !!result)
    );
  }

  onContentReady(e) {
    if (
      !this.gridReady &&
      this.datagrid.instance.getVisibleRows()?.length === 1
    ) {
      this.gridReady = true;
      this.datagrid.instance.option("grouping", { autoExpandAll: true });
    }
  }

  onCellClick(e) {

    // Do nothing if there's no colis or on expand cell click
    if (!this.ordreLigneInfo.nombreColisCommandes || e.cellElement.classList.contains("dx-command-expand")) return;

    // do nothing on expanded rows
    if (!e?.data || e.rowType === "group") return;

    const fournisseur = e.data.fournisseurCode;
    const proprietaire = e.data.proprietaireCode;

    const currentFournisseur = this.resaStatus.length
      ? this.resaStatus[0].fournisseurCode
      : this.ordreLigneInfo.fournisseur?.code ?? "-";

    const currentProprietaire = this.resaStatus.length
      ? this.resaStatus[0].proprietaireCode
      : this.ordreLigneInfo.proprietaireMarchandise?.code ?? "-";

    const selectedStocks: StockReservation[] = this.datagrid.instance
      .getVisibleRows()
      .filter(
        (r) =>
          r.data.fournisseurCode === e.data.fournisseurCode &&
          r.data.proprietaireCode === e.data.proprietaireCode
      )
      .map((d) => d.data);

    const alertNegative = this.alertNegativeReservation.bind(
      this,
      selectedStocks
        .map((s) => s.quantiteDisponible)
        .reduce((acm, crt) => acm + crt),
      `${selectedStocks[0].fournisseurCode} / ${selectedStocks[0].proprietaireCode}`
    );

    const otherReservation = !!(
      e.data.option &&
      !e.data.option
        ?.toUpperCase()
        .includes(this.authService.currentUser.nomUtilisateur)
    );
    const alertOther = this.alertOtherReservation.bind(
      this,
      otherReservation,
      e.data.option
    );

    // when selected source differ from the target (fournisseur)
    if (
      fournisseur !== currentFournisseur ||
      proprietaire !== currentProprietaire
    ) {
      // Contrôle source non actuelle et retour le cas échéant
      let popupMessage = this.localizeService.localize(
        "text-popup-changer-fournisseur"
      );
      popupMessage = popupMessage
        .replace("&FPC", `${currentFournisseur} / ${currentProprietaire}`)
        .replace("&FPN", `${fournisseur} / ${proprietaire}`);

      return from(confirm(popupMessage, "Choix fournisseur"))
        .pipe(
          filter((v) => !!v),
          concatMapTo(alertOther()),
          filter((v) => !!v),
          concatMapTo(alertNegative()),
          concatMapTo(
            this.stockMouvementsService.deleteAllByOrdreLigneId(
              this.ordreLigneInfo.id
            )
          ),
          withLatestFrom(
            zip(
              ...[fournisseur, proprietaire].map((code) =>
                this.fournisseursService.getFournisseurByCode(code, ["id"])
              )
            )
          ),
          map(([, [resFournisseur, resProprietaire]]) => [
            [
              "proprietaireMarchandise",
              resProprietaire.data.fournisseurByCode.id,
            ],
            ["fournisseur", resFournisseur.data.fournisseurByCode.id],
          ]),
          concatMap((data) =>
            concat(
              ...data.map(([name, value]) =>
                this.ordreLignesService.updateField(
                  name,
                  value,
                  this.ordreLigneInfo.id,
                  this.currentCompanyService.getCompany().id,
                  ["id", `${name}.id`]
                )
              )
            )
          ),
          last()
        )
        .subscribe({
          error: ({ message }: Error) => notify(message, "error"),
          next: () => this.pushReservation(e),
        });
    }

    // when no actives resas, accept selection and exit
    if (!this.resaStatus.length)
      return alertOther()
        .pipe(
          filter((v) => !!v),
          concatMapTo(alertNegative())
        )
        .subscribe(() => this.pushReservation(e));
  }

  reloadSource(articleID: string) {
    this.datagrid.instance.option("focusedRowIndex", -1);
    this.reservationsSource =
      this.stocksService.getStockReservationDatasource(articleID);
  }

  clearDataSource() {
    this.datagrid.dataSource = null;
  }

  public calcFouProp(rowData: Partial<StockReservation>) {
    return `${rowData.fournisseurCode}/${rowData.proprietaireCode}`;
  }

  public calculateCustomSummary(options) {
    if (options.name === "typePaletteCode") {
      if (options.summaryProcess === "start") {
        options.totalValue = [];
      } else if (options.summaryProcess === "calculate") {
        options.totalValue.push(options.value);
      } else if (options.summaryProcess === "finalize") {
        options.totalValue = [...new Set(options.totalValue)].slice(0); // removes duplicates
        options.totalValue = self.gridUtilsService.friendlyFormatList(
          options.totalValue
        );
      }
    }
  }
}
