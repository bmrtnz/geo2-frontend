import { Component, OnInit } from '@angular/core';
import { Service, Employee, Moyen, Flux } from '../../../shared/services/contacts.service';
import { ActivatedRoute } from '@angular/router';
import ArrayStore from 'devextreme/data/array_store';

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss'],
    providers: [Service]
})
export class ContactsComponent implements OnInit {

    dataSource: ArrayStore;
    moyens: Moyen[];
    flux: Flux[];

    tierId: string;
    type: string;

    constructor(
        private service: Service,
        private route: ActivatedRoute
        ) {
        this.dataSource = new ArrayStore({
            key: 'ID',
            data: service.getEmployees(),
            onUpdated: (values, key) => console.log(values, key)
        });
        this.moyens = service.getMoyens();
        this.flux = service.getFlux();
    }

    ngOnInit() {
        this.type = this.route.snapshot.paramMap.get('type');
        this.tierId = this.route.snapshot.paramMap.get('id');
        // this.service
        //   .get(this.route.snapshot.paramMap.get('id'))
        //   .then(c => {
        //     this.id = c;
        //     // this.clientForm.patchValue(this.client);
        //   });
    }

}

