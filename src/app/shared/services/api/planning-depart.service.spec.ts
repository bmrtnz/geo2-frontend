import { TestBed } from '@angular/core/testing';

import { PlanningDepartService } from './planning-depart.service';

describe('PlanningDepartService', () => {
  let service: PlanningDepartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanningDepartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
