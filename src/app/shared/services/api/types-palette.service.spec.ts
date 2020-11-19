import { TestBed } from '@angular/core/testing';

import { TypesPaletteService } from './types-palette.service';

describe('TypesPaletteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TypesPaletteService = TestBed.get(TypesPaletteService);
    expect(service).toBeTruthy();
  });
});
