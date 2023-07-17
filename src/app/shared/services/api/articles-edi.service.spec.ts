import { TestBed } from '@angular/core/testing';

import { ArticlesEdiService } from './articles-edi.service';

describe('ArticlesEdiService', () => {
  let service: ArticlesEdiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticlesEdiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
