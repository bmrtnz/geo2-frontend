import { TestBed } from '@angular/core/testing';

import { MoyensPaiementService } from './moyens-paiement.service';

describe('MoyensPaiementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MoyensPaiementService = TestBed.inject(MoyensPaiementService);
    expect(service).toBeTruthy();
  });
});
