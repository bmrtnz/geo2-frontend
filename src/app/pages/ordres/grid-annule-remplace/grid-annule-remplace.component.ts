import { Component, OnInit, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridConfiguratorService, Grid, GridConfig } from "app/shared/services/grid-configurator.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { RaisonsAnnuleRemplaceService } from "app/shared/services/api/raisons-annule-remplace.service";

@Component({
  selector: "app-grid-annule-remplace",
  templateUrl: "./grid-annule-remplace.component.html",
  styleUrls: ["./grid-annule-remplace.component.scss"]
})
export class GridAnnuleRemplaceComponent implements OnInit {

  dataSource: any;
  firstReason: any;
  public copyPasteVisible: boolean;
  public raisonsList: string[];
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;

  constructor(
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public raisonsAnnuleRemplaceService: RaisonsAnnuleRemplaceService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
  ) {
    this.raisonsList = [];
    this.raisonsAnnuleRemplaceService.getDataSource_v2(["description"]).load().then(res => {
      res.map(inst => this.raisonsList.push(inst.description));
    });
  }

  ngOnInit() {

    if (!this.dataGrid.dataSource) {
      this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.AnnuleRemplace);
      this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    }

    this.dataSource = [{
      modifEntete: "05/04/2022 16:48:27",
      modifLignes: "08/03/2022 14:21:33",
      dernierEnvoi: "07/03/2022 11:47:22",
      typeTiers: "F",
      nom: "COFRA",
      raisonAnnuleRemplace: "Lignes ajoutées",
      nePasEnvoyer: ""
    },
    {
      modifEntete: "05/04/2022 16:48:27",
      modifLignes: "",
      dernierEnvoi: "07/03/2022 11:47:22",
      typeTiers: "T",
      nom: "SATMOI",
      raisonAnnuleRemplace: "",
      nePasEnvoyer: ""
    },
    {
      modifEntete: "05/04/2022 16:48:27",
      modifLignes: "",
      dernierEnvoi: "07/03/2022 11:47:22",
      typeTiers: "T",
      nom: "MOISSAC",
      raisonAnnuleRemplace: "",
      nePasEnvoyer: ""
    }
    ];
    this.dataGrid.dataSource = this.dataSource;

  }

  onRowClick({ rowIndex }) {
    this.dataGrid.instance.editRow(rowIndex);
  }

  onValueChanged(event, cell) {
    if (cell.setValue)
      cell.setValue(event.value);
  }

  onContentReady() {
    this.firstReason = this.dataSource[0]?.raisonAnnuleRemplace;
    let sameText = true;
    this.dataSource.map((ds) => {
      if (ds.raisonAnnuleRemplace !== this.firstReason) sameText = false;
    });
    this.copyPasteVisible = !!(this.dataSource[0]?.raisonAnnuleRemplace) && !sameText && this.dataSource.length > 1;
  }

  displayCapitalize(data) {
    return data ? data.charAt(0).toUpperCase() + data.slice(1).toLowerCase() : null;
  }

  copyPasteFirstRow() {
    this.dataSource.map(ds => ds.raisonAnnuleRemplace = this.firstReason);
    this.dataGrid.instance.refresh();
  }

}


