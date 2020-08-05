import { TestBed } from '@angular/core/testing';

import { EtiquettesEvenementiellesService } from './etiquettes-evenementielles.service';

describe('EtiquettesEvenementiellesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EtiquettesEvenementiellesService = TestBed.get(EtiquettesEvenementiellesService);
    expect(service).toBeTruthy();
  });
});
