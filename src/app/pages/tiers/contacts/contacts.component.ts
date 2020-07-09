import { Component, OnInit, ViewChild } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { ContactsService } from 'app/shared/services/contacts.service';
import { ActivatedRoute } from '@angular/router';
import { Contact } from 'app/shared/models';
import { ModelFieldOptions } from 'app/shared/models/model';
import { TypeTiers } from 'app/shared/models/tier.model';
import { SocietesService } from 'app/shared/services/societes.service';
import { FluxService } from 'app/shared/services/flux.service';
import { MoyenCommunicationService } from 'app/shared/services/moyens-communication.service';
import { DxDataGridComponent } from 'devextreme-angular';
import { environment} from 'environments/environment';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {

  contacts: DataSource;
  fluxSource: DataSource;
  societeSource: DataSource;
  moyenCommunicationSource: DataSource;
  codeTiers: string;
  typeTiers: string;
  typeTiersLabel: string;
  detailedFields: ({ name: string } & ModelFieldOptions)[];
  columnChooser = environment.columnChooser;
  @ViewChild(DxDataGridComponent, {static: true}) dataGrid: DxDataGridComponent;

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

    this.contacts = this.contactsService.getDataSource({
      search: `codeTiers=="${ this.codeTiers }" and typeTiers=="${ this.typeTiers }"`,
    });
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

}
