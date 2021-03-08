import { TestBed } from '@angular/core/testing';

import { OrdresIndicatorsService } from './ordres-indicators.service';

describe('OrdresFakeService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      OrdresIndicatorsService,
    ],
  }));

  it('should be created', () => {
    const service: OrdresIndicatorsService = TestBed.inject(OrdresIndicatorsService);
    expect(service).toBeTruthy();
  });
});
