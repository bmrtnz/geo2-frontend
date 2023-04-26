import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";

import { GridNavigatorComponent } from "./grid-navigator.component";

describe("GridNavigatorComponent", () => {
  let component: GridNavigatorComponent;
  let fixture: ComponentFixture<GridNavigatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GridNavigatorComponent],
      imports: [RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
