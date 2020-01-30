import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit {

  client: any;

  constructor() {
    this.client = {
      id: '000150',
      code: 'DIFRUTAS',
      raisonSocial: 'DIFRUTAS JOEL',
      societe: {
        id: 'SA',
        raisonSocial: 'Blue Whale S.A.S.'
      },
      secteur: {
        id: 'ESP',
        description: 'Espagne Portugal'
      },
      adresse1: 'Comercio de Frutas Lda.',
      adresse2: 'LUGAR DO RIBEIRO',
      adresse3: null,
      codePostal: '5100-361',
      ville: 'BRITIANDE LAMEGO ',
      pays: {
        id: 'PT',
        description: 'Portugal',
        numeroIso: '620'
      },
      facturationRaisonSocial: '',
      facturationAdresse1: null,
      facturationAdresse2: null,
      facturationAdresse3: null,
      facturationPays: null,
      regimeTva: {
        id: 'C'
      },
      incoterm: {
        id: '',
      },

      langue: {
        id: 'FR'
      },

      /*tyt_code: 'C',

      dev_code: 'EUR',
      mpm_code: 'CHQ',
      bpm_code: 'D',
      echnbj: '60',
      echle: null,
      inc_code: 'EXW',
      tvaid: 'PT505739798',

      enc_assure: 10000,
      enc_references: '540069529A',
      enc_depasse: 0,
      enc_date_valid: null,
      enc_bw: 125000,
      enc_actuel: 0,
      rem_sf_tx: 0.00,
      rem_hf_tx: 0.00,
      frais_pu: 0.00,
      frais_unite: null,
      soumis_ctifl: 'N',
      gcl_code: 'PEREIR',
      tcl_code: 'PREEMB',
      compte_compta: 'DIFRUTAS',
      crt_code: 'TEMPOFRUITS',
      crt_bta_code: 'KILO',
      crt_pu: 0.02,
      cov_code: 'COFREU',
      tvt_code: 'F',
      nb_ex_factures: '1',
      comment_haut_facture: null,
      comment_bas_facture: null,
      comment_relance: null,
      instructions_seccom: null,
      mod_user: 'isa',
      mod_date: '2019-12-06 11:45:56',
      valide: 'O',
      instructions_logistique: null,
      enc_0: 0,
      enc_1: 0,
      enc_2: 0,
      enc_3: 0,
      enc_4: 0,
      rel_niv_max: null,
      siret: null,
      lf_ean: null,
      per_code_com: 'MCO',
      enc_douteux: 0,
      rem_sf_tx_mdd: 0.00,
      alerte_coface: 0,
      decision_coface: 'N',
      libelle_ristourne: 'remise',
      dluo: null,
      planning_depart: 0,
      per_code_ass: 'FAR',
      delai_baf: 8,
      ctl_ref_cli: null,
      flag_fic_pal_client: 0,
      navoir_edi: 0,
      dev_tx_fix: null,
      dat_dev_tx_fix: null,
      ind_palox_gratuit: 'N',
      ifco: null,
      maj_wms: 1,
      date_debut_ifco: null,
      ind_usint: 'N',
      nbj_litige_lim: 45,
      dat_older_litige: null,
      code_bw_client: null,
      ind_comm_debloq: 'O',
      flbaf_autom: 'N',
      ind_frais_ramas: 'N',
      ligne_a_zero_sur_facture: 0,
      cli_ref_palox: '002154',
      ind_exclu_frais_pu: 'N',
      frais_plateforme: 0.00,
      fldet_autom: 'O',
      flclodet_autom: 'N',
      taux_interfel_imp: 0.0021,
      ind_vente_com: 'N',
      ind_cons_palox: 'O',
      ind_gest_colis_manquant: 'N',
      certifs: null*/
    };
  }

  ngOnInit() {
  }

}
