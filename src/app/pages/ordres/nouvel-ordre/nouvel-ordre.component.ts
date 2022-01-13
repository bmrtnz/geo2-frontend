import { Component, ViewChild } from '@angular/core';
import { Entrepot } from 'app/shared/models';
import MRUEntrepot from 'app/shared/models/mru-entrepot.model';
import { FunctionsService } from 'app/shared/services/api/functions.service';
import { OrdresService } from 'app/shared/services/api/ordres.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { SingleSelection } from 'basic';
import { DxPopupComponent } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { defer, Observable } from 'rxjs';
import { concatMapTo, map, takeUntil, tap } from 'rxjs/operators';
import { GridEntrepotsComponent } from '../grid-entrepots/grid-entrepots.component';
import { GridHistoriqueEntrepotsComponent } from '../grid-historique-entrepots/grid-historique-entrepots.component';
import { TabContext } from '../root/root.component';

@Component({
  selector: 'app-nouvel-ordre',
  templateUrl: './nouvel-ordre.component.html',
  styleUrls: ['./nouvel-ordre.component.scss']
})
export class NouvelOrdreComponent {

  public typeEntrepots = ['Favoris', 'Tous'];
  public favorites = true;
  public resolver: Observable<string>;

  private ofValideEntrepotForOrdreRef = defer(() => this.functionsService
  .ofValideEntrepotForOrdre(this.getSelectedEntrepot().id).valueChanges);
  private fNouvelOrdreRef = defer(() => this.functionsService
  .fNouvelOrdre(this.currentCompanyService.getCompany().id).valueChanges);

  @ViewChild(GridEntrepotsComponent, { static: false })
  EntrepotGrid: GridEntrepotsComponent;
  @ViewChild(GridHistoriqueEntrepotsComponent, { static: false })
  historiqueEntrepotGrid: GridHistoriqueEntrepotsComponent;
  @ViewChild('grid') private grid: SingleSelection<Entrepot|MRUEntrepot>;
  @ViewChild(DxPopupComponent) private popup: DxPopupComponent;

  constructor(
    private functionsService: FunctionsService,
    private ordresService: OrdresService,
    private currentCompanyService: CurrentCompanyService,
    private tabContext: TabContext,
  ) { }

  onButtonLoaderClick() {

    this.resolver = this.ofValideEntrepotForOrdreRef
    .pipe(
      concatMapTo(this.fNouvelOrdreRef),
      tap( res => this.popup.visible = true ),
      takeUntil(this.popup.onHiding),
      map( res => res.data.fNouvelOrdre.data.ls_nordre ),
    );

    this.resolver
    // .pipe(takeUntil(this.popup.onHiding))
    .subscribe({
      // next: numero => this.tabContext.openOrdre(numero),
      error: err => notify(err.message, 'warning', 3000),
    });

  }

  getSelectedEntrepot() {
    const item = this?.grid?.getSelectedItem();
    if (item instanceof MRUEntrepot) return item.entrepot;
    if (item instanceof Entrepot) return item;
  }

  onTypeChange(e) {
    this.favorites = (e.value === this.typeEntrepots[0]);
  }
}
