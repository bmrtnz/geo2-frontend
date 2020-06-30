import { TestBed } from '@angular/core/testing';

import { ColorationsService } from './colorations.service';

describe('ColorationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ColorationsService = TestBed.get(ColorationsService);
    expect(service).toBeTruthy();
  });
});
