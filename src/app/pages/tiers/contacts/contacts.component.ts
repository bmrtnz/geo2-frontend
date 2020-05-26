import { Component, OnInit, ViewChild } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { ContactsService } from 'app/shared/services/contacts.service';
import { ActivatedRoute } from '@angular/router';
import { Contact } from 'app/shared/models';
import { TypeTiers } from 'app/shared/models/tier.model';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {

  contacts: DataSource;
  codeTiers: string;
  typeTiers: string;
  typeTiersLabel: string;

  constructor(
    private contactsService: ContactsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.codeTiers = this.route.snapshot.paramMap.get('codeTiers');
    this.typeTiers = this.route.snapshot.paramMap.get('typeTiers');
    this.typeTiersLabel = Object
    .entries(TypeTiers)
    .find(([, value]) => value === this.typeTiers)
    .shift();
    this.route.queryParams
    .subscribe(({ search }) => {
      this.contacts = this.contactsService.getDataSource({
        search: search ? decodeURIComponent(search) : '',
      });
    });
  }

  onRowInserting(event) {
    (event.data as Contact).codeTiers = this.codeTiers;
    (event.data as Contact).typeTiers = this.typeTiers;
  }

}
