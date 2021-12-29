import { Component, ViewChild } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Entrepot } from 'app/shared/models';
import { FunctionsService, Response as FunctionResponse } from 'app/shared/services/api/functions.service';
import { SingleSelection } from 'basic';
import notify from 'devextreme/ui/notify';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { GridEntrepotsComponent } from '../grid-entrepots/grid-entrepots.component';
import { GridHistoriqueEntrepotsComponent } from '../grid-historique-entrepots/grid-historique-entrepots.component';

@Component({
  selector: 'app-nouvel-ordre',
  templateUrl: './nouvel-ordre.component.html',
  styleUrls: ['./nouvel-ordre.component.scss']
})
export class NouvelOrdreComponent {

  public typeEntrepots = ['Favoris', 'Tous'];
  public favorites = true;
  public resolver: Observable<ApolloQueryResult<FunctionResponse>>;

  @ViewChild(GridEntrepotsComponent, { static: false })
  EntrepotGrid: GridEntrepotsComponent;
  @ViewChild(GridHistoriqueEntrepotsComponent, { static: false })
  historiqueEntrepotGrid: GridHistoriqueEntrepotsComponent;
  @ViewChild('grid') private grid: SingleSelection<Entrepot>;

  constructor(
    private functionsService: FunctionsService,
  ) { }

  onButtonLoaderClick() {

    this.resolver = this.functionsService
    .ofValideEntrepotForOrdre(this.getSelectedItem().id)
    .valueChanges
    .pipe(
      takeWhile( res => res.loading ),
    );

    this.resolver.subscribe({
      error: err => notify(err.message, 'warning', 3000),
      complete: () => console.log('DONE'),
    });

  }

  getSelectedItem() {
    return this?.grid?.getSelectedItem();
  }

  onTypeChange(e) {
    this.favorites = (e.value === this.typeEntrepots[0]);
  }

}
