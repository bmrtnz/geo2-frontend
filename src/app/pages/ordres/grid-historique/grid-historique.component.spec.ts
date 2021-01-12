import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridHistoriqueComponent } from './grid-historique.component';

describe('GridHistoriqueComponent', () => {
  let component: GridHistoriqueComponent;
  let fixture: ComponentFixture<GridHistoriqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridHistoriqueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridHistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
