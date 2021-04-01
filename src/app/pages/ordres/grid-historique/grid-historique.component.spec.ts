import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { LocalizePipe } from 'app/shared/pipes';
import { AuthService } from 'app/shared/services';

import { GridHistoriqueComponent } from './grid-historique.component';

describe('GridHistoriqueComponent', () => {
  let component: GridHistoriqueComponent;
  let fixture: ComponentFixture<GridHistoriqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridHistoriqueComponent, LocalizePipe ],
      providers: [ AuthService ],
      imports: [ RouterTestingModule, HttpClientTestingModule, ApolloTestingModule ],
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
