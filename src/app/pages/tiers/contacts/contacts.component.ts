import { Component, OnInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { ContactsService } from 'app/shared/services/contacts.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {

  contacts: DataSource;

  constructor(
    private contactsService: ContactsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams
    .subscribe(({ search }) => {
      this.contacts = this.contactsService.getDataSource({
        search: decodeURIComponent(search),
      });
    });
  }

}
