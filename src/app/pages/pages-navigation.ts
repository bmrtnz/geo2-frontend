export const navigation = [
    {
        text: "Ordres de commande",
        icon: "material-icons euro_symbol",
        path: "pages/ordres",
    },
    {
        html: "<i class=\"dx-icon dx-icon-user\"></i><div>Tiers</div><div class=\"countTiers toValidate-indicator display-none\"></div>",
        items: [
            {
                html: "<div>Clients</div><div class=\"countClient toValidate-indicator display-none\"></div>",
                path: "pages/nested/n/(tiers/clients/list)",
            },
            {
                html: "<div>Fournisseurs</div><div class=\"countFournisseur toValidate-indicator display-none\"></div>",
                path: "pages/nested/n/(tiers/fournisseurs/list)",
            },
            {
                html: "<div>Transporteurs</div><div class=\"countTransporteur toValidate-indicator display-none\"></div>",
                path: "pages/nested/n/(tiers/transporteurs/list)",
            },
            {
                html: "<div>Passages à quai</div><div class=\"countLieuPassageAQuai toValidate-indicator display-none\"></div>",
                path: "pages/nested/n/(tiers/lieux-passage-a-quai/list)",
            },
        ],
    },
    {
        /* tslint:disable-next-line max-line-length */
        html: "<i class=\"dx-icon dx-icon-box\"></i><div>Articles</div><div class=\"countArticle toValidate-indicator display-none\"></div>",
        path: "pages/nested/n/(articles/list)",
    },
    {
        dev: true,
        text: "Stock",
        icon: "material-icons dashboard",
        path: "pages/stock",
    },
];
