export const navigation = [
  {
    text: 'Home',
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
    text: 'Articles',
    icon: 'box',
    path: '/nested/n/(articles/list)'
  },
  {
    text: 'Stock',
    icon: 'material-icons dashboard',
    path: 'stock'
  }
];
