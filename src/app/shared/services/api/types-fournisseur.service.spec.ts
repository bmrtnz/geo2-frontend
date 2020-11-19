import { TestBed } from '@angular/core/testing';

import { TypesFournisseurService } from './types-fournisseur.service';

describe('TypesFournisseurService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TypesFournisseurService = TestBed.get(TypesFournisseurService);
    expect(service).toBeTruthy();
  });
});
