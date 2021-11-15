import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { GridEntrepotsComponent } from '../grid-entrepots/grid-entrepots.component';
import { GridHistoriqueEntrepotsComponent } from '../grid-historique-entrepots/grid-historique-entrepots.component';

@Component({
  selector: 'app-nouvel-ordre',
  templateUrl: './nouvel-ordre.component.html',
  styleUrls: ['./nouvel-ordre.component.scss']
})
export class NouvelOrdreComponent implements OnInit, AfterViewInit {

  public typeEntrepots = ['Favoris', 'Tous'];
  public favorites = true;

  @ViewChild(GridEntrepotsComponent, { static: false })
  EntrepotGrid: GridEntrepotsComponent;
  @ViewChild(GridHistoriqueEntrepotsComponent, { static: false })
  historiqueEntrepotGrid: GridHistoriqueEntrepotsComponent;

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {}

  onTypeChange(e) {
    this.favorites = (e.value === this.typeEntrepots[0]);
  }

}
