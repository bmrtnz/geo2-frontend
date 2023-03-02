import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges, ViewChild } from "@angular/core";
import LitigeLigneFait from "app/shared/models/litige-ligne-fait.model";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import ArrayStore from "devextreme/data/array_store";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { EMPTY, iif, Observable, of } from "rxjs";
import { concatMap, concatMapTo, filter, map, tap } from "rxjs/operators";
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
    private litigesService: LitigesService,
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

  private onColumnsChange({ current }: { current: GridColumn[] }) {
    this.columns = of(current);
    this.fillGrid(of(current));
  }

  private async fillGrid(columns?: Observable<GridColumn[]>) {
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
      GridConfiguratorService.getVisible(),
      GridConfiguratorService.getFields(),
      map(fields => [
        ...fields,
        "ligne.id",
        "ligne.litige.id",
        "ligne.ordreLigne.id",
        "ligne.numeroGroupementLitige",
      ]),
      map(fields => this.litigesLignesService
        .allLitigeLigneFaitDatasource(litigeID, numeroGroupement ?? "", new Set(fields))),
    );
  }

  /** Mutate grid rows by adding them a `numeroGroupementLitige` and validity, if they don't already have one */
  public assignLot() {
    const datasource = this.grid.dataSource as DataSource;
    const items: Array<Partial<LitigeLigneFait>> = datasource.items();

    // Persisting
    return iif(() => !items[0].ligne.numeroGroupementLitige,
      this.litigesService.genNumLot(items[0].ligne.litige.id).pipe(
        concatMap(res => this.litigesLignesService
          .saveAll(new Set(["id", "numeroGroupementLitige"]), items
            .map(item => ({
              ...item.ligne,
              valide: true,
              numeroGroupementLitige: res.data.genNumLot,
            }))))
      ), EMPTY
    );
  }

}
