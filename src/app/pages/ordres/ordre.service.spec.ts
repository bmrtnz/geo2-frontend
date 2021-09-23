import { TestBed } from '@angular/core/testing';

import { OrdreService } from './ordre.service';

describe('OrdreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrdreService = TestBed.get(OrdreService);
    expect(service).toBeTruthy();
  });
});
