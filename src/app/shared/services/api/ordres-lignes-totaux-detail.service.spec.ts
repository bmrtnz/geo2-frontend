import { TestBed } from '@angular/core/testing';

import { OrdresLignesTotauxDetailService } from './ordres-lignes-totaux-detail.service';

describe('OrdresLignesTotauxDetailService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrdresLignesTotauxDetailService = TestBed.get(OrdresLignesTotauxDetailService);
    expect(service).toBeTruthy();
  });
});
