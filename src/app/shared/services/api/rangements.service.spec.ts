import { TestBed } from '@angular/core/testing';

import { RangementsService } from './rangements.service';

describe('RangementsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RangementsService = TestBed.inject(RangementsService);
    expect(service).toBeTruthy();
  });
});
