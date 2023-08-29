import { Injectable } from '@angular/core';
import dxDataGrid from 'devextreme/ui/data_grid';
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
      "type.id",
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
          newData.nombrePalettesCommandees = value * nombreColisPalette * nombreColisPaletteIntermediaire;

      }

      if (!value) newData.indicateurPalette = 0;
    }
  }

  async onNombreColisCommandesChange(
    newData: Partial<OrdreLigne>,
    value: OrdreLigne["nombreColisCommandes"],
    currentData: Partial<OrdreLigne>,
    dxDataGrid: dxDataGrid,
  ) {
    if (this.context?.secteurCode === "F") {
      if (currentData.nombreColisCommandes && currentData.nombreColisPalette === 0)
        newData.nombreColisPalette = value;

      if (!currentData.nombreColisCommandes && currentData.nombreColisPalette !== 0)
        newData.nombreColisPalette = 0;

      if (!["RPO", "RPR"].includes(this.context.type.id) || (currentData.venteUnite.id !== "UNITE" && currentData.achatUnite.id !== "UNITE"))
        this.ofRepartitionPalette(newData, currentData)(dxDataGrid);
    }
  }

  async onNombreColisPaletteChange(
    newData: Partial<OrdreLigne>,
    value: OrdreLigne["nombreColisPalette"],
    currentData: Partial<OrdreLigne>,
    dxDataGrid: dxDataGrid,
  ) {
    const applyRepartitionPalette = this.ofRepartitionPalette(newData, currentData);

    if (this.context?.secteurCode !== "F") {
      if (value) {
        let ll_nb_pal_calc = currentData.nombrePalettesCommandees;

        if (!currentData?.nombrePalettesCommandees)
          ll_nb_pal_calc = 1;

        let ll_pal_nb_palinter = currentData?.nombrePalettesIntermediaires;
        if (ll_pal_nb_palinter === 1)
          ll_pal_nb_palinter = !currentData?.nombrePalettesCommandees ? 1 : 2;

        if (!ll_pal_nb_palinter) ll_pal_nb_palinter = 1;

        newData.nombreColisCommandes = value * ll_nb_pal_calc * ll_pal_nb_palinter;
      }
    } else {
      if (!["RPO", "RPR"].includes(this.context.type.id) || (currentData.venteUnite.id !== "UNITE" && currentData.achatUnite.id !== "UNITE"))
        applyRepartitionPalette(dxDataGrid);
    }

    if (this.context?.secteurCode === "F") {
      if (currentData?.nombreColisCommandes && value === 0)
        newData.nombreColisPalette = value;

      if (!currentData?.nombreColisCommandes && value !== 0)
        newData.nombreColisPalette = 0;

      if (!["RPO", "RPR"].includes(this.context.type.id) || (currentData.venteUnite.id !== "UNITE" && currentData.achatUnite.id !== "UNITE"))
        applyRepartitionPalette(dxDataGrid);
    }
  }

  private ofRepartitionPalette(
    newData: Partial<OrdreLigne>,
    currentData: Partial<OrdreLigne>,
  ) {
    if ((newData.nombreColisPalette ?? currentData.nombreColisPalette) !== 0) return;
    if (!newData.fournisseur?.id ?? currentData.fournisseur?.id) return;

    let nb_pal: number;
    let ld_pal_nb_col: number;
    let nb_pal_th = 0;
    let nb_pal_dispo = 0;
    return (dxDataGrid: dxDataGrid) => {
      dxDataGrid.getVisibleRows()
        .filter(row => row.data.fournisseur?.id === (newData.fournisseur?.id ?? currentData.fournisseur?.id))
        .forEach(row => {
          ld_pal_nb_col = row.data.nombreColisPalette;

          if (row.data.indicateurPalette === 1)
            // On charge des demi palettes gerbable, donc autant de palettes au sol mais on declare ensuite la moitié au trp
            ld_pal_nb_col *= 1;

          if (row.data.nombrePalettesIntermediaires > 0)
            ld_pal_nb_col *= (row.data.nombrePalettesIntermediaires + 1);

          if (ld_pal_nb_col !== 0) {
            // Compte le nombre de palettes en décimal en tenant compte de la place qui reste sur le dernier calcul théorique qui est forcément <=0
            nb_pal_th = nb_pal_dispo + row.data.nombreColisCommandes / ld_pal_nb_col;
            // Compte le nombre en valeur entière
            nb_pal = nb_pal_dispo + row.data.nombreColisCommandes / ld_pal_nb_col;
          } else {
            nb_pal_th = 0;
            nb_pal = 0;
          }

          // On regarde si il reste une partie de palette occupée
          nb_pal_th -= nb_pal;
          // Si une partie de palette est occupée
          if (nb_pal_th > 0) {
            // On ajoute une palette au sol
            nb_pal++;
            // On garde la place qui reste sur cette palette
            nb_pal_th -= 1;
          }
          nb_pal_dispo = nb_pal_th;
          dxDataGrid.cellValue(row.rowIndex, "nombrePalettesCommandees", nb_pal);
        });
    }
  }

}
