import { TestBed } from "@angular/core/testing";

import { DepotEnvoisService } from "./depot-envois.service";

describe("DepotEnvoisService", () => {
  let service: DepotEnvoisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepotEnvoisService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
