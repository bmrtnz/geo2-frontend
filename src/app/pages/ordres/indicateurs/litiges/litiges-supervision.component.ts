import {
  AfterViewInit,
  Component,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import LitigeSupervision from "app/shared/models/litige-supervision.model";
import Litige from "app/shared/models/litige.model";
import { Role } from "app/shared/models/personne.model";
import { AuthService, LocalizationService } from "app/shared/services";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../../grids.service";
import { TabContext } from "../../root/root.component";
import {
  ClotureTarget,
  LitigeCloturePopupComponent,
} from "./litige-cloture-popup/litige-cloture-popup.component";

enum InputField {
  codeSecteur = "secteur",
  codeCommercial = "commercial",
  codeAssistante = "assistante",
}

enum searchType {
  codeSecteur = "SECTEUR",
  codeCommercial = "C",
  codeAssistante = "A",
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-litiges-supervision",
  templateUrl: "./litiges-supervision.component.html",
  styleUrls: ["./litiges-supervision.component.scss"],
})
export class LitigesSupervisionComponent implements OnInit, AfterViewInit {
  @Output() public infosLitige;

  public ordresDataSource: DataSource;
  public secteurs: DataSource;
  public commerciaux: DataSource;
  public assistantes: DataSource;
  public columnChooser = environment.columnChooser;
  private gridConfig: Promise<GridConfig>;
  public columns: Observable<GridColumn[]>;
  public toRefresh: boolean;
  public typeFiltrage: string;
  public codeFiltrage: string;
  public fields: string[];
  public currCompanyId: string;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild(LitigeCloturePopupComponent, { static: false }) cloturePopup: LitigeCloturePopupComponent;

  public formGroup = new UntypedFormGroup({
    codeSecteur: new UntypedFormControl(),
    codeCommercial: new UntypedFormControl(),
    codeAssistante: new UntypedFormControl(),
  } as Inputs<UntypedFormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public gridsService: GridsService,
    private secteursService: SecteursService,
    private personnesService: PersonnesService,
    public localization: LocalizationService,
    private currentCompanyService: CurrentCompanyService,
    public dateManagementService: DateManagementService,
    public litigesService: LitigesService,
    public authService: AuthService,
    private tabContext: TabContext
  ) {
    this.toRefresh = true;
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.Litiges
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));

    this.secteurs = this.secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      ["societes", "contains", this.currentCompanyService.getCompany().id],
    ]);
    this.commerciaux = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.commerciaux.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.COMMERCIAL],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
    this.assistantes = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.assistantes.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.ASSISTANT],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
    this.currCompanyId = this.currentCompanyService.getCompany().id;
  }

  async ngOnInit() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );
    this.fields = await fields.toPromise();
  }

  ngAfterViewInit() {
    const currSect = this.authService.currentUser.secteurCommercial;
    if (currSect) {
      this.formGroup.get("codeSecteur").patchValue(currSect);
      this.typeFiltrage = searchType.codeSecteur;
      this.codeFiltrage = currSect.id;
    }
  }

  displayIDBefore(data) {
    return data
      ? (data.code ? data.code : data.id) +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  enableFilters() {
    this.datagrid.dataSource = null;

    const values: Inputs = {
      ...this.formGroup.value,
    };

    // this.datagrid.instance.beginCustomLoading("");
    setTimeout(() => this.datagrid.instance.beginCustomLoading(""), 100);
    this.litigesService
      .allSupervisionLitige(
        this.typeFiltrage,
        this.codeFiltrage,
        new Set(this.fields)
      )
      .subscribe((res) => {
        this.datagrid.dataSource = res.data.allSupervisionLitige;
        this.datagrid.instance.refresh();
        this.datagrid.instance.endCustomLoading();
      });
  }

  onFieldValueChange(e?) {
    if (!e.event) return; // Only user event
    this.toRefresh = !!e.value; // A field is filled
    if (this.toRefresh) {
      // Clear other filters
      (Object.keys(searchType) as Array<keyof typeof searchType>).map((key) => {
        if (key !== e.element.id.split("-")[1]) this.formGroup.get(key).reset();
      });
      this.typeFiltrage = searchType[e.element?.id.split("-")[1]];
      this.codeFiltrage = e.value.id;
    }
  }

  onCellClick(e) {
    if (e.rowType === "group") {
      if (e.summaryItems[0]?.column === "id") {
        const data = e.data.items ?? e.data.collapsedItems;
        this.infosLitige = data[0];
        if (!this.infosLitige) return notify(this.localization.localize("warning-no-data"), "warning", 4000);
        this.cloturePopup.visible = true;
      }
    }
    if (e.rowType !== "data") return;
    const sameCompany = e.data.societe.id === this.currCompanyId;
    if (
      e.column.dataField === "numeroOrdre" &&
      e.data.numeroOrdre &&
      sameCompany
    )
      this.tabContext.openOrdre(
        e.data.numeroOrdre,
        e.data.litige.ordreOrigine.campagne.id
      );
  }

  onOpenNewOrder(ds) {
    const sameCompany =
      ds.data.societe.id === this.currentCompanyService.getCompany().id;
    if (ds.data.numeroOrdre && sameCompany)
      this.tabContext.openOrdre(
        ds.data.numeroOrdreRemplacement,
        ds.data.litige.ordreOrigine.campagne.id
      );
  }

  onCellPrepared(e) {
    const field = e.column.dataField;
    if (e.rowType === "data") {
      // Adjust numero ordre cell info/style
      if (field === "numeroOrdre") {
        if (e.data.societe.id === this.currCompanyId) {
          e.cellElement.classList.add("text-underlined");
          e.cellElement.setAttribute(
            "title",
            this.localization.localize("hint-click-ordre")
          );
        }
      }

      // Hide checkboxes as they're reported in parent group
      if (["clientClos", "fournisseurClos", "id"].includes(field)) {
        e.cellElement.classList.add("visibility-hidden");
      }
    }

    if (e.rowType === "group") {
      // Highlight groups and format headers
      if (e.column.dataField === "nomPersonne") {
        e.cellElement.classList.add("group-1-header");
        if (e.cellElement.textContent) {
          let data = e.data.items ?? e.data.collapsedItems;
          if (!data[0]) return;
          data = data[0].items ?? data[0].collapsedItems;
          if (!data[0]) return;
          e.cellElement.textContent = `Commercial(e) : ${data[0].prenomPersonne
            } ${data[0].nomPersonne.toUpperCase()}`;
        }
      }
      if (e.column.dataField === "litige.id") {
        e.cellElement.classList.add("group-2-header");
        if (e.cellElement.textContent) {
          const data = e.data.items ?? e.data.collapsedItems;
          if (!data[0]) return;
          e.cellElement.textContent = `Litige n° ${data[0].litige.id}`;
        }
      }

      if (
        ["clientClos", "fournisseurClos"].includes(e.summaryItems[0]?.column)
      ) {
        // Showing cloture checkboxes in group header
        // Not the cleanest way to do things! but no Dx native solution
        e.cellElement.innerHTML = `<div class='dx-datagrid-checkbox-size dx-checkbox ${e.summaryItems[0].value ? "dx-checkbox-checked" : ""
          }
         dx-state-readonly dx-widget'>
        <input type="hidden" value="${!!e.summaryItems[0].value}">
        <div class='dx-checkbox-container'>
        <span class='dx-checkbox-icon'></span></div></div>`;
      }
      if (e.summaryItems[0]?.column === "id") {
        // Showing cloture button in group header
        e.cellElement.innerHTML = `<div class="cloture-button">${this.localization.localize(
          "btn-close"
        )}</div>`;
      }
    }
  }

  public onClotureChanged(e) {
    this.enableFilters();
  }

  // public onClotureChanged([litigeID, clotureTarget]: [
  //   Litige["id"],
  //   ClotureTarget
  // ]) {
  //   const ds = this.datagrid.dataSource as Partial<LitigeSupervision>[];
  //   const index = ds.findIndex(({ litige }) => litige.id === litigeID);
  //   if (index >= 0) {
  //     ds[index] = {
  //       ...ds[index],
  //       clientClos: [ClotureTarget.Client, ClotureTarget.Both].includes(
  //         clotureTarget
  //       ),
  //       fournisseurClos: [
  //         ClotureTarget.Responsable,
  //         ClotureTarget.Both,
  //       ].includes(clotureTarget),
  //     };
  //   }
  // }
}

export default LitigesSupervisionComponent;
