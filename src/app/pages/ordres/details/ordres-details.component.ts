import { Component, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
import Ordre from 'app/shared/models/ordre.model';
import { TransporteursService } from 'app/shared/services';
import { ClientsService } from 'app/shared/services/api/clients.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { Comm, CommService, Log, LogService } from 'app/shared/services/log.service';
import { Content, FakeOrdresService, INDEX_TAB } from 'app/shared/services/ordres-fake.service';
import { DxAccordionComponent, DxTabPanelComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';
import { from, iif, of, Subscription } from 'rxjs';
import { map, mergeAll, take } from 'rxjs/operators';

@Component({
  selector: 'app-ordres-details',
  templateUrl: './ordres-details.component.html',
  styleUrls: ['./ordres-details.component.scss'],
  providers: [LogService, CommService, FakeOrdresService]
})

export class OrdresDetailsComponent implements OnInit, OnDestroy {

  isIndexTab = true;
  allContents: Content[];
  contents: Content[];
  clients: DataSource;
  personnes: DataSource;
  transporteurs: DataSource;
  logs: Log[];
  commentaires: Comm[];

  formGroup = this.fb.group({
    id: [''],
    client: [''],
    referenceClient: [''],
    transporteur: [''],
    commercial: [''],
    assistante: [''],
    instructionsLogistiques: [''],
    dateDepartPrevue: [''],
    dateLivraisonPrevue: [''],
    venteACommission: [''],
    bonAFacturer: [''],
    facture: [''],
    factureEDI: [''],
    livre: [''],
  });
  private formValuesChange: Subscription;

  @ViewChild(FileManagerComponent, { static: false }) fileManagerComponent: FileManagerComponent;
  @ViewChildren(DxAccordionComponent) accordion: any;
  @ViewChild('tabs', { static: false }) tabPanelComponent: DxTabPanelComponent;

  constructor(
    logService: LogService,
    fakeOrdresService: FakeOrdresService,
    private ordresService: OrdresService,
    public clientsService: ClientsService,
    public personnesService: PersonnesService,
    public transporteursService: TransporteursService,
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
    this.transporteurs = this.transporteursService.getDataSource();
    this.formValuesChange = this.formGroup.valueChanges
      .subscribe(_ => {
        if (this.formGroup.pristine) return;
        const selectedIndex = this.tabPanelComponent.selectedIndex;
        const patch = this.ordresService.extractDirty(this.formGroup.controls);
        this.contents[selectedIndex].patch = patch;
      });
    // On récupère l'ordre à afficher le cas échéant (ordres-indicateurs.component.ts)
    const data = window.localStorage.getItem('orderNumber');
    if (data) {
      const order = JSON.parse(data);
      window.localStorage.removeItem('orderNumber');
      this.pushTab(order);
    }
  }

  ngOnDestroy() {
    this.formValuesChange.unsubscribe();
  }

  onSubmit() {
    if (!this.formGroup.pristine && this.formGroup.valid) {
      const ordre = this.ordresService.extractDirty(this.formGroup.controls);

      // if (this.createMode) {
      //   transporteur.id = this.formGroup.get('id').value.toUpperCase();
      //   // Ici on fait rien pour le moment l'id est deja dans l'object lieupassageaquai
      //   // Avoir pour les valeur par defaut (qui sont not null dans la base)
      //   transporteur.preSaisie = true;
      //   transporteur.valide = false;
      // } else {
      //   if (transporteur.valide === true) {
      //     transporteur.preSaisie = false;
      //     this.preSaisie = '';
      //   }
      //   transporteur.id = this.transporteur.id;
      // }

      const isNew = !ordre.id;
      ordre.societe = { id: environment.societe.id };
      from(this.ordresService.save({ ordre }))
        .pipe(mergeAll())
        .subscribe({
          next: (e) => {
            notify('Sauvegardé', 'success', 3000);
            if (isNew) {
              this.closeTab(this.tabPanelComponent.selectedIndex);
              this.pushTab(e.data.saveOrdre);
            }
      //       this.refreshGrid.emit();
      //       if (!this.createMode) {
      //         this.transporteur = {
      //           ...this.transporteur,
      //           ...this.formGroup.getRawValue(),
      //         };
      //         this.readOnlyMode = true;
      //       } else {
      //         this.editing = false;
      //         this.router.navigate([`/tiers/transporteurs/${e.data.saveTransporteur.id}`]);
      //       }
      //       this.transporteur.typeTiers = e.data.saveTransporteur.typeTiers;
      //       this.formGroup.markAsPristine();
          },
          error: () => notify('Echec de la sauvegarde', 'error', 3000),
        });
    }
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

  pushTab(ordre?: Ordre) {
    if (ordre) {
      const knownIndex = this.contents
      .findIndex(({id}) => ordre.id === id );
      if (knownIndex >= 0)
        return this.tabPanelComponent.selectedIndex = knownIndex;
    }

    this.contents.push({
      id: ordre ? ordre.id : null,
      tabTitle: ordre ? `Ordre N° ${ordre.numero}` : 'Nouvel ordre',
    });
  }

  closeTab(index) {
    this.contents.splice(index, 1);
    if (index >= this.contents.length)
      this.tabPanelComponent.selectedIndex = index - 1;
  }

  disableButton() {
    // return this.contents.length === this.allContents.length;
  }

  onSelectionChange({ addedItems }: { addedItems: Content[] }) {
    if (!addedItems.length) return;
    const { id, ordre, patch } = addedItems[0];
    setTimeout(() => this.isIndexTab = id === INDEX_TAB);
    if (ordre)
      this.formGroup.reset({ ...ordre, ...patch }, { emitEvent: false });
    if (patch)
      Object.entries(patch)
        .forEach(([key]) => this.formGroup.get(key).markAsDirty());
  }

  onTitleRendered({ itemData, itemIndex }: {
    itemData: Content,
    itemIndex: number,
  }) {
    if (itemIndex === this.tabPanelComponent.selectedIndex) return;
    if (itemData.id === INDEX_TAB) return;
    iif(
      () => !!itemData.id,
      from(this.ordresService.getOne(itemData.id)).pipe(
        mergeAll(),
        map(res => res.data.ordre),
      ),
      of({} as Ordre),
    )
      .pipe(take(1))
      .subscribe(res => {
        this.contents[itemIndex].ordre = res;
        this.tabPanelComponent.selectedIndex = itemIndex;
      });
  }

}
