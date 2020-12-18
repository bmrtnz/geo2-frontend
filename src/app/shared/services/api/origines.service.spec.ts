import { TestBed } from '@angular/core/testing';

import { OriginesService } from './origines.service';

describe('OriginesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OriginesService = TestBed.inject(OriginesService);
    expect(service).toBeTruthy();
  });
});
