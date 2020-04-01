import { Injectable } from '@angular/core';

export class Employee {
    ID: number;
    Nom: string;
    Prenom: string;
    Moyen: string;
    Flux: string;
    Compl: string;
    Coord: string;
    OK: boolean;
}

export class Moyen {
    ID: number;
    description: string;
}
export class Flux {
    ID: number;
    description: string;
}


const employees: Employee[] = [{
    ID: 1,
    Nom: 'Dupond',
    Prenom: 'Jean',
    Moyen: '1',
    Flux: '2',
    Compl: 'P',
    Coord: 'import@aartsenfruit.nl',
    OK: true
}, {
    ID: 2,
    Nom: 'Durand',
    Prenom: 'Robert',
    Moyen: '2',
    Flux: '1',
    Compl: '',
    Coord: 'import@aartsenfruit.nl',
    OK: true
}, {
    ID: 3,
    Nom: 'Delapomme',
    Prenom: 'Maurice',
    Moyen: '1',
    Flux: '2',
    Compl: 'P',
    Coord: 'import@aartsenfruit.nl',
    OK: true
}];

const moyens: Moyen[] = [{
    ID: 1,
    description: 'FAX'
}, {
    ID: 2,
    description: 'MAIL'
}];

const flux: Flux[] = [{
    ID: 1,
    description: 'DETAIL'
}, {
    ID: 2,
    description: 'ORDRE'
}];

@Injectable()
export class Service {
    getEmployees() {
        return employees;
    }
    getMoyens() {
        return moyens;
    }
    getFlux() {
        return flux;
    }
}

