import { TestBed } from '@angular/core/testing';

import { GroupesFournisseurService } from './groupes-fournisseur.service';

describe('GroupesFournisseurService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GroupesFournisseurService = TestBed.inject(GroupesFournisseurService);
    expect(service).toBeTruthy();
  });
});
