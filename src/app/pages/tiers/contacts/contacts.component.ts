import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NestedPart } from 'app/pages/nested/nested.component';
import { Contact } from 'app/shared/models';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { TypeTiers } from 'app/shared/models/tier.model';
import { AuthService, LocalizationService } from 'app/shared/services';
import { ContactsService } from 'app/shared/services/api/contacts.service';
import { FluxService } from 'app/shared/services/api/flux.service';
import { MoyenCommunicationService } from 'app/shared/services/api/moyens-communication.service';
import { SocietesService } from 'app/shared/services/api/societes.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  contentReadyEvent = new EventEmitter<any>();

  constructor(
    public contactsService: ContactsService,
    public societeService: SocietesService,
    public fluxService: FluxService,
    public moyenCommunicationService: MoyenCommunicationService,
    private route: ActivatedRoute,
    public localizeService: LocalizationService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
  ) {}

  ngOnInit() {
    this.detailedFields = this.contactsService.model.getDetailedFields(2)
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field => 
          !!(this.localizeService.localize('tiers-contacts-' + field.path.replaceAll('.', '-'))).length);
       }),
    );
    this.codeTiers = this.route.snapshot.paramMap.get('codeTiers');
    this.typeTiers = this.route.snapshot.paramMap.get('typeTiers');

    this.typeTiersLabel = Object
      .entries(TypeTiers)
      .find(([, value]) => value === this.typeTiers)
      .map(value => value.toLowerCase())
      .shift();

    this.contacts = this.contactsService.getDataSource();
    this.enableFilters();
    this.societeSource = this.societeService.getDataSource();
    this.fluxSource = this.fluxService.getDataSource();
    this.moyenCommunicationSource = this.moyenCommunicationService.getDataSource();
  }

  enableFilters() {
    this.contacts.filter([
      ['codeTiers', '=', this.codeTiers],
      'and',
      ['typeTiers', '=', this.typeTiers],
    ]);
    this.contacts.reload();

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

  // onSaved(event) {
  //   this.contacts.reload();
  //   this.dataGrid.instance.refresh();
  // }

  onRowClick({ rowIndex }) {
    this.dataGrid.instance.editRow(rowIndex);
  }

  onValueChanged(event, cell) {
    const key = this[cell.column.dataField + 'Service'].keyField;
    if (cell.setValue)
      cell.setValue({ [key]: event.value[key] });
  }

}
