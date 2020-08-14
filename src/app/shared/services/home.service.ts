import { Injectable } from '@angular/core';

export class NavHomeList {
    id: number;
    text: string;
    path: string;
}

const navigation: NavHomeList[] = [
    { id: 1, text: 'Clients', path: 'tiers/clients' },
    { id: 2, text: 'Fournisseurs', path: 'tiers/fournisseurs' },
    { id: 3, text: 'Transporteurs', path: 'tiers/transporteurs' },
    { id: 4, text: 'Passage à quai', path: 'tiers/lieux-passage-a-quai' }
];

@Injectable()
export class NavHomeService {
    getNavigationList(): NavHomeList[] {
        return navigation;
    }
}
