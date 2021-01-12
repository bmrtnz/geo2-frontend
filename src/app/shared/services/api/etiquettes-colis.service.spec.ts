import { TestBed } from '@angular/core/testing';

import { EtiquettesColisService } from './etiquettes-colis.service';

describe('EtiquettesColisService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EtiquettesColisService = TestBed.inject(EtiquettesColisService);
    expect(service).toBeTruthy();
  });
});
