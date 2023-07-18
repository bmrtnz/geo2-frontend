import { TestBed } from '@angular/core/testing';

import { StockArticleEdiBassinService } from './stock-article-edi-bassin.service';

describe('StockArticleEdiBassinService', () => {
  let service: StockArticleEdiBassinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockArticleEdiBassinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
