import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { ContactsService } from 'app/shared/services/contacts.service';
import { ActivatedRoute } from '@angular/router';
import { Contact } from 'app/shared/models';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { TypeTiers } from 'app/shared/models/tier.model';
import { SocietesService } from 'app/shared/services/societes.service';
import { FluxService } from 'app/shared/services/flux.service';
import { MoyenCommunicationService } from 'app/shared/services/moyens-communication.service';
import { DxDataGridComponent } from 'devextreme-angular';
import { environment} from 'environments/environment';
import { NestedPart } from 'app/pages/nested/nested.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit, NestedPart {

  contacts: DataSource;
  fluxSource: DataSource;
  societeSource: DataSource;
  moyenCommunicationSource: DataSource;
  codeTiers: string;
  typeTiers: string;
  typeTiersLabel: string;
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  columnChooser = environment.columnChooser;
  @ViewChild(DxDataGridComponent, {static: true}) dataGrid: DxDataGridComponent;
  contentReadyEvent = new EventEmitter<any>();

  constructor(
    public contactsService: ContactsService,
    public societeService: SocietesService,
    public fluxService: FluxService,
    public moyenCommunicationService: MoyenCommunicationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.detailedFields = this.contactsService.model.getDetailedFields();
    this.codeTiers = this.route.snapshot.paramMap.get('codeTiers');
    this.typeTiers = this.route.snapshot.paramMap.get('typeTiers');

    this.typeTiersLabel = Object
    .entries(TypeTiers)
    .find(([, value]) => value === this.typeTiers)
    .map( value => value.toLowerCase() )
    .shift();

    this.contacts = this.contactsService.getDataSource();
    this.contacts.filter([
      ['codeTiers', '=', this.codeTiers],
      'and',
      ['typeTiers', '=', this.typeTiers],
    ]);
    this.societeSource = this.societeService.getDataSource();
    this.fluxSource = this.fluxService.getDataSource();
    this.moyenCommunicationSource = this.moyenCommunicationService.getDataSource();
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }

  onRowInserting(event) {
    (event.data as Contact).codeTiers = this.codeTiers;
    (event.data as Contact).typeTiers = this.typeTiers;
  }

  onRowClick({rowIndex}) {
    this.dataGrid.instance.editRow(rowIndex);
  }

  onValueChanged(event, cell) {
    const key = this[cell.column.dataField + 'Service'].keyField;
    if (cell.setValue)
      cell.setValue({[key]: event.value[key]});
  }

  loadDataGridState() {
    const data = window.localStorage.getItem('contactStorage');
    if (data !== null) {

      // Suppression filtres/recherche
      const state = JSON.parse(data);
      for (const myColumn of state.columns) {
        if (myColumn.dataField !== 'valide')
          myColumn.filterValue = null;
      }
      state.searchText = '';

      return state;
    } else {
      return null;
    }

  }

  async saveDataGridState(data) {
    window.localStorage.setItem('contactStorage', JSON.stringify(data));
  }

}
