import { TestBed } from '@angular/core/testing';

import { GridCommandesEventsService } from './grid-commandes-events.service';

describe('GridCommandesEventsService', () => {
  let service: GridCommandesEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridCommandesEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
