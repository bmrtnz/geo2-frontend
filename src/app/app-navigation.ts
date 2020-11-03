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
    dev: true,
    text: 'Ordres de commande',
    icon: 'material-icons euro_symbol',
    path: '/ordres/accueil'
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
    text: 'Tiers',
    icon: 'user',
    items: [
      {
        text: 'Clients',
        path: '/nested/n/(tiers/clients/list)'
      }, {
        text: 'Fournisseurs',
        path: '/nested/n/(tiers/fournisseurs/list)'
      }, {
        text: 'Transporteurs',
        path: '/nested/n/(tiers/transporteurs/list)'
      } , {
        text: 'Passages à quai',
        path: '/nested/n/(tiers/lieux-passage-a-quai/list)'
      }
    ]
  },
  {
    dev: true,
    text: 'Articles',
    icon: 'box',
    path: '/nested/n/(articles/list)'
  },
  {
    dev: true,
    text: 'Stock',
    icon: 'material-icons dashboard',
    path: 'stock'
  }
];
