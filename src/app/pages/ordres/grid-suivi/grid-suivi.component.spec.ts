import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridSuiviComponent } from './grid-suivi.component';

describe('GridSuiviComponent', () => {
  let component: GridSuiviComponent;
  let fixture: ComponentFixture<GridSuiviComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridSuiviComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridSuiviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
