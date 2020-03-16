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
      }
    ]
  },
  {
    text: 'Tiers',
    icon: 'user',
    items: [
      {
        text: 'Clients',
        path: '/tiers/clients'
      }, {
        text: 'Fournisseurs',
        path: '/tiers/fournisseurs'
      }, {
        text: 'Transporteurs',
        path: '/tiers/transporteurs'
      }
    ]
  }
];
