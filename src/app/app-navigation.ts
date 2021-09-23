export const navigation = [
  {
    text: 'Accueil',
    path: '/home',
    icon: 'home'
  },
  {
    dev: true,
    text: 'Examples',
    icon: 'folder',
    items: [
      {
        text: 'Profil',
        path: '/profile'
      },
      {
        text: 'Display Data',
        path: '/display-data'
      }, {
        text: 'Test grid-form',
        path: '/test-grid-form'
      }
    ]
  },
  {
    text: 'Ordres de commande',
    icon: 'material-icons euro_symbol',
    path: '/ordres'
    // items: [
    //   {
    //     text: 'Accueil',
    //     path: '/ordres/accueil'
    //   }, {
    //     text: 'Ordres',
    //     path: '/ordres/details'
    //   }
    // ]
  },
  {
    html: '<i class="dx-icon dx-icon-user"></i><div>Tiers</div><div class="presaisie-indicator"></div>',
    id: 'tiers',
    items: [
      {
        html: '<div>Clients</div><div class="presaisie-indicator"></div>',
        id: 'clients',
        path: '/nested/n/(tiers/clients/list)'
      }, {
        html: '<div>Fournisseurs</div><div class="presaisie-indicator"></div>',
        id: 'fournisseurs',
        path: '/nested/n/(tiers/fournisseurs/list)'
      }, {
        html: '<div>Transporteurs</div><div class="presaisie-indicator"></div>',
        id: 'transporteurs',
        path: '/nested/n/(tiers/transporteurs/list)'
      } , {
        html: '<div>Passage à quai</div><div class="presaisie-indicator"></div>',
        id: 'passages-a-quai',
        path: '/nested/n/(tiers/lieux-passage-a-quai/list)',
      }
    ]
  },
  {
    html: '<i class="dx-icon dx-icon-box"></i><div>Articles</div><div class="presaisie-indicator"></div>',
    id: 'articles',
    path: '/nested/n/(articles/list)'
  },
  {
    dev: true,
    text: 'Stock',
    icon: 'material-icons dashboard',
    path: 'stock'
  }
];
