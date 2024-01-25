import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import {
  DxPopupComponent,
  DxDateBoxComponent,
  DxTextBoxComponent,
  DxSwitchComponent,
  DxScrollViewComponent,
} from "devextreme-angular";
import { alert, confirm } from "devextreme/ui/dialog";
import { AuthService, LocalizationService } from "app/shared/services";
import Ordre from "app/shared/models/ordre.model";
import { GridPackingListComponent } from "./grid-packing-list/grid-packing-list.component";
import { PacklistsService } from "app/shared/services/api/packlists.service";
import notify from "devextreme/ui/notify";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { lastValueFrom } from "rxjs";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import hideToasts from "devextreme/ui/toast/hide_toasts";
import { DateManagementService } from "app/shared/services/date-management.service";

@Component({
  selector: "app-packing-list-popup",
  templateUrl: "./packing-list-popup.component.html",
  styleUrls: ["./packing-list-popup.component.scss"],
})
export class PackingListPopupComponent implements OnChanges {
  constructor(
    private localizeService: LocalizationService,
    private authService: AuthService,
    private packlistsService: PacklistsService,
    private dateManagementService: DateManagementService,
    public formsUtils: FormUtilsService,
    private ordresService: OrdresService
  ) { }

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(GridPackingListComponent, { static: false })
  gridComponent: GridPackingListComponent;

  @ViewChild("entrepot", { static: false }) entrepotInput: DxTextBoxComponent;
  @ViewChild("dateDep", { static: false }) dateDepInput: DxDateBoxComponent;
  @ViewChild("dateArr", { static: false }) dateArrInput: DxDateBoxComponent;
  @ViewChild("dateImp", { static: false }) dateImpInput: DxDateBoxComponent;
  @ViewChild("PO", { static: false }) POInput: DxTextBoxComponent;
  @ViewChild("switchCltEnt", { static: false }) switchCltEnt: DxSwitchComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  @Input() ordre: Ordre;

  @Output() whenValidate = new EventEmitter<any>();
  @Output() ordreId: string;
  @Output() address: string;
  @Output() order: Ordre;
  @Output() ordres: any[];
  @Output() numeroPo: string;
  @Output() totaux: { colis: number, gross: number, net: number };
  @Output() printDate;



  public title: string;
  public paloxLabel: string;
  public dateLabel: string;
  public visible: boolean;
  public popupFullscreen = false;
  public labelEntrepot: string;
  public selectOk: boolean;
  public shown: boolean;
  public infoPopupText: string;
  public printDocumentTitle;
  public running = {
    preview: false,
    print: false,
    sendPrinter: false
  }


  ngOnChanges() {
    if (this.ordre) {
      this.title = this.localizeService.localize("packing-list-popup-title");
      this.ordreId = this.ordre.id;
      this.printDocumentTitle = `Packing-list-${this.ordre?.numero}`;
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("packing-list-popup", "document-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.entrepotInput.value = `${this.ordre.entrepot.code} - ${this.ordre.entrepot.raisonSocial}`;
    this.dateDepInput.value = this.ordre.etdDate ?? new Date();
    this.dateArrInput.value = this.ordre.etaDate ?? new Date();
    this.dateImpInput.value = new Date();
    this.switchCltEnt.value = true;
    this.POInput.value = " ";
    this.POInput.value = null;
    this.gridComponent.enableFilters();
    this.shown = true;

    // ETD/ETA Missing alert
    if (!this.ordre.etaDate || !this.ordre.etdDate)
      notify(
        this.localizeService.localize(
          "text-popup-etdeta-current-order-missing"
        ),
        "warning",
        5000
      );

  }

  onHidden() {
    this.visible = false;
    this.shown = false;
    this.entrepotInput.instance.reset();
    this.dateDepInput.instance.reset();
    this.dateArrInput.instance.reset();
    this.POInput.instance.reset();
    this.switchCltEnt.instance.reset();
    this.gridComponent.datagrid.dataSource = null;
    this.gridComponent.datagrid.instance.clearSelection();
    this.running.preview = false;
    this.running.print = false;
  }

  hidePopup() {
    this.popup.visible = false;
  }

  selectedOrderIds(e) {
    this.running.preview = false;
    this.running.print = false;
    this.ordres = e;
    this.selectOk = !!e?.length;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  validateFields() {
    if (
      this.dateDepInput.value &&
      this.dateArrInput.value
    )
      return true;
  }

  async onPreview() {

    notify({
      message: this.localizeService.localize("prepare-preview"),
      displayTime: 60000
    },
      { position: 'bottom center', direction: 'up-stack' }
    );

    this.printDate = this.dateManagementService.formatDate(this.dateImpInput.value, "dd/MM/yyyy");

    const result = await lastValueFrom(
      this.ordresService.getOne_v2(this.ordre?.id, [
        "entrepot.raisonSocial",
        "entrepot.adresse1",
        "entrepot.adresse2",
        "entrepot.adresse3",
        "entrepot.codePostal",
        "entrepot.ville",
        "entrepot.pays.description",
        "portTypeD.name",
        "portTypeA.name",
      ])
    );

    this.order = { ...this.ordre, ...result.data.ordre };
    const address = [
      this.order.entrepot.raisonSocial,
      this.order.entrepot.adresse1,
      this.order.entrepot.adresse2,
      this.order.entrepot.adresse3,
      this.order.entrepot.codePostal + " " + this.order.entrepot.ville,
      this.order.entrepot.pays.description,
    ]
    this.address = address.join("\n");
    this.numeroPo = this.POInput.value;

    this.ordres.map(async (ord, idx) => {
      // [{ id: '1670066', numero: '659768' }, { id: '1672202', numero: '661229' }].map(async (ord, idx) => {
      const result = await lastValueFrom(
        this.ordresService.getOne_v2(ord.id, [
          "logistiques.numeroContainer",
          "logistiques.numeroPlomb",
          "logistiques.detecteurTemperature",
          "lignes.article.articleDescription.descriptionLongue",
          "lignes.article.normalisation.calibreMarquage.description",
          "lignes.nombreColisExpedies",
          "lignes.poidsBrutExpedie",
          "lignes.poidsNetExpedie",
        ])
      );
      this.ordres[idx] = { ...ord, ...result.data.ordre };

      this.totaux = {
        colis: 0,
        gross: 0,
        net: 0
      }
      this.ordres.map(ord => {
        ord.sumColis = 0;
        ord.sumGross = 0;
        ord.sumNet = 0;
        ord.lignes?.map(ligne => {
          ord.sumColis += ligne.nombreColisExpedies ?? 0;
          ord.sumGross += ligne.poidsBrutExpedie ?? 0;
          ord.sumNet += ligne.poidsNetExpedie ?? 0;
        })
        this.totaux.colis += ord.sumColis;
        this.totaux.gross += ord.sumGross;
        this.totaux.net += ord.sumNet;
      })

      if (idx === this.ordres.length - 1) this.preview();

    });
  }

  preview() {
    this.running.preview = true;
    hideToasts();
    setTimeout(() => {
      const Element = document.querySelector(".preview-anchor") as HTMLElement;
      Element?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  }

  async onPrint() {
    if (!this.validateFields()) return;
    this.running.print = true;
    // Save all orders into myOrders
    // Checks client.raisonSocial difference and etd/eta not null
    const myOrders = [];
    let etaEtdDatesMissing = false;
    let raisonSocialCltDiff = false;
    const raisonSocialClt = this.ordre.client.raisonSocial;
    this.ordres.map((ord) => {
      myOrders.push({ ordre: { id: ord.id } });
      if (!ord.etaDate || !ord.etdDate) etaEtdDatesMissing = true;
      if (ord.client.raisonSocial !== raisonSocialClt)
        raisonSocialCltDiff = true;
    });

    // ETD/ETA Missing alert
    if (etaEtdDatesMissing)
      await alert(
        this.localizeService.localize(
          "text-popup-etdeta-selected-orders-missing"
        ),
        this.localizeService.localize("packing-list-popup-title")
      );

    // One or several orders have a different client raison sociale
    if (raisonSocialCltDiff) {
      if (
        await confirm(
          this.localizeService.localize("text-popup-raisonSocial-client-diff"),
          this.localizeService.localize("packing-list-popup-title")
        )
      ) {
        this.saveData(myOrders);
      } else {
        this.running.print = false;
        return;
      }
    }
    this.saveData(myOrders);
  }

  saveData(myOrders) {
    this.packlistsService
      .save(
        {
          depart: new Date(this.dateDepInput.value).toISOString(),
          livraison: new Date(this.dateArrInput.value).toISOString(),
          impression: new Date(this.dateImpInput.value).toISOString(),
          numeroPo: this.POInput.value || "-",
          typeTier: { id: this.switchCltEnt.value ? "E" : "C" },
          mail: this.authService.currentUser.email ?? "",
          ordres: myOrders,
        },
        new Set(["id"])
      )
      .subscribe({
        next: () => {
          // Print and clear
          this.running.sendPrinter = true;
          this.formsUtils.onPrint(this);
          setTimeout(() => this.gridComponent.datagrid.instance.clearSelection(), 1000);
        },
        error: (error: Error) => {
          console.log(error);
          this.running.print = false;
          notify(this.messageFormat(error.message), "error", 7000);
        },
      });
  }

  private messageFormat(mess) {
    const functionNames = ["savePacklistEntete"];
    functionNames.map(
      (fn) =>
        (mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""))
    );
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }
}
