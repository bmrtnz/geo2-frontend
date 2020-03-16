import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransporteursListComponent } from './transporteurs-list.component';

describe('ListComponent', () => {
  let component: TransporteursListComponent;
  let fixture: ComponentFixture<TransporteursListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransporteursListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransporteursListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
