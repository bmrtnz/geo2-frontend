import { TestBed } from "@angular/core/testing";

import { FluxService } from "./flux.service";

describe("FluxService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: FluxService = TestBed.inject(FluxService);
    expect(service).toBeTruthy();
  });
});
