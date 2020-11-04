import { TestBed } from '@angular/core/testing';

import { EntrepotsService } from './entrepots.service';

describe('EntrepotsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EntrepotsService = TestBed.get(EntrepotsService);
    expect(service).toBeTruthy();
  });
});
