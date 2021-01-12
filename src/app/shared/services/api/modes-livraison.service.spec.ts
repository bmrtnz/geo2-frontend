import { TestBed } from '@angular/core/testing';

import { ModesLivraisonService } from './modes-livraison.service';

describe('ModesLivraisonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModesLivraisonService = TestBed.inject(ModesLivraisonService);
    expect(service).toBeTruthy();
  });
});
