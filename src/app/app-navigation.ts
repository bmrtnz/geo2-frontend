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
    path: '/ordres'
  },
  {
    html: '<i class="dx-icon dx-icon-user"></i><div>Tiers</div><div class="countTiers toValidate-indicator display-none"></div>',
      items: [
      {
        html: '<div>Clients</div><div class="countClient toValidate-indicator display-none"></div>',
        path: '/nested/n/(tiers/clients/list)'
      }, {
        html: '<div>Fournisseurs</div><div class="countFournisseur toValidate-indicator display-none"></div>',
        path: '/nested/n/(tiers/fournisseurs/list)'
      }, {
        html: '<div>Transporteurs</div><div class="countTransporteur toValidate-indicator display-none"></div>',
        path: '/nested/n/(tiers/transporteurs/list)'
      } , {
        html: '<div>Passages à quai</div><div class="countLieuPassageAQuai toValidate-indicator display-none"></div>',
        path: '/nested/n/(tiers/lieux-passage-a-quai/list)',
      }
    ]
  },
  {
    html: '<i class="dx-icon dx-icon-box"></i><div>Articles</div><div class="countArticle toValidate-indicator display-none"></div>',
    path: '/nested/n/(articles/list)'
  },
  {
    dev: true,
    text: 'Stock',
    icon: 'material-icons dashboard',
    path: 'stock'
  }
];
