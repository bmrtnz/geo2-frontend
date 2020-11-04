import { TestBed } from '@angular/core/testing';

import { NaturesStationService } from './natures-station.service';

describe('NaturesStationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NaturesStationService = TestBed.get(NaturesStationService);
    expect(service).toBeTruthy();
  });
});
