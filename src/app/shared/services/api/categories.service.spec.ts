import { TestBed } from "@angular/core/testing";

import { CategoriesService } from "./categories.service";

describe("CategoriesService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CategoriesService = TestBed.inject(CategoriesService);
    expect(service).toBeTruthy();
  });
});
