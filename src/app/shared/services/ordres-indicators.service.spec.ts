import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

import { OrdresIndicatorsService } from './ordres-indicators.service';

describe('OrdresIndicatorsService', () => {

  let mockAuthService;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj(['currentUser']);
    mockAuthService.currentUser.and.returnValue({
      nomUtilisateur: 7,
      nomInterne: 7,
      accessGeoTiers: true,
      accessGeoProduct: true,
      accessGeoOrdre: true,
      limitationSecteur: false,
    });
    TestBed.configureTestingModule({
      providers: [
        OrdresIndicatorsService,
        DatePipe,
        {provide: AuthService, useValue: mockAuthService},
      ],
      imports: [ RouterTestingModule ],
    });
  });

  it('should be created', () => {
    const service: OrdresIndicatorsService = TestBed.inject(OrdresIndicatorsService);
    expect(service).toBeTruthy();
  });
});
