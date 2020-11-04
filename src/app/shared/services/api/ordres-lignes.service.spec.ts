import { TestBed } from '@angular/core/testing';

import { OrdresLignesService } from './ordres-lignes.service';

describe('OrdresLignesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrdresLignesService = TestBed.get(OrdresLignesService);
    expect(service).toBeTruthy();
  });
});
