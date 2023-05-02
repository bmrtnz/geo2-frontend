import { TestBed } from "@angular/core/testing";

import { FormUtilsService } from "./form-utils.service";

describe("FormUtilsService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: FormUtilsService = TestBed.inject(FormUtilsService);
    expect(service).toBeTruthy();
  });
});
