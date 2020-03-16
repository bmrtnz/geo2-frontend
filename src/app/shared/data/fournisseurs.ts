const fournisseurs = [
  {
    id: '000150',
    code: 'STANOR',
    raisonSocial: 'STANOR SCA',
    societe: {
      id: 'SA',
      raisonSocial: 'Blue Whale S.A.S.'
    },
    bureauAchat: {
      id: 'UDC',
      description: 'UDC - Les vergers de Mug'
    },
    typeBureau: {
      id: 'PSO',
      description: 'Partenaires Sud Ouest'
    },
    stockActif: true,
    suiviPrecalibre: true,
    adresse1: 'BP 38',
    adresse2: '655 rue des Pommes',
    adresse3: null,
    codePostal: '82201',
    latitude: '44.1129119',
    longitude: '1.111539200000',
    ville: 'MOISSAC Cedex',
    pays: 'FR',
    facturationRaisonSocial: '',
    facturationAdresse1: 'test adr fact',
    facturationAdresse2: null,
    facturationAdresse3: null,
    facturationCodePostal: null,
    facturationVille: null,
    facturationPays: null,
    regimeTva: 'C',
    incoterm: {
      id: ''
    },
    nbJourEcheance: 30,
    echeanceLe: 0,
    moyenPaiement: 'CHQ',
    tvaCee: 'FR00775712003',
    controlReferenceFournisseur: null,
    commentaireHautFacture: null,
    commentaireBasFacture: null,
    instructionCommercial: null,
    siret: '45454545454',
    blocageAvoirEdi: false,
    debloquerEnvoieJour: false,
    ifco: null,
    instructionLogistique: null,
    basePaiement: 'F',
    compteComptable: 'STANOR',
    langue: 'FR',
    devise: 'EUR',
    commercial: 'MCO',
    assistante: 'FAR',
    referenceCoface: '540069529A',
    agrement: null,
    courtier: null,
    courtageModeCalcul: null,
    courtageValeur: null,
    typeClient: null,
    groupeClient: null,
    soumisCtifl: true,
    formeJuridique: 'Société Coopérative Agricole à Capital Variable',
    SiretAPE: 'n° SIRET 775 712 003 00018 APE 46312',
    idTVA: 'n° TVA FR 00 775 712 003',
    RCS: 'RCS Montauban 775 712 003 / Agrément N° 82144',
    autoFacturation: false,
    identTracabilite: '033',
    agrementBW: '',
    codeStation: '033'
  }
];

export default fournisseurs;
