import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges, ViewChild } from "@angular/core";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { Observable, of } from "rxjs";
import { concatMap, filter, map, tap } from "rxjs/operators";
import { GridsService } from "../../grids.service";

@Component({
  selector: "app-grid-lot",
  templateUrl: "./grid-lot.component.html",
  styleUrls: ["./grid-lot.component.scss"]
})
export class GridLotComponent implements OnInit, OnChanges {

  @Input() lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]];

  @ViewChild(DxDataGridComponent) private grid: DxDataGridComponent;

  public columns: Observable<GridColumn[]>;
  public gridConfigHandler = event =>
    this.gridConfiguratorService.init(Grid.LitigeLignesLot, {
      ...event,
      onColumnsChange: this.onColumnsChange.bind(this),
    })

  constructor(
    private litigesLignesService: LitigesLignesService,
    private gridConfiguratorService: GridConfiguratorService,
    private gridsService: GridsService,
  ) {
    this.columns = this.gridConfiguratorService.fetchColumns(Grid.LitigeLignesLot);
  }

  ngOnInit(): void {
    this.gridsService.register("LitigeLignesLot", this.grid);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.lot.currentValue !== changes.lot.previousValue && this.grid) {
      this.fillGrid();
    }
  }

  onColumnsChange({ current }: { current: GridColumn[] }) {
    this.columns = of(current);
    this.fillGrid(of(current));
  }

  async fillGrid(columns?: Observable<GridColumn[]>) {
    this.grid.dataSource = await (columns ?? this.columns).pipe(
      filter(() => !!this.lot),
      concatMap(c => this.fetchDatasource(...this.lot, c)),
    ).toPromise();
  }

  private fetchDatasource(
    litigeID: Litige["id"],
    numeroGroupement: LitigeLigne["numeroGroupementLitige"],
    columns: GridColumn[],
  ) {
    return of(columns).pipe(
      map(c => c.filter(({ visible }) => visible).map(({ dataField }) => dataField)),
      concatMap(fields => this.litigesLignesService.allLitigeLigneFait(litigeID, numeroGroupement, new Set(fields))),
      map(data => new DataSource(data.data.allLitigeLigneFait)),
    );
  }

}
