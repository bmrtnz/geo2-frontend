import { Injectable } from '@angular/core';
import dxDataGrid from 'devextreme/ui/data_grid';
import { concatMap, lastValueFrom, map, tap } from 'rxjs';
import { Fournisseur, NatureStation, OrdreLigne, TypePalette } from '../models';
import Ordre from '../models/ordre.model';
import { AttribFraisService } from './api/attrib-frais.service';
import { DevisesRefsService } from './api/devises-refs.service';
import { FournisseursService } from './api/fournisseurs.service';
import { FunctionsService } from './api/functions.service';
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
    private fournisseursService: FournisseursService,
    private functionsService: FunctionsService,
    private typesPaletteService: TypesPaletteService,
    private devisesRefsService: DevisesRefsService,
    private attribFraisService: AttribFraisService,
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
      "typeVente.id",
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
    if (this.context?.secteurCode !== "F") {
      if (this.context?.client?.secteur?.id !== "F")
        newData.nombreColisCommandes = 0;

      if (!currentData.nombreColisCommandes || newData.nombreColisCommandes === 0) {
        let nombreColisPalette: number;
        let nombreColisPaletteIntermediaire: number;

        if (currentData?.nombreColisPaletteByDimensions) {
          nombreColisPalette = currentData?.nombreColisPaletteByDimensions;
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
  async onNombrePalettesIntermediairesChange(
    newData: Partial<OrdreLigne>,
    value: OrdreLigne["nombrePalettesIntermediaires"],
    currentData: Partial<OrdreLigne>,
    dxDataGrid: dxDataGrid,
  ) {
    newData.nombrePalettesIntermediaires = value;
    let ls_pal_code;

    if (value > 0) {
      ls_pal_code = currentData.typePalette?.id;
      if (ls_pal_code) {
        if (!currentData.paletteInter?.id || currentData.paletteInter.id === "-")
          newData.paletteInter = { id: ls_pal_code };
      }
      ls_pal_code = { id: newData.paletteInter?.id ?? currentData.paletteInter?.id };
    } else newData.paletteInter = { id: "-" };

    if (!ls_pal_code) ls_pal_code = currentData.typePalette?.id;

    if (value !== 0) {
      if (value === 1)
        newData.nombreColisPalette = currentData?.nombreColisPaletteByDimensions / 2;
      else
        newData.nombreColisPalette = currentData?.nombreColisPaletteByDimensions / value;
    } else {
      if (currentData?.nombreColisPaletteByDimensions)
        newData.nombreColisPalette = currentData?.nombreColisPaletteByDimensions;
    }

    let ll_nb_pal = currentData.nombrePalettesCommandees;
    let ll_nb_pal_calc = ll_nb_pal;
    if (!ll_nb_pal) ll_nb_pal_calc = 1;
    if (value === 1)
      value = ll_nb_pal === 0 ? 1 : 2;
    if (value === 0) value = 1;

    if (this.context?.secteurCode !== "F")
      if (currentData?.nombreColisPaletteByDimensions && currentData?.nombreColisPaletteByDimensions !== 0)
        newData.nombreColisCommandes = value * ll_nb_pal_calc * currentData?.nombreColisPaletteByDimensions;

    if (this.context?.client?.secteur?.id === "F")
      if (!["RPO", "RPR"].includes(this.context.type.id) || (currentData.venteUnite.id !== "UNITE" && currentData.achatUnite.id !== "UNITE"))
        this.ofRepartitionPalette({ ...currentData, ...newData })?.(dxDataGrid);
  }

  async onNombreColisPaletteChange(
    newData: Partial<OrdreLigne>,
    value: OrdreLigne["nombreColisPalette"],
    currentData: Partial<OrdreLigne>,
    dxDataGrid: dxDataGrid,
  ) {
    const applyRepartitionPalette = this.ofRepartitionPalette({ ...currentData, ...newData });

    newData.nombreColisPalette = value;
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
        applyRepartitionPalette?.(dxDataGrid);
    }

    if (this.context?.secteurCode === "F") {
      if (currentData?.nombreColisCommandes && value === 0)
        newData.nombreColisPalette = value;

      if (!currentData?.nombreColisCommandes && value !== 0)
        newData.nombreColisPalette = 0;

      if (!["RPO", "RPR"].includes(this.context.type.id) || (currentData.venteUnite.id !== "UNITE" && currentData.achatUnite.id !== "UNITE"))
        applyRepartitionPalette?.(dxDataGrid);
    }
  }

  async onNombreColisCommandesChange(
    newData: Partial<OrdreLigne>,
    value: OrdreLigne["nombreColisCommandes"],
    currentData: Partial<OrdreLigne>,
    dxDataGrid: dxDataGrid,
  ) {
    newData.nombreColisCommandes = value;
    if (this.context?.secteurCode === "F") {
      if (value && currentData.nombreColisPalette === 0) {
        newData.nombreColisPalette = currentData?.nombreColisPaletteByDimensions;
      }

      if (!value && currentData.nombreColisPalette !== 0)
        newData.nombreColisPalette = 0;

      if (!["RPO", "RPR"].includes(this.context.type.id) || (currentData.venteUnite.id !== "UNITE" && currentData.achatUnite.id !== "UNITE"))
        this.ofRepartitionPalette({ ...currentData, ...newData })?.(dxDataGrid);
    }
  }

  async onProprietaireMarchandiseChange(
    newData: Partial<OrdreLigne>,
    value: Fournisseur["id"],
    currentData: Partial<OrdreLigne>,
    dxDataGrid: dxDataGrid,
  ) {
    newData.proprietaireMarchandise = { id: value };
    const listeExpediteurs = currentData.proprietaireMarchandise?.listeExpediteurs?.split(",");
    let ls_fou: Partial<Fournisseur>;

    if (currentData.proprietaireMarchandise?.natureStation === NatureStation.EXCLUSIVEMENT_PROPRIETAIRE)
      if (listeExpediteurs?.length) {
        const fournisseur = await lastValueFrom(this.fournisseursService
          .getFournisseurByCode(listeExpediteurs[0], new Set(["id", "code"])));
        ls_fou = fournisseur.data.fournisseurByCode;
      }
      else {
        const fournisseur = await lastValueFrom(this.fournisseursService
          .getOne_v2(value, new Set(["id", "code"])));
        ls_fou = fournisseur.data.fournisseur;
      }

    if (listeExpediteurs?.find(exp => exp === newData?.fournisseur?.code) && currentData.logistique?.expedieStation) {
      newData.fournisseur = ls_fou;

      //Effacer les infos du détail d'expedition lors du changement de fournisseur
      newData.nombrePalettesExpediees = 0;
      newData.nombreColisExpedies = 0;
      newData.poidsBrutExpedie = 0;
      newData.poidsNetExpedie = 0;
      newData.achatQuantite = 0;
      newData.venteQuantite = 0;
      this.functionsService.clearTraca(currentData.id).subscribe();

    }

    const newProprietaire = await lastValueFrom(this.fournisseursService.getOne_v2(value, ["id", "devise.id"]));
    let ls_dev_code = newProprietaire.data.fournisseur.devise.id;
    let ld_dev_taux: number;

    if (value !== currentData.proprietaireMarchandise?.id) {
      if (ls_dev_code) {
        if (ls_dev_code === this.context.societe.devise.id)
          ld_dev_taux = 1;
        else {
          const res = await lastValueFrom(this.devisesRefsService.getOne({
            id: this.context.societe.devise.id,
            devise: ls_dev_code,
          }, ["id", "tauxAchat"]));
          if (res?.data?.deviseRef)
            ld_dev_taux = res.data.deviseRef.tauxAchat;
          if (!ld_dev_taux) {
            console.error("Erreur: le taux de cette devise n'est pas renseigné");
            ls_dev_code = this.context.societe.devise.id;
            ld_dev_taux = 1;
          }
        }

        //Vérification s'il existe un pu mini pour la variété club
        //New gestion des frais marketing
        let ld_prix_mini = 0;
        try {
          const resFrais = await lastValueFrom(this.functionsService.fRecupFrais(
            currentData.article.matierePremiere.variete.id,
            currentData.article.cahierDesCharge.categorie.id,
            this.context.secteurCode,
            currentData.article.cahierDesCharge.categorie.cahierDesChargesBlueWhale,
            currentData.article.matierePremiere.modeCulture.id,
            currentData.article.matierePremiere.origine.id,
          ).pipe(concatMap(res => this.attribFraisService
            .getOne_v2(res?.data?.fRecupFrais?.res.toFixed(), new Set(["id", "fraisPU", "fraisUnite.id", "accompte", "perequation"])))));

          if (resFrais?.data?.attribFrais)
            ld_prix_mini = resFrais.data.attribFrais.perequation
              ? resFrais.data.attribFrais.accompte : 0;
        } catch (error) {
          console.warn("Echec de recuperation des frais -> ", error);
        }

        let ld_ach_pu, ld_ach_dev_pu;
        if (ld_prix_mini && !["IMP", "BUK"].includes(this.context.societe.id)) {
          newData.achatPrixUnitaire = ld_prix_mini;
          ld_ach_pu = ld_prix_mini;
          ld_ach_dev_pu = ld_dev_taux * ld_prix_mini;
          newData.achatPrixUnitaire = ld_ach_pu;
          newData.achatDevisePrixUnitaire = ld_ach_dev_pu;
        } else {
          newData.achatPrixUnitaire = ld_dev_taux * currentData.achatDevisePrixUnitaire;
        }

      } else {
        ls_dev_code = this.context.societe.devise.id;
        ld_dev_taux = 1;
      }

      newData.achatDevise = ls_dev_code;
      newData.achatDeviseTaux = ld_dev_taux;
    }

    if (this.context.societe.id === "UDC" && this.context.secteurCode === "RET")
      // On met un petit delai, sinon on obtient pas les nouvelles valeurs
      setTimeout(() => dxDataGrid.getVisibleRows()
        .forEach(row => {
          dxDataGrid.cellValue(row.rowIndex, "proprietaireMarchandise.id", value);
          dxDataGrid.cellValue(row.rowIndex, "fournisseur.id", ls_fou.id);
        }), 10);

    if (this.context?.secteurCode === "F")
      if (!["RPO", "RPR"].includes(this.context.type.id) || (currentData.venteUnite.id !== "UNITE" && currentData.achatUnite.id !== "UNITE"))
        setTimeout(() => dxDataGrid.getVisibleRows()
          .forEach(row => this.ofRepartitionPalette(row.data)?.(dxDataGrid)), 1000);
  }

  async onFournisseurChange(
    newData: Partial<OrdreLigne>,
    value: Fournisseur["id"],
    currentData: Partial<OrdreLigne>,
    dxDataGrid: dxDataGrid,
  ) {
    newData.fournisseur = { id: value };

    if (!currentData.logistique.expedieStation) {
      //Effacer les infos du détail d'expedition lors du changement de fournisseur
      currentData.nombrePalettesExpediees = 0;
      currentData.nombreColisExpedies = 0;
      currentData.poidsBrutExpedie = 0;
      currentData.poidsNetExpedie = 0;
      currentData.achatQuantite = 0;
      currentData.venteQuantite = 0;
      this.functionsService.clearTraca(currentData.id).subscribe();
    }

    if (currentData.fournisseur?.id !== newData.fournisseur?.id)
      if (!currentData.proprietaireMarchandise?.id)
        newData.proprietaireMarchandise = { id: value };

    // const ls_visible_reparcam = dxDataGrid.getVisibleRows()
    //   .some(row => row.data.fournisseur.indicateurRepartitionCamion);

    if (this.context?.secteurCode === "F")
      if (!["RPO", "RPR"].includes(this.context.type.id) || (currentData.venteUnite.id !== "UNITE" && currentData.achatUnite.id !== "UNITE"))
        dxDataGrid.getVisibleRows()
          .forEach(row => this.ofRepartitionPalette(row.data)?.(dxDataGrid));

    if (this.context.societe.id === "UDC" && this.context.secteurCode === "RET")
      // On met un petit delai, sinon on obtient pas les nouvelles valeurs
      setTimeout(() => dxDataGrid.getVisibleRows()
        .forEach(row => {
          dxDataGrid.cellValue(row.rowIndex, "fournisseur.id", value);
        }), 10);
  }

  async onVentePrixUnitaireChange(
    newData: Partial<OrdreLigne>,
    value: OrdreLigne["ventePrixUnitaire"],
    currentData: Partial<OrdreLigne>,
  ) {
    newData.ventePrixUnitaire = value;
    if (value > 0) newData.gratuit = false;
  }

  async onGratuitChange(
    newData: Partial<OrdreLigne>,
    value: OrdreLigne["gratuit"],
    currentData: Partial<OrdreLigne>,
  ) {
    newData.gratuit = value;
    if (value) {
      newData.ventePrixUnitaire = 0;
      if (currentData.achatDevisePrixUnitaire === null) {
        newData.achatDevisePrixUnitaire = 0;
        newData.achatPrixUnitaire = 0;
      }
    }
  }

  async onAchatDevisePrixUnitaireChange(
    newData: Partial<OrdreLigne>,
    value: OrdreLigne["achatDevisePrixUnitaire"],
    currentData: Partial<OrdreLigne>,
  ) {
    newData.achatDevisePrixUnitaire = value;

    let ld_dev_taux;
    const newProprietaire = await lastValueFrom(this.fournisseursService.getOne_v2(currentData.proprietaireMarchandise.id, ["id", "devise.id"]));
    let ls_dev_code = newProprietaire.data.fournisseur.devise.id;
    const res = await lastValueFrom(this.devisesRefsService.getOne({
      id: this.context.societe.devise.id,
      devise: ls_dev_code,
    }, ["id", "tauxAchat"]));

    if (res?.data?.deviseRef?.tauxAchat)
      ld_dev_taux = res.data.deviseRef.tauxAchat;
    else {
      newData.achatDevise = this.context.societe.devise.id;
      ld_dev_taux = 1;
    }

    newData.achatDeviseTaux = ld_dev_taux;
    newData.achatPrixUnitaire = (newData.achatDeviseTaux ?? newData.achatDeviseTaux) * value;
  }

  async onTypePaletteChange(
    newData: Partial<OrdreLigne>,
    value: TypePalette["id"],
    currentData: Partial<OrdreLigne>,
    dxDataGrid: dxDataGrid,
  ) {
    newData.typePalette = { id: value };

    const nombreColisPalette = await lastValueFrom(this.typesPaletteService.fetchNombreColisParPalette(
      value,
      currentData.article.id,
      this.context?.client?.secteur?.id,
    ).pipe(map(res => res.data.fetchNombreColisParPalette)));

    if (this.context?.secteurCode === "F") {
      newData.nombreColisPaletteByDimensions = nombreColisPalette;
      newData.nombreColisPalette = nombreColisPalette;
    }

    if (!["RPO", "RPR"].includes(this.context.type.id) || (currentData.venteUnite.id !== "UNITE" && currentData.achatUnite.id !== "UNITE"))
      this.ofRepartitionPalette({ ...currentData, ...newData })?.(dxDataGrid);
  }

  async onPaletteInterChange(
    newData: Partial<OrdreLigne>,
    value: TypePalette["id"],
    currentData: Partial<OrdreLigne>,
  ) {
    newData.paletteInter = { id: value };
    if (value === "-") newData.nombrePalettesIntermediaires = 0;
    else if (value)
      if (currentData.nombrePalettesIntermediaires === 0)
        newData.nombrePalettesIntermediaires = 1;
  }

  private ofRepartitionPalette(
    data: Partial<OrdreLigne>,
  ) {

    let nb_pal: number;
    let ld_pal_nb_col: number;
    let nb_pal_th = 0;
    let nb_pal_dispo = 0;
    const selectedFournisseurID = data.fournisseur?.id;

    return (dxDataGrid: dxDataGrid) =>
      // On met un petit delai, sinon on obtient pas les nouvelles valeurs
      setTimeout(() => dxDataGrid.getVisibleRows()
        .filter(row => {
          return row.rowType === "data" &&
            row.data.fournisseur?.id === selectedFournisseurID;
        })
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
            nb_pal = Math.floor(nb_pal_dispo + row.data.nombreColisCommandes / ld_pal_nb_col);
          } else {
            nb_pal_th = 0;
            nb_pal = 0;
          }

          // On regarde si il reste une partie de palette occupée
          nb_pal_th -= nb_pal;
          // Si une partie de palette est occupée
          if (nb_pal_th > 0) {
            // On ajoute une palette au sol
            nb_pal += 1;
            // On garde la place qui reste sur cette palette
            nb_pal_th -= 1;
          }
          nb_pal_dispo = nb_pal_th;

          const nombrePalettes = Math.ceil(nb_pal);
          if (nombrePalettes !== row.data?.nombrePalettesCommandees)
            dxDataGrid.cellValue(row.rowIndex, "nombrePalettesCommandees", nombrePalettes);
        }), 10);

  }

}
