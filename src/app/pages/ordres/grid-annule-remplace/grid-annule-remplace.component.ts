import { Component, Input, OnInit, ViewChild } from "@angular/core";
import Envois from "app/shared/models/envois.model";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { RaisonsAnnuleRemplaceService } from "app/shared/services/api/raisons-annule-remplace.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable, of } from "rxjs";
import { concatMap, concatMapTo, map, take } from "rxjs/operators";

@Component({
  selector: "app-grid-annule-remplace",
  templateUrl: "./grid-annule-remplace.component.html",
  styleUrls: ["./grid-annule-remplace.component.scss"]
})
export class GridAnnuleRemplaceComponent implements OnInit {

  readonly AR_ENVOIS_FIELDS = [
    "id",
    "typeTiers.description",
    "codeTiers",
    "dateDemande", // date_entete
    "dateSoumission", // date_lignes
    "dateEnvoi", // date_envois
    "commentairesAvancement", // raison anule et remplace
  ];

  firstReason: any;
  public copyPasteVisible: boolean;
  public raisonsList: string[];
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  @Input() ordre: { id: string } & Partial<Ordre>;

  constructor(
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public raisonsAnnuleRemplaceService: RaisonsAnnuleRemplaceService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    private functionsService: FunctionsService,
    private envoisService: EnvoisService,
  ) {
    this.raisonsList = [];
    this.raisonsAnnuleRemplaceService.getDataSource_v2(["description"]).load().then(res => {
      res.map(inst => this.raisonsList.push(inst.description));
    });
  }

  ngOnInit() {
    if (!this?.dataGrid?.dataSource) {
      this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.AnnuleRemplace);
      this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    }
  }

  onContentReady(event) {
    this.handleRaisonAR();
    this.dataGrid.instance.selectAll();
  }

  onRowClick({ rowIndex }) {
    this.dataGrid.instance.editRow(rowIndex);
  }

  onValueChanged(event, cell) {
    if (cell.setValue)
      cell.setValue(event.value);
  }

  handleRaisonAR() {
    this.firstReason = this.dataGrid?.dataSource?.[0]?.commentairesAvancement;
    let sameText = true;
    (this.dataGrid?.dataSource as Partial<Envois>[])?.map((ds) => {
      if (ds.commentairesAvancement !== this.firstReason) sameText = false;
    });
    this.copyPasteVisible = !!(this.dataGrid?.dataSource?.[0]?.commentairesAvancement)
      && !sameText && (this.dataGrid?.dataSource as Partial<Envois>[]).length > 1;
  }

  displayCapitalize(data) {
    return data ? data.charAt(0).toUpperCase() + data.slice(1).toLowerCase() : null;
  }

  copyPasteFirstRow() {
    (this.dataGrid.dataSource as Partial<Envois>[]).map(ds => ds.commentairesAvancement = this.firstReason);
    this.dataGrid.instance.refresh();
  }

  reload() {
    this.envoisService.countByOrdreFluxTraite(
      { id: this.ordre.id },
      { id: "ORDRE" },
      "R",
    )
      .pipe(
        concatMap(res => res.data.countByOrdreFluxTraite
          ? of({ res: 1 })
          : this.functionsService.ofAREnvois(this.ordre.id).valueChanges),
        concatMapTo(this.envoisService.getList(
          `ordre.id==${this.ordre.id} and traite==R`,
          this.AR_ENVOIS_FIELDS,
        )),
        take(1),
        map(res => res.data.allEnvoisList),
      )
      .subscribe({
        next: data => this.dataGrid.dataSource = data,
        error: message => notify({ message }, "error", 7000),
      });
  }

  public done() {
    const selection = this.dataGrid.instance.getSelectedRowsData();
    console.log(selection);
    // .map(({ id }: Partial<Envois>) => ({ id, traite: "N" }));
    // return this.envoisService
    //   .saveAll(allEnvois, new Set(["id", "traite"]));
  }

}


