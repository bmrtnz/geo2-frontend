import { TestBed } from '@angular/core/testing';

import { ConditionsVenteService } from './conditions-vente.service';

describe('ConditionsVenteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConditionsVenteService = TestBed.inject(ConditionsVenteService);
    expect(service).toBeTruthy();
  });
});
