import { TestBed } from '@angular/core/testing';

import { StocksService } from './stocks.service';

describe('StocksService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StocksService = TestBed.inject(StocksService);
    expect(service).toBeTruthy();
  });
});
