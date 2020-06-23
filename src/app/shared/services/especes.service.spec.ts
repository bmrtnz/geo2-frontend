import { TestBed } from '@angular/core/testing';

import { EspecesService } from './especes.service';

describe('EspecesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EspecesService = TestBed.get(EspecesService);
    expect(service).toBeTruthy();
  });
});
