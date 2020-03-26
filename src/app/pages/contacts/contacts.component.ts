import { Component } from '@angular/core';
import { Service, Employee, Moyen, Flux } from '../../shared/services/contacts.service';

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss'],
    providers: [Service]
})
export class ContactsComponent {
    dataSource: Employee[];
    moyens: Moyen[];
    flux: Flux[];

    constructor(service: Service) {
        this.dataSource = service.getEmployees();
        this.moyens = service.getMoyens();
        this.flux = service.getFlux();
    }

}
