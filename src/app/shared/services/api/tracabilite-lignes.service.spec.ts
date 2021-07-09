import { TestBed } from '@angular/core/testing';

import { TracabiliteLignesService } from './tracabilite-lignes.service';

describe('TracabiliteLignesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TracabiliteLignesService = TestBed.get(TracabiliteLignesService);
    expect(service).toBeTruthy();
  });
});
