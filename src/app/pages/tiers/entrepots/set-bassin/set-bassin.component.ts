import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BaseTarif, BureauAchat, Devise, Entrepot, Transporteur } from "app/shared/models";
import { AuthService, TransporteursService } from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { DevisesService } from "app/shared/services/api/devises.service";
import { EntrepotsTransporteursBassinsService } from "app/shared/services/api/entrepots-transporteurs-bassins.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import dxDataGrid from "devextreme/ui/data_grid";
import { Observable } from "rxjs";
import { concatMap, filter, map, takeWhile, tap } from "rxjs/operators";

const BASSINS = ["UDC", "VDL", "SE", "SW", "IMP"];

@Component({
  selector: "app-set-bassin",
  templateUrl: "./set-bassin.component.html",
  styleUrls: ["./set-bassin.component.scss"]
})
export class SetBassinComponent implements OnInit {

  public etbDatasource: DataSource;
  public columns: Observable<GridColumn[]>;
  public contentReadyEvent = new EventEmitter<any>();
  public allowAdding: boolean;
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  @Input() readOnly: boolean;

  constructor(
    private etbService: EntrepotsTransporteursBassinsService,
    private bureauxAchatService: BureauxAchatService,
    private transporteursService: TransporteursService,
    private basesTarifService: BasesTarifService,
    private devisesService: DevisesService,
    public authService: AuthService,
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
      this.transporteursService.getLookupStore<Transporteur>(["id", "raisonSocial", "ville"], "valide==true"),
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
    const bassListFilter = BASSINS.map((bassin) => `id=="${bassin}"`).join(" or ");
    const source = this.bureauxAchatService
      .getLookupStore<BureauAchat>(["id", "raisonSocial"], `valide==true ${(bacFilter ? "and " + bacFilter : "")} and (${bassListFilter})`);
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

  public onRowClick({ rowIndex }) {
    this.dataGrid.instance.editRow(rowIndex);
  }

  public onOpened(elem) {
    // Maximize dropdown list size
    let width = 0;
    if (elem.element.parentElement.classList.contains("largeDropDown")) width = 500;
    if (elem.element.parentElement.classList.contains("mediumDropDown")) width = 250;
    if (elem.element.parentElement.classList.contains("smallDropDown")) width = 125;
    if (width) elem.component._popup.option("width", width);
  }

  private arrayElsIncluded(arr, target) {
    return target.every(v => arr.includes(v));
  }

  public gridReady() {
    // If all bassins listed, disables adding functionality
    const datasource = this.dataGrid.dataSource as DataSource;
    if (datasource) {
      const bass = [];
      datasource?.items().map(el => bass.push(el.bureauAchat.id));
      this.allowAdding = !this.arrayElsIncluded(bass, BASSINS);
    }
  }

}
