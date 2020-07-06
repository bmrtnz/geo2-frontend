import { TestBed } from '@angular/core/testing';

import { GroupesFournisseurService } from './groupes-fournisseur.service';

describe('GroupesFournisseurService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GroupesFournisseurService = TestBed.get(GroupesFournisseurService);
    expect(service).toBeTruthy();
  });
});
