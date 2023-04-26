import { TestBed } from "@angular/core/testing";

import { CommentairesOrdresService } from "./commentaires-ordres.service";

describe("CommentairesOrdresService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CommentairesOrdresService = TestBed.inject(
      CommentairesOrdresService
    );
    expect(service).toBeTruthy();
  });
});
