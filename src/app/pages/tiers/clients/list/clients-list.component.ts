import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import { ClientsService } from '../../../../shared/services';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import {Client} from '../../../../shared/models';
import {DxDataGridComponent} from 'devextreme-angular';
import { ModelFieldOptions } from 'app/shared/models/model';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit {

  clients: DataSource;
  selectedRowKeys = [];
  initialValue: any;
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid;
  @Output() rowDblClick = new EventEmitter<Client>();
  detailedFields: ({ name: string } & ModelFieldOptions)[];

  constructor(
    public clientsService: ClientsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.clients = this.clientsService.getDataSource();
    this.detailedFields = this.clientsService.model.getDetailedFields();
  }

  async onSelectionChange(e) {
    this.rowDblClick.emit(e.data);

    // For focusedChange event
    // this.rowDblClick.emit(await this.dataGrid.instance.byKey(this.dataGrid.instance.getKeyByRowIndex(e.rowIndex)));
  }

  onContentReady() {
    console.log('ready', this.initialValue);
    if (this.initialValue) {
      // console.log(this.initialValue);
      // console.log(this.dataGrid.instance.getRowIndexByKey(this.initialValue));

      // Works only on first page (Maybe interact with grid.initilize for set default search value on id column)
      this.dataGrid.instance.selectRows([this.initialValue]);
      this.dataGrid.focusedRowKey = this.initialValue;

      delete this.initialValue;
    }
  }

  setInitialKey(key) {
    this.initialValue = key;
  }

  public hasNext() {
    if (!this.dataGrid) {
      return false;
    }

    if (
      this.dataGrid.focusedRowIndex + 1 >= this.dataGrid.instance.totalCount()
      &&
      this.dataGrid.instance.pageIndex() + 1 >= this.dataGrid.instance.pageCount()
    ) {
      return false;
    }

    return true;
  }

  public async selectNext() {
    let nextIndex = this.dataGrid.focusedRowIndex + 1;

    if (nextIndex >= this.dataGrid.instance.pageSize()) {
      await this.dataGrid.instance.pageIndex(this.dataGrid.instance.pageIndex() + 1);
      nextIndex = 0;
    }

    this.dataGrid.focusedRowIndex = nextIndex;
    this.dataGrid.instance.selectRowsByIndexes([nextIndex]);

    this.rowDblClick.emit(this.dataGrid.instance.getSelectedRowsData()[0]);
  }

  public hasPrevious() {
    if (!this.dataGrid) {
      return false;
    }

    return !(
      this.dataGrid.focusedRowIndex === 0
      &&
      this.dataGrid.instance.pageIndex() === 0
    );
  }

  public async selectPrevious() {
    let previousIndex = this.dataGrid.focusedRowIndex - 1;

    if (previousIndex < 0) {
      await this.dataGrid.instance.pageIndex(this.dataGrid.instance.pageIndex() - 1);
      previousIndex = this.dataGrid.instance.pageSize() - 1;
    }

    this.dataGrid.focusedRowIndex = previousIndex;
    this.dataGrid.instance.selectRowsByIndexes([previousIndex]);

    this.rowDblClick.emit(this.dataGrid.instance.getSelectedRowsData()[0]);
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }

}
