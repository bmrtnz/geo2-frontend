import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
import Ordre from 'app/shared/models/ordre.model';
import { ClientsService } from 'app/shared/services/api/clients.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { Comm, CommService, Log, LogService } from 'app/shared/services/log.service';
import { Content, FakeOrdresService, INDEX_TAB } from 'app/shared/services/ordres-fake.service';
import { DxAccordionComponent, DxTabPanelComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { from } from 'rxjs';
import { mergeAll } from 'rxjs/operators';

@Component({
  selector: 'app-ordres-details',
  templateUrl: './ordres-details.component.html',
  styleUrls: ['./ordres-details.component.scss'],
  providers: [LogService, CommService, FakeOrdresService]
})

export class OrdresDetailsComponent implements OnInit {

  isIndexTab = true;
  allContents: Content[];
  contents: Content[];
  clients: DataSource;
  personnes: DataSource;
  logs: Log[];
  commentaires: Comm[];

  formGroup = this.fb.group({
    id: [''],
    client: [''],
    referenceClient: [''],
    commercial: [''],
    assistante: [''],
    instructionsLogistiques: [''],
    dateDepartPrevue: [''],
    dateLivraisonPrevue: [''],
    venteACommission: [''],
    bonAFacturer: [''],
    facture: [''],
    factureEDI: [''],
  });

  @ViewChild(FileManagerComponent, { static: false }) fileManagerComponent: FileManagerComponent;
  @ViewChildren(DxAccordionComponent) accordion: any;
  @ViewChild('tabs', { static: false }) tabPanelComponent: DxTabPanelComponent;

  constructor(
    logService: LogService,
    fakeOrdresService: FakeOrdresService,
    private ordresService: OrdresService,
    public clientsService: ClientsService,
    public personnesService: PersonnesService,
    commService: CommService,
    private fb: FormBuilder,
  ) {
    this.logs = logService.getLog();
    this.commentaires = commService.getComm();
    this.allContents = fakeOrdresService.getContents();
    this.contents = fakeOrdresService.getContents().slice(0, 1);
  }

  ngOnInit() {
    this.clients = this.clientsService.getDataSource();
    this.personnes = this.personnesService.getDataSource();
  }

  onSubmit() {
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
    Element.scrollIntoView({ behavior: 'smooth' });

  }

  onTabDragStart(e) {
    e.itemData = e.fromData[e.fromIndex];
  }

  onTabDrop(e) {
    e.fromData.splice(e.fromIndex, 1);
    e.toData.splice(e.toIndex, 0, e.itemData);
  }

  addButtonHandler(ordre: Ordre) {
    this.contents.push({
      id: ordre ? ordre.id : null,
      tabTitle: ordre ? `Ordre N° ${ordre.numero}` : 'Nouvel ordre',
    });
  }

  closeButtonHandler(itemData) {
    const index = this.contents.indexOf(itemData);

    this.contents.splice(index, 1);
    if (index >= this.contents.length)
      this.tabPanelComponent.selectedIndex = index - 1;
  }

  disableButton() {
    // return this.contents.length === this.allContents.length;
  }

  onSelectionChange({ addedItems }: { addedItems: Content[] }) {
    if (!addedItems.length) return;
    const { id, ordre } = addedItems[0];
    setTimeout(() => this.isIndexTab = id === INDEX_TAB);
    if (ordre) this.formGroup.patchValue(ordre);
  }

  onTitleRendered({ itemData, itemIndex }: {
    itemData: Content,
    itemIndex: number,
  }) {
    if (itemData.id === INDEX_TAB) return;
    if (!itemData.id)
      this.contents[itemIndex].ordre = {};
    else
      from(this.ordresService.getOne(itemData.id))
        .pipe(mergeAll())
        .subscribe(res => {
          this.contents[itemIndex].ordre = res.data.ordre;
          this.tabPanelComponent.selectedIndex = itemIndex;
        });
  }

}
