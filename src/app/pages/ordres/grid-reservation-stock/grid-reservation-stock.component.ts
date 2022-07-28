import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import LigneReservation from "app/shared/models/ligne-reservation.model";
import StockReservation from "app/shared/models/stock-reservation.model";
import { AuthService, FournisseursService, LocalizationService } from "app/shared/services";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { StockMouvementsService } from "app/shared/services/api/stock-mouvements.service";
import { StocksService } from "app/shared/services/api/stocks.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable, zip } from "rxjs";
import { concatMap, concatMapTo, filter, finalize, map, withLatestFrom } from "rxjs/operators";
import { PromptPopupComponent } from "../../../shared/components/prompt-popup/prompt-popup.component";
import { GridsService } from "../grids.service";

export type Reservation = [number, number, string];

@Component({
  selector: "app-grid-reservation-stock",
  templateUrl: "./grid-reservation-stock.component.html",
  styleUrls: ["./grid-reservation-stock.component.scss"]
})
export class GridReservationStockComponent implements OnInit {

  @Input() public ordreLigneInfo: any;
  @Input() public articleID: string;
  @Input() private resaStatus: LigneReservation[];
  @Output() selectChange = new EventEmitter<any>();
  @Output() reservationChange = new EventEmitter<Reservation>();

  contentReadyEvent = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, { static: true }) dataGridResa: DxDataGridComponent;
  @ViewChild(PromptPopupComponent, { static: false }) promptPopupComponent: PromptPopupComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
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
    private fournisseursService: FournisseursService,
    private grids: GridsService,
  ) {
  }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreReservationStock);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Fond jaune pour les stocks J9-21 si stock et police vert/rouge selon stock
      if (["quantiteCalculee3", "quantiteCalculee4"].includes(e.column.dataField)) {
        if (e.value) {
          e.cellElement.classList.add("highlight-stockJ9-21-cell");
          if (e.value < 0) e.cellElement.classList.add("highlight-negativeStock-cell");
          if (e.value > 0) e.cellElement.classList.add("highlight-positiveStock-cell");
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
    if (e.column.dataField.indexOf("quantiteCalculee") === 0 ||
      e.column.dataField === "quantiteDisponible") {
      e.cellElement.classList.add("bold-text");
    }
    // Focus on current fournisseur
    if (e.rowType === "group") {
      if (e.column.dataField === "Fournisseur") {
        let data = e.data.items ?? e.data.collapsedItems;
        data = data[0];
        if (data.proprietaireCode === this.ordreLigneInfo.proprietaireMarchandise.code &&
          data.fournisseurCode === this.ordreLigneInfo.fournisseur.code) {
          this.dataGridResa.instance.option("focusedRowIndex", e.rowIndex);
        }
      }
    }
  }

  private pushReservation(event) {
    const [fournisseur, proprietaire] = event.key[0].split("/");
    this.ordreLignesService.getOne_v2(this.ordreLigneInfo.id, ["ordre.id"])
      .pipe(
        concatMap(ol => this.stockMouvementsService
          .fResaUneLigne(
            fournisseur,
            proprietaire,
            this.articleID,
            this.authService.currentUser.nomUtilisateur,
            this.ordreLigneInfo.nombreColisCommandes,
            ol.data.ordreLigne.ordre.id,
            this.ordreLigneInfo.id,
            "???",
            event.data[event.row.isExpanded ? "items" : "collapsedItems"][0].typePaletteCode,
          ))
      )
      .subscribe({
        next: res => {
          const { nb_resa: nombreResa, nb_dispo: quantiteDisponible } = res.data.fResaUneLigne.data;
          this.reservationChange.emit([nombreResa, quantiteDisponible, event.key[0]]);
        },
        error: message => notify({ message }, "error", 7000),
        complete: () => this.reloadSource(this.articleID),
      });
  }

  onCellClick(e) {

    // do nothing on expand cell click
    if (e.cellElement.classList.contains("dx-command-expand")) return;

    // do nothing on expanded rows
    if (!e?.data || e.rowType !== "group") return;

    const [fournisseur, proprietaire] = e.key[0].split("/");

    const currentFournisseur = this.resaStatus.length
      ? this.resaStatus[0].fournisseurCode
      : this.ordreLigneInfo.fournisseur.code;

    const currentProprietaire = this.resaStatus.length
      ? this.resaStatus[0].proprietaireCode
      : this.ordreLigneInfo.proprietaireMarchandise.code;

    // when selected source differ from the target (fournisseur)
    if (
      fournisseur !== currentFournisseur
      || proprietaire !== currentProprietaire
    ) {

      // Contrôle source non actuelle et retour le cas échéant
      let popupMessage = this.localizeService.localize("text-popup-changer-fournisseur");
      popupMessage = popupMessage
        .replace("&FPC", `${currentFournisseur} / ${currentProprietaire}`)
        .replace("&FPN", `${fournisseur} / ${proprietaire}`);

      return from(confirm(popupMessage, "Choix fournisseur"))
        .pipe(
          filter(v => !!v),
          concatMapTo(this.stockMouvementsService.deleteAllByOrdreLigneId(this.ordreLigneInfo.id)),
          withLatestFrom(zip(...[fournisseur, proprietaire]
            .map(code => this.fournisseursService.getFournisseurByCode(code, ["id"])),
          )),
          map(([, [resFournisseur, resProprietaire]]) => [
            ["fournisseur", resFournisseur.data.fournisseurByCode.id],
            ["proprietaireMarchandise", resProprietaire.data.fournisseurByCode.id],
          ]),
          concatMap((data) => zip(...data
            .map(([name, value]) => this.ordreLignesService.updateField(
              name,
              value,
              this.ordreLigneInfo.id,
              this.currentCompanyService.getCompany().id,
              ["id", `${name}.id`],
            )),
          )),
          finalize(() => this.grids.reload("Commande", "SyntheseExpeditions")),
        )
        .subscribe({
          error: ({ message }: Error) => notify(message, "error"),
          next: () => this.pushReservation(e),
        });
    }

    // when no actives resas, accept selection and exit
    if (!this.resaStatus.length) return this.pushReservation(e);
  }

  reloadSource(articleID: string) {
    this.reservationsSource = this.stocksService
      .getStockReservationDatasource(articleID);
  }

  clearDataSource() {
    this.dataGridResa.dataSource = null;
  }

  public calcFouProp(rowData: Partial<StockReservation>) {
    return `${rowData.fournisseurCode}/${rowData.proprietaireCode}`;
  }

  public calculateCustomSummary(options) {
    if (options.name === "typePaletteCode")
      if (options.summaryProcess === "calculate")
        options.totalValue = options.value;
  }

}
