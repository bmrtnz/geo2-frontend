import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Entrepot } from "app/shared/models";
import { AuthService, EntrepotsService } from "app/shared/services";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn, SingleSelection } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable, of } from "rxjs";
import { TabContext } from "../root/root.component";
import { map } from "rxjs/operators";

@Component({
  selector: "app-grid-entrepots",
  templateUrl: "./grid-entrepots.component.html",
  styleUrls: ["./grid-entrepots.component.scss"],
})
export class GridEntrepotsComponent
  implements OnInit, SingleSelection<Entrepot>
{
  readonly gridID = Grid.OrdreEntrepot;

  @Output() public pulseButton = new EventEmitter();
  @Output() public createOrder = new EventEmitter();

  @ViewChild(DxDataGridComponent, { static: false })
  public grid: DxDataGridComponent;

  public columns: Observable<GridColumn[]>;
  public gridConfigHandler = (event) =>
    this.gridConfiguratorService.init(this.gridID, {
      ...event,
      title: "Liste des entrepôts",
      onColumnsChange: this.onColumnsChange.bind(this),
    });

  constructor(
    public entrepotsService: EntrepotsService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public tabContext: TabContext
  ) { }

  ngOnInit() {
    this.columns = this.gridConfiguratorService.fetchColumns(this.gridID);
    this.columns.subscribe((columns) => this.updateData(columns));
    // this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreEntrepot);
    // this.columns = from(this.gridConfig).pipe(GridConfiguratorService.getColumns());
    // const visibleFields = from(this.gridConfig)
    // .pipe(
    //   GridConfiguratorService.getColumns(),
    //   GridConfiguratorService.getVisible(),
    //   GridConfiguratorService.getFields(),
    // );
    // this.dataSource = this.entrepotsService
    // .getDataSource_v2(await visibleFields.toPromise());
    // this.entrepotGrid.dataSource = this.dataSource;
    // this.enableFilters();
  }

  // enableFilters() {
  //   const filters = [
  //     ['client.societe.id', '=', this.currentCompanyService.getCompany().id],
  //     'and',
  //     ['valide', '=', true],
  //     'and',
  //     ['client.valide', '=', true]
  //   ];

  //   this.dataSource.filter(filters);
  // }

  private updateData(columns: GridColumn[]) {
    of(columns)
      .pipe(
        GridConfiguratorService.getVisible(),
        GridConfiguratorService.getFields(),
        map((fields) =>
          this.entrepotsService.getDataSource_v2([
            Entrepot.getKeyField() as string,
            Entrepot.getLabelField() as string,
            ...fields,
          ])
        )
      )
      .subscribe((datasource) => {
        datasource.filter(this.buildFilters());
        this.grid.dataSource = datasource;
      });
  }

  buildFilters() {
    return [
      [
        "client.societe.id",
        "=",
        this.currentCompanyService.getCompany().id,
      ],
      "and",
      ["valide", "=", true],
      "and",
      ["client.valide", "=", true],
    ]
  }

  public reload() {
    (this.grid.dataSource as DataSource)?.filter(this.buildFilters());
    this.grid.instance.refresh();
  }


  onColumnsChange({ current }: { current: GridColumn[] }) {
    this.updateData(current);
  }

  onRowPrepared(e) {
    if (e.rowType === "data") e.rowElement.classList.add("cursor-pointer");
  }

  getSelectedItem() {
    return this.grid.instance
      .getVisibleRows()
      .filter((row) => row.key === this.grid.focusedRowKey)
      .map((row) => row.data)[0] as Partial<Entrepot>;
  }

  onFocusedRowChanged(e) {
    this.pulseButton.emit();
  }
}
