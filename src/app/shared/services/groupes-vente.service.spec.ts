import { TestBed } from '@angular/core/testing';

import { GroupesVenteService } from './groupes-vente.service';

describe('GroupesVenteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GroupesVenteService = TestBed.get(GroupesVenteService);
    expect(service).toBeTruthy();
  });
});
