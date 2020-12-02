import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridLignesComponent } from './grid-lignes.component';

describe('GridLignesComponent', () => {
  let component: GridLignesComponent;
  let fixture: ComponentFixture<GridLignesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridLignesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridLignesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
