import { TestBed } from '@angular/core/testing';

import { OrdreLignesTotauxDetailService } from './ordres-lignes-totaux-detail.service';

describe('OrdresLignesTotauxDetailService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrdreLignesTotauxDetailService = TestBed.get(OrdreLignesTotauxDetailService);
    expect(service).toBeTruthy();
  });
});
