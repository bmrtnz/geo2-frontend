import { TestBed } from '@angular/core/testing';

import { StockArticlesAgeService } from './stock-articles-age.service';

describe('StockArticlesAgeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StockArticlesAgeService = TestBed.inject(StockArticlesAgeService);
    expect(service).toBeTruthy();
  });
});
