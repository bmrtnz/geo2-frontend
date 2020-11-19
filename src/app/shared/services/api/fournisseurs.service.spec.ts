import { TestBed } from '@angular/core/testing';

import { FournisseursService } from './fournisseurs.service';

describe('FournisseursService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FournisseursService = TestBed.get(FournisseursService);
    expect(service).toBeTruthy();
  });
});
