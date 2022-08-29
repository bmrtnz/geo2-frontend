import { Component, EventEmitter, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BaseTarif, BureauAchat, Devise, Entrepot, Transporteur } from "app/shared/models";
import { TransporteursService } from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { DevisesService } from "app/shared/services/api/devises.service";
import { EntrepotsTransporteursBassinsService } from "app/shared/services/api/entrepots-transporteurs-bassins.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import dxDataGrid from "devextreme/ui/data_grid";
import { Observable } from "rxjs";
import { concatMap, filter, map, takeWhile, tap } from "rxjs/operators";

@Component({
  selector: "app-set-bassin",
  templateUrl: "./set-bassin.component.html",
  styleUrls: ["./set-bassin.component.scss"]
})
export class SetBassinComponent implements OnInit {

  public etbDatasource: DataSource;
  public columns: Observable<GridColumn[]>;
  public contentReadyEvent = new EventEmitter<any>();

  constructor(
    private etbService: EntrepotsTransporteursBassinsService,
    private bureauxAchatService: BureauxAchatService,
    private transporteursService: TransporteursService,
    private basesTarifService: BasesTarifService,
    private devisesService: DevisesService,
    private gridConfiguratorService: GridConfiguratorService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.columns = this.gridConfiguratorService.fetchColumns(Grid.Bassin);

    this.route.paramMap.pipe(
      concatMap(params => this.fetchDatasource(params.get("id"))),
    ).subscribe(datasource => this.etbDatasource = datasource);

    // wait until grid columns a ready
    this.contentReadyEvent
      .pipe(
        filter(event => event.component.columnCount() !== 0),
        takeWhile(event => event.component.columnCount() <= 0, true),
      )
      .subscribe(event => this.bindSources(event));

  }

  /** lookup columns datasource binding */
  private bindSources(event: { component: dxDataGrid; }) {
    this.updateBacSource(event.component);
    GridConfiguratorService.bindLookupColumnSource(
      event.component,
      "transporteur.id",
      this.transporteursService.getLookupStore<Transporteur>(["id", "raisonSocial"], "valide==true"),
    );
    GridConfiguratorService.bindLookupColumnSource(
      event.component,
      "baseTarifTransport.id",
      this.basesTarifService.getLookupStore<BaseTarif>(["id", "description"], "valide==true"),
    );
    GridConfiguratorService.bindLookupColumnSource(
      event.component,
      "deviseTarifTransport.id",
      this.devisesService.getLookupStore<Devise>(["id", "description"], "valide==true"),
    );
  }

  // used to restrict bac to a single occurence
  private updateBacSource(component: dxDataGrid) {
    const usedBacs: Partial<BureauAchat>[] = component.getDataSource()?.items().map(({ bureauAchat }) => bureauAchat);
    const bacFilter = usedBacs?.map(({ id }) => `id!="${id}"`).join(" and ");
    const source = this.bureauxAchatService
      .getLookupStore<BureauAchat>(["id", "raisonSocial"], `valide==true and ${bacFilter}`);
    GridConfiguratorService.bindLookupColumnSource(component, "bureauAchat.id", source);
  }

  private fetchDatasource(entrepotID: Entrepot["id"]) {
    return this.columns.pipe(
      map(columns => columns.map(({ dataField, calculateDisplayValue }) => [dataField, calculateDisplayValue]).flat(2)),
      map(fields => this.etbService.getDataSource_v2([
        ...fields,
      ])),
      tap(datasource => datasource.filter([
        ["valide", "=", true],
        "and",
        ["entrepot.id", "=", entrepotID],
      ]))
    );
  }

  public onInserting(event) {
    // complete row data
    event.data.entrepot = { id: this.route.snapshot.paramMap.get("id") } as { id: string } & Partial<Entrepot>;
    event.data.valide = true;
  }

  public onSaved(event: { changes: any[]; component: dxDataGrid; }) {
    (this.etbDatasource.store() as CustomStore).push(event.changes);
    this.updateBacSource(event.component);
  }

}
