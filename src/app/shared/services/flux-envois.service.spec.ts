import { TestBed } from "@angular/core/testing";

import { FluxEnvoisService } from "./flux-envois.service";

describe("FluxEnvoisService", () => {
  let service: FluxEnvoisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FluxEnvoisService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
