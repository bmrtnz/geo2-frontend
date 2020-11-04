import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
import { ClientsService } from 'app/shared/services/api/clients.service';
import { Log, LogService, CommService, Comm } from 'app/shared/services/log.service';
import { Content, FakeOrdresService } from 'app/shared/services/ordres-fake.service';
import { DxAccordionComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import dxAccordion from 'devextreme/ui/accordion';

@Component({
  selector: 'app-ordres-details',
  templateUrl: './ordres-details.component.html',
  styleUrls: ['./ordres-details.component.scss'],
  providers: [LogService, CommService, FakeOrdresService]
})

export class OrdresDetailsComponent implements OnInit {

  allContents: Content[];
  contents: Content[];
  selectedIndex: number;
  clients: DataSource;

  logs: Log[];
  commentaires: Comm[];

  formGroup = this.fb.group({
    id: [''],
    raisonSocial: [''],
    pays: [''],
    adresse1: [''],
    adresse2: [''],
    adresse3: [''],
    ville: [''],
    codePostal: [''],
    lieuFonctionEan: [''],
    langue: [''],
    tvaCee: [''],
    nbJourEcheance: [''],
    echeanceLe: [''],
    regimeTva: [''],
    devise: [''],
    moyenPaiement: [''],
    basePaiement: [''],
    contacts: [''],
    valide: [false],
    preSaisie: [''],
    venteCommission: [''],
    instructLogistique: [''],
    bonAFacturer: [''],
    facture: [''],
    EDI: ['']
  });

  @ViewChild(FileManagerComponent, { static: false }) fileManagerComponent: FileManagerComponent;
  @ViewChildren(DxAccordionComponent) accordion: any;

  isReadOnlyMode = true;
  orderNumber = '000034';

  constructor(
    logService: LogService,
    fakeOrdresService: FakeOrdresService,
    public clientsService: ClientsService,
    commService: CommService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.logs =  logService.getLog();
    this.commentaires = commService.getComm();
    this.allContents = fakeOrdresService.getContents();
    this.contents = fakeOrdresService.getContents().slice(0, 1);
  }

  ngOnInit() {
    this.clients = this.clientsService.getDataSource();
  }

  onSubmit() {
  }

  get readOnlyMode() {
    return this.isReadOnlyMode;
  }
  set readOnlyMode(value: boolean) {
    this.isReadOnlyMode = value;
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  scrollToOnClick(e) {

    const key = e.element.dataset.accordion;
    const extractField = '.' + key + '-field';
    const Element = document.querySelector(extractField) as HTMLElement;
    const Accordion = this.accordion.toArray().find(v => v.element.nativeElement.dataset.name === key);

    // Some elements are not accordion type
    if (Accordion) {
      Accordion.instance.expandItem(0);
    }
    Element.scrollIntoView({behavior: 'smooth'});

  }

  onTabDragStart(e) {
    e.itemData = e.fromData[e.fromIndex];
  }

  onTabDrop(e) {
    e.fromData.splice(e.fromIndex, 1);
    e.toData.splice(e.toIndex, 0, e.itemData);
  }

  addButtonHandler() {

    // Création ordre avec numéro bidon pour tests
    const newItem = {
      id: this.contents.length + 1,
      tabTitle: 'Ordre N° ' + Math.round(Math.random() * 999999)
    };

    this.selectedIndex = this.contents.length;
    this.contents.push(newItem);
  }

  closeButtonHandler(itemData) {
    const index = this.contents.indexOf(itemData);

    this.contents.splice(index, 1);
    if (index >= this.contents.length) this.selectedIndex = index - 1;
  }

  disableButton() {
    // return this.contents.length === this.allContents.length;
  }

}
