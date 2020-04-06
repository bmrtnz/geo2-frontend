import { Injectable } from '@angular/core';

export class Employee {
    id: number;
    Nom: string;
    Prenom: string;
    Moyen: string;
    Flux: string;
    Compl: string;
    Coord: string;
    OK: boolean;
}

export class Moyen {
    id: number;
    description: string;
}
export class Flux {
    id: number;
    description: string;
}


const employees: Employee[] = [{
    id: 1,
    Nom: 'Dupond',
    Prenom: 'Jean',
    Moyen: '1',
    Flux: '2',
    Compl: 'P',
    Coord: 'import@aartsenfruit.nl',
    OK: true
}, {
    id: 2,
    Nom: 'Durand',
    Prenom: 'Robert',
    Moyen: '2',
    Flux: '1',
    Compl: '',
    Coord: 'import@aartsenfruit.nl',
    OK: true
}, {
    id: 3,
    Nom: 'Delapomme',
    Prenom: 'Maurice',
    Moyen: '1',
    Flux: '2',
    Compl: 'P',
    Coord: 'import@aartsenfruit.nl',
    OK: true
}];

const moyens: Moyen[] = [{
    id: 1,
    description: 'FAX'
}, {
    id: 2,
    description: 'MAIL'
}];

const flux: Flux[] = [{
    id: 1,
    description: 'DETAIL'
}, {
    id: 2,
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

