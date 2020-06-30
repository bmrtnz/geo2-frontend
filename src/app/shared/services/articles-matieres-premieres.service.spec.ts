import { TestBed } from '@angular/core/testing';

import { ArticlesMatieresPremieresService } from './articles-matieres-premieres.service';

describe('ArticlesMatieresPremieresService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ArticlesMatieresPremieresService = TestBed.get(ArticlesMatieresPremieresService);
    expect(service).toBeTruthy();
  });
});
