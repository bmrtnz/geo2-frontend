import { TestBed } from '@angular/core/testing';

import { PenetrosService } from './penetros.service';

describe('PenetrosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PenetrosService = TestBed.inject(PenetrosService);
    expect(service).toBeTruthy();
  });
});
