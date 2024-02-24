import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { PromptPopupComponent } from "app/shared/components/prompt-popup/prompt-popup.component";
import { ModeLivraison } from "app/shared/models";
import OrdreBaf from "app/shared/models/ordre-baf.model";
import Ordre, { Statut, StatutLocale } from "app/shared/models/ordre.model";
import { Role } from "app/shared/models/personne.model";
import {
  AuthService,
  ClientsService,
  EntrepotsService,
  LocalizationService
} from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdresBafService } from "app/shared/services/api/ordres-baf.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxProgressBarComponent, DxSelectBoxComponent } from "devextreme-angular";
import { LoadResult } from "devextreme/common/data/custom-store";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { ClickEvent } from "devextreme/ui/button";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { concatMap, filter, map, toArray } from "rxjs/operators";
import { TabContext } from "../../root/root.component";

let self;

enum InputField {
  valide = "valide",
  secteurCode = "secteur",
  clientCode = "client",
  entrepotCode = "entrepot",
  codeCommercial = "commercial",
  codeAssistante = "assistante",
  dateMin = "dateMin",
  dateMax = "dateMax",
  societeCode = "societe",
}

enum status {
  OK = "0",
  ALERTE = "1",
  BLOQUÉ = "2",
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-supervision-a-facturer",
  templateUrl: "./supervision-a-facturer.component.html",
  styleUrls: ["./supervision-a-facturer.component.scss"],
})
export class SupervisionAFacturerComponent implements OnInit, AfterViewInit {
  readonly INDICATOR_NAME = "SupervisionAFacturer";

  public ordresDataSource: DataSource;
  public secteurs: DataSource;
  public clients: DataSource;
  public entrepots: DataSource;
  public commerciaux: DataSource;
  public assistantes: DataSource;
  public promptPopupTitle: string;
  public periodes: any[];
  public columnChooser = environment.columnChooser;
  private gridConfig: Promise<GridConfig>;
  private currOrder: Partial<Ordre>;
  private currCell: any;
  public columns: Observable<GridColumn[]>;
  public gridItemsSelected: boolean;
  public launchEnabled: boolean;
  public clotureEnabled: boolean;
  public countOrders: number;
  public processedOrders: number;
  public store: CustomStore;
  public company: string;
  public DsItems: any[];
  private clearSpinner: any;
  public stepRefresh: number;
  public running = {
    loading: false,
  }


  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild(PromptPopupComponent) promptPopup: PromptPopupComponent;
  @ViewChild("progressBar", { static: false }) progress: DxProgressBarComponent;


  public formGroup = new UntypedFormGroup({
    valide: new UntypedFormControl(true),
    secteurCode: new UntypedFormControl(),
    clientCode: new UntypedFormControl(),
    entrepotCode: new UntypedFormControl(),
    codeCommercial: new UntypedFormControl(),
    codeAssistante: new UntypedFormControl(),
    dateMin: new UntypedFormControl(this.dateManagementService.startOfDay()),
    dateMax: new UntypedFormControl(this.dateManagementService.endOfDay()),
  } as Inputs<UntypedFormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private secteursService: SecteursService,
    private ordresService: OrdresService,
    private personnesService: PersonnesService,
    private entrepotsService: EntrepotsService,
    private clientsService: ClientsService,
    public localization: LocalizationService,
    public dateManagementService: DateManagementService,
    private currentCompanyService: CurrentCompanyService,
    public ordresBafService: OrdresBafService,
    public authService: AuthService,
    private tabContext: TabContext,
    private functionsService: FunctionsService,
  ) {
    self = this;
    this.company = this.currentCompanyService.getCompany().id;
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdresAFacturer
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));

    this.secteurs = this.secteursService.getDataSource();
    this.secteurs.filter([
      ["valide", "=", true],
      "and",
      ["societes", "contains", this.company],
    ]);
    this.commerciaux = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.commerciaux.filter([
      // ["valide", "=", true],
      // "and",
      ["role", "=", Role.COMMERCIAL],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
    this.assistantes = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.assistantes.filter([
      // ["valide", "=", true],
      // "and",
      ["role", "=", Role.ASSISTANT],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
    this.periodes = this.dateManagementService.periods();
    this.gridItemsSelected = false;
  }

  async ngOnInit() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    this.ordresDataSource = this.ordresBafService.getDataSource_v2([
      ...await fields.toPromise(),
      "ordre.entrepot.modeLivraison",
      "ordre.logistiques.expedieStation",
    ]);
  }

  ngAfterViewInit() {

    // Only way found to validate and show Warning icon
    this.formGroup.get("secteurCode").setValue("");
    this.formGroup.get("secteurCode").reset();

    if (this.authService.currentUser.secteurCommercial) {
      this.formGroup
        .get("secteurCode")
        .patchValue(this.authService.currentUser.secteurCommercial);
    }

    this.setDefaultPeriod(this.authService.currentUser?.periode ?? "J");
    this.authService.onUserChanged().subscribe(() =>
      this.setDefaultPeriod(this.authService.currentUser?.periode ?? "J")
    );

    // Fill commercial/assistante input from user role
    if (
      !this.authService.isAdmin &&
      this.authService.currentUser.personne?.role
    ) {
      if (
        this.authService.currentUser.personne?.role?.toString() ===
        Role[Role.COMMERCIAL]
      )
        this.formGroup
          .get("codeCommercial")
          .setValue(this.authService.currentUser.assistante); // API Inverted, don't worry
      if (
        this.authService.currentUser.personne?.role?.toString() ===
        Role[Role.ASSISTANT]
      )
        this.formGroup
          .get("codeAssistante")
          .setValue(this.authService.currentUser.commercial); // API Inverted, don't worry
    }
  }

  setDefaultPeriod(periodId) {
    let myPeriod = this.dateManagementService.getPeriodFromId(
      periodId,
      this.periodes
    );
    if (!myPeriod) return;
    this.periodeSB?.instance.option("value", myPeriod);
    const datePeriod = this.dateManagementService.getDates({
      value: myPeriod,
    });
    this.formGroup.patchValue({
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin,
    });
  }

  progressFormat(ratio) {
    return `${self.localization.localize("loading")} : ${Math.round(ratio * 100)}%`;
  }

  progressSet(ratio?) {
    this.progress.value = ratio ?? 0;
  }

  displayCodeBefore(data) {
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
    if (!this.formGroup.get("secteurCode").value) {
      this.toast("please-select-sector", "error");
    } else {
      this.running.loading = true;
      clearTimeout(this.clearSpinner);
      this.progressSet(); // Initialize progress bar
      this.datagrid.instance.clearSelection();
      this.launchEnabled = true;
      this.datagrid.dataSource = null;

      const values: Inputs = { ...this.formGroup.value };

      this.ordresBafService.setPersisantVariables({
        secteurCode: values.secteurCode.id,
        dateMin: this.dateManagementService.formatDate(values.dateMin),
        dateMax: this.dateManagementService.formatDate(values.dateMax),
        clientCode: values.clientCode?.id,
        societeCode: this.company,
        entrepotCode: values.entrepotCode?.id,
        codeCommercial: values.codeAssistante?.id, // Inverted as inverted in orders table
        codeAssistante: values.codeCommercial?.id, // Inverted as inverted in orders table
      } as Inputs);

      setTimeout(() => { // Dx needs some time for updating data
        this.progressSet(5);
        this.datagrid.instance.beginCustomLoading("");
        this.ordresDataSource.load().then(res => {
          this.DsItems = JSON.parse(JSON.stringify(res));
          this.datagrid.dataSource = this.DsItems;
          this.countOrders = this.DsItems.length;
          if (!this.countOrders) return this.endOfProcess();
          this.processedOrders = 0;
          this.progressSet(20);
          this.stepRefresh = Math.min(Math.max(Math.round(this.countOrders / 60), 1), 10);
          setTimeout(() => this.DsItems.map(data => this.controlBaf(data, data.ordreRef)));
        });
      });
    }
  }

  controlBaf(data, ordreRef) {
    this.ordresBafService
      .fControlBaf(ordreRef, this.company)
      .subscribe({
        next: (res: any) => {
          data.indicateurBaf = res.data.fControlBaf.data.ind_baf;
          data.description = res.data.fControlBaf.data.desc_ctl;
          data.pourcentageMargeBrut = res.data.fControlBaf.data.pc_marge_brute;
          data.indicateurTransporteur = res.data.fControlBaf.data.ind_trp;
          data.indicateurDate = res.data.fControlBaf.data.ind_date;
          data.indicateurPrix = res.data.fControlBaf.data.ind_prix;
          data.indicateurStation = res.data.fControlBaf.data.ind_station;
          data.indicateurQte = res.data.fControlBaf.data.ind_qte;
          data.indicateurAutre = res.data.fControlBaf.data.ind_autre;
          this.processedOrders++;
          const ratio = Math.round(79 * this.processedOrders / this.countOrders) + 20;
          if (!(ratio % this.stepRefresh)) this.progressSet(ratio);
          if (this.processedOrders === this.countOrders) {
            this.endOfProcess(true);
            setTimeout(() => {
              this.DsItems.sort((a, b) => {
                if (a.indicateurBaf < b.indicateurBaf) return -1;
                if (a.indicateurBaf > b.indicateurBaf) return 1;
                if (a.numeroOrdre < b.numeroOrdre) return -1;
                if (a.numeroOrdre > b.numeroOrdre) return 1;
                return 0;
              });
            }, 100);
          }
        },
        error: (err) => {
          this.processedOrders++;
          if (this.processedOrders === this.countOrders) {
            this.running.loading = false;
            this.datagrid.instance.endCustomLoading();
          }
          this.toast("error-updating-values", "error", 7000);
          console.log(err);
        },
      });
  }

  endOfProcess(result?: boolean) {
    this.progressSet(100);
    this.toast(result ? "data-loading-ended" : "aucune-donnee-recuperee", result ? "success" : "warning");
    this.datagrid.instance.endCustomLoading();
    // In some cases, it can last (?)
    this.clearSpinner = setTimeout(() => this.datagrid.instance.endCustomLoading(), 1500);
    this.running.loading = false;
  }

  toast(message, type?, displayTime?) {
    notify({
      message: this.localization.localize(message),
      type: type ?? "success",
      displayTime: displayTime ?? 3000
    },
      { position: 'bottom center', direction: 'up-stack' }
    );
  }

  filterClients(onlyValids) {
    this.clients = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "valide",
    ]);
    const filter: any = [["societe.id", "=", this.currentCompanyService.getCompany().id]];

    if (this.formGroup.get("secteurCode")?.value)
      filter.push("and", ["secteur.id", "=", this.formGroup.get("secteurCode")?.value?.id])
    if (onlyValids) filter.push("and", ["valide", "=", true]);
    this.clients.filter(filter);
  }

  clearCltEnt() {
    this.formGroup.get("clientCode").reset();
    this.formGroup.get("entrepotCode").reset();
  }

  onValideChanged(e) {
    this.clearCltEnt();
    this.filterClients(e.value);
  }

  onSecteurChanged(e) {
    this.filterClients(this.formGroup.get("valide").value);
    if (e.event) this.clearCltEnt();
  }

  onClientChanged(e) {
    this.entrepots = this.entrepotsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
      "valide"
    ]);

    const filter: any = [["client.id", "=", e.value?.id]];
    filter.push("and", ["client.societe.id", "=", this.company]);
    if (this.formGroup.get("valide").value) filter.push("and", ["valide", "=", true]);
    this.entrepots.filter(filter);

    this.entrepots.load().then((res) => {
      if (res?.length === 1)
        this.formGroup.get("entrepotCode").patchValue({ id: res[0].id });
    });
    // We check that this change is coming from the user
    if (!e.event) return;
    this.formGroup.get("entrepotCode").reset();
  }

  onGridContentReady(e) {
    this.clotureEnabled = this.datagrid.instance.getVisibleRows()
      .some(row => ModeLivraison[row.data.ordre.entrepot.modeLivraison] === ModeLivraison.SORTIE_STOCK);
  }

  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.formGroup.get("dateMin").value);
    const fin = new Date(this.formGroup.get("dateMax").value);
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains("dateStart")) {
        this.formGroup
          .get("dateMax")
          .patchValue(this.dateManagementService.endOfDay(deb));
      } else {
        this.formGroup
          .get("dateMin")
          .patchValue(this.dateManagementService.startOfDay(fin));
      }
    }
    this.periodeSB.value = null;
  }

  setDates(e) {
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;

    const datePeriod = this.dateManagementService.getDates(e);

    this.formGroup.patchValue({
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin,
    });
  }

  onCellClick(e) {
    if (e.rowType !== "data") return;
    if (e.column.dataField === "numeroOrdre") {
      e.event.stopImmediatePropagation();
      this.tabContext.openOrdre(e.data.numeroOrdre, e.data.campagneID);
    }
    if (e.column.dataField === "clientReference") {
      let regexCtrlCheck;
      let lengthMess = "";
      // Find length requirements 8; = 8 only / 6-70 : from 6 to 70 car
      // Entrepot first otherwise client
      const ctrl =
        e.data.ordre.entrepot.controlReferenceClient ??
        e.data.ordre.client.controlReferenceClient;
      if (ctrl) {
        let regexCtrl;

        if (ctrl.includes(";")) {
          const values = ctrl.split(";").filter((v) => v);

          lengthMess = `(${values.map((v) => `${v}`).join(" ou ")} chiffres)`;
          regexCtrl = values.map((v) => `\\d{${v}}`).join("|");
        } else if (ctrl.includes("-")) {
          const ctrlValues = ctrl.split("-");
          const minNumberLength = ctrlValues[0];
          const maxNumberLength = ctrlValues[1];

          lengthMess = `(${minNumberLength} à ${maxNumberLength} chiffres)`;
          regexCtrl = `\\d{${minNumberLength},${maxNumberLength}}`;
        }

        if (regexCtrl) {
          regexCtrlCheck = new RegExp(`^\\D*?(${regexCtrl})(?:\\D|$)`);
        }
      }
      // Show text change popup
      this.promptPopupTitle = this.localization.localize("referenceClient");
      this.promptPopup.show({
        commentTitle:
          this.localization.localize("ordreBAF-change-refClt") +
          " " +
          lengthMess +
          " :",
        comment: e.value ?? "",
        commentMaxLength: 70,
        commentRegex: regexCtrlCheck,
      });
      // Store current order id/ cell elem
      this.currOrder = { id: e.data.ordreRef };
      this.currCell = e;
    }
  }

  onValidatePromptPopup(ref: string) {
    const ordre = { ...this.currOrder, referenceClient: ref };
    this.currCell.cellElement.innerHTML = ref; // Quick visual change

    // Saving comment and refresh grid
    this.datagrid.instance.beginCustomLoading("");
    this.ordresService.save({ ordre }).subscribe({
      next: () => {
        const ds = this.datagrid.dataSource as DataSource;
        const store = ds.store() as CustomStore;
        store.push([
          { key: ordre.id, type: "update", data: { clientReference: ref } },
        ]);
        this.toast("ordreBAF-save-refClient");
        this.ordresBafService
          .fControlBaf(ordre.id, this.company)
          .subscribe({
            next: (res: any) => {
              store.push([
                {
                  key: ordre.id,
                  type: "update",
                  data: {
                    indicateurBaf: res.data.fControlBaf.data.ind_baf,
                    description: res.data.fControlBaf.data.desc_ctl,
                  },
                },
              ]);
              this.datagrid.instance.repaintRows([this.currCell.row.rowIndex]);
              this.datagrid.instance.endCustomLoading();
            },
            error: (err) => {
              this.toast("error-updating-values", "error");
              console.log(err);
              this.datagrid.instance.endCustomLoading();
            },
          });
      },
      error: (err) => {
        this.toast("ordreBAF-save-error-refClient", "error");
        console.log(err);
        this.datagrid.instance.repaintRows([this.currCell.row.rowIndex]);
        this.datagrid.instance.endCustomLoading();
      },
    });
  }

  launch(e) {
    this.launchEnabled = false;
    const ordreRefs = this.datagrid.instance
      .getSelectedRowsData()
      .map((row: Partial<OrdreBaf>) => row.ordreRef);
    this.toast("invoice-running", "info", 5000);
    this.datagrid.instance.beginCustomLoading("");
    this.ordresBafService
      .fBonAFacturer(
        ordreRefs,
        this.company,
        true
      ) // true for silent mode without warnings
      .subscribe({
        complete: () => {
          this.datagrid.instance.endCustomLoading();
          this.toast("invoice-finished");
          this.enableFilters();
        }
      });
  }

  onCellPrepared(e) {
    const field = e.column.dataField;

    if (e.rowType === "data") {
      // Best expression for order status display
      if (field === "ordre.statut") {
        if (Statut[e.value]) e.cellElement.innerText = this.localization.localize(StatutLocale[e.value])?.ucFirst();
      }

      // Adjust clientReference display/hint
      if (e.column.dataField === "clientReference") {
        e.cellElement.classList.add("refClient-BAF");
        e.cellElement.setAttribute(
          "title",
          (e.value ? e.value + "\r\n\r\n" : "") +
          this.localization.localize(`hint-click-${e.value ? "change" : "create"}-refClt`)
        );
      }

      // Adjust numero ordre cell info/style
      if (field === "numeroOrdre") {
        e.cellElement.classList.add("text-underlined");
        e.cellElement.setAttribute(
          "title",
          this.localization.localize("hint-click-ordre")
        );
      }
    }

    if (field?.includes("indicateur")) {
      e.cellElement.style.textAlign = "center";
      if (e.rowType === "filter") {
        e.cellElement.style.opacity = 0;
        e.cellElement.style.pointeres = "none";
      }

      if (e.rowType === "data") {
        if (e.value === "0") {
          if (field !== "indicateurBaf") {
            e.cellElement.innerText = "";
          } else {
            // OK rows get selected
            let selected = [];
            e.component
              .getSelectedRowKeys()
              .map((sel) => selected.push(e.component.getRowIndexByKey(sel)));
            selected?.length
              ? selected.push(e.rowIndex)
              : (selected = [e.rowIndex]);
            e.component.selectRowsByIndexes(selected);
          }
        }
        e.cellElement.classList.add("BAFstatus-cell");
        e.cellElement.classList.add(this.colorizeCell(e.value));
        e.cellElement.innerText =
          Object.keys(status)[
          (Object.values(status) as string[]).indexOf(e.value)
          ] ?? "----";
        if (e.data.description) {
          e.cellElement.setAttribute(
            "title",
            e.data.description
              .replaceAll("%%%", this.localization.localize("blocking"))
              .replaceAll("~r~n", "\r\n")
          );
        }
      }
    }
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      // Hiding checkboxes when status is BLOCKED
      if (e.data.indicateurBaf === undefined || e.data.indicateurBaf === null || e.data.indicateurBaf === status.BLOQUÉ) {
        e.rowElement.classList.add("hide-select-checkbox");
      }
    }
  }

  onSelectionChanged(e) {
    // Disallowing selection of hidden checkboxes (Select All button) when status is BLOCKED
    e.component.getVisibleRows()
      .filter(row => row.data.indicateurBaf === status.BLOQUÉ)
      .map((row) => e.component.deselectRows([row.key]));
    this.gridItemsSelected = !!e.component.getSelectedRowsData()?.length;
  }

  colorizeCell(theValue) {
    let cellClassColor;
    switch (theValue) {
      case status.BLOQUÉ:
        cellClassColor = "blocked";
        break;
      case status.ALERTE:
        cellClassColor = "alert";
        break;
      case status.OK:
        cellClassColor = "OK";
        break;
    }
    return (cellClassColor ? cellClassColor : "unknown") + "-color";
  }

  clotureSP(event: ClickEvent) {
    from(this.datagrid.instance.getVisibleRows())
      .pipe(
        filter(row => ModeLivraison[row.data.ordre.entrepot.modeLivraison] === ModeLivraison.SORTIE_STOCK
          && row.data.ordre.logistiques.some(logistique => !logistique.expedieStation)),
        map(row => row.data.ordreRef),
        toArray(),
        concatMap(ordres => this.functionsService.clotureSP(ordres)),
      ).subscribe({
        complete: () => this.datagrid.instance.refresh(),
      });
  }
}

export default SupervisionAFacturerComponent;
