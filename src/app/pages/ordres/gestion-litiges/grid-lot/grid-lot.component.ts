import { Component, Input, OnInit, ViewChild } from "@angular/core";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { Observable, of } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";

@Component({
  selector: "app-grid-lot",
  templateUrl: "./grid-lot.component.html",
  styleUrls: ["./grid-lot.component.scss"]
})
export class GridLotComponent implements OnInit {

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
  ) { }

  ngOnInit(): void {
    this.columns = this.gridConfiguratorService.fetchColumns(Grid.LitigeLignesLot);
  }

  onColumnsChange({ current }: { current: GridColumn[] }) {
    this.columns = of(current);
    this.fillGrid(of(current));
  }

  async fillGrid(columns: Observable<GridColumn[]>) {
    this.grid.dataSource = await columns.pipe(
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
