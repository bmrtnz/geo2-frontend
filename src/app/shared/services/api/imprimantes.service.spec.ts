import { TestBed } from "@angular/core/testing";

import { ImprimantesService } from "./imprimantes.service";

describe("ImprimantesService", () => {
  let service: ImprimantesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImprimantesService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
