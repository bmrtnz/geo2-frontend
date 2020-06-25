import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridNavigatorComponent } from './grid-navigator.component';

describe('GridNavigatorComponent', () => {
  let component: GridNavigatorComponent;
  let fixture: ComponentFixture<GridNavigatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridNavigatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
