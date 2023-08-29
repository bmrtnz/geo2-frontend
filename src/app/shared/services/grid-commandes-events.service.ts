import { Injectable } from '@angular/core';
import { concatMap, lastValueFrom, map, Observable, tap } from 'rxjs';
import { Article, OrdreLigne, Secteur, Societe, TypePalette } from '../models';
import Ordre from '../models/ordre.model';
import { OrdresService } from './api/ordres.service';
import { TypesPaletteService } from './api/types-palette.service';
import { CurrentCompanyService } from './current-company.service';

@Injectable({
  providedIn: 'root'
})
export class GridCommandesEventsService {

  private context: Partial<Ordre>;

  constructor(
    private currentCompanyService: CurrentCompanyService,
    private ordresService: OrdresService,
    private typesPaletteService: TypesPaletteService,
  ) { }

  updateContext(ordre: Ordre["id"]) {
    const societe = this.currentCompanyService.getCompany();
    return this.ordresService.getOne_v2(ordre, new Set([
      "id",
      "secteurCode",
      "societe.id",
      "societe.devise.id",
      "client.secteur.id",
    ])).pipe(
      tap(res => {
        this.context = res.data.ordre;
      }),
    );
  }

  async onNombrePalettesCommandeesChange(
    newData: Partial<OrdreLigne>,
    value: OrdreLigne["nombrePalettesCommandees"],
    currentData: Partial<OrdreLigne>,
  ) {
    newData.nombrePalettesCommandees = value;
    if (this.context?.secteurCode === "F") {
      const typePalette = currentData?.paletteInter ?? currentData?.typePalette;

      if (this.context?.client?.secteur?.id !== "F")
        newData.nombrePalettesCommandees = 0;

      if (!currentData.nombrePalettesCommandees || newData.nombrePalettesCommandees === 0) {
        let nombreColisPalette: number;
        let nombreColisPaletteIntermediaire: number;

        if (typePalette?.id) {
          nombreColisPalette = await lastValueFrom(this.typesPaletteService.fetchNombreColisParPalette(
            typePalette?.id,
            currentData.article.id,
            this.context?.client?.secteur?.id,
          ).pipe(map(res => res.data.fetchNombreColisParPalette)));
        }

        if (nombreColisPalette) {
          // BAM le 14/11/18
          // ne pas modifier les colis si déjà saisi
          if (currentData?.nombreColisPalette > 0)
            nombreColisPalette = currentData.nombreColisPalette;
          newData.nombreColisPalette = nombreColisPalette;
        } else
          nombreColisPalette = currentData.nombreColisPalette;

        nombreColisPaletteIntermediaire = currentData.nombrePalettesIntermediaires;
        if (!nombreColisPaletteIntermediaire)
          nombreColisPaletteIntermediaire = 1;
        else {
          if (nombreColisPaletteIntermediaire === 1)
            nombreColisPaletteIntermediaire = 2;
          nombreColisPalette /= nombreColisPaletteIntermediaire;
          newData.nombreColisPalette = nombreColisPalette;
        }

        if (!nombreColisPalette) nombreColisPalette = 0;

        if (nombreColisPalette !== 0)
          newData.nombreColisPalette = nombreColisPalette;

        // BAM le 24/08/16
        // Pour tout les secteurs sauf france on recalcule le nombre de colis
        if (nombreColisPalette !== 0)
          newData.nombreColisCommandes = value * nombreColisPalette * nombreColisPaletteIntermediaire;

      }

      if (!value) newData.indicateurPalette = 0;
    }
  }

}
