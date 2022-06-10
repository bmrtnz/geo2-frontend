import { Field, Model, ModelName } from "./model";
import { ArticleMatierePremiere } from "./article-matiere-premiere.model";
import { ArticleCahierDesCharges } from "./article-cahier-des-charges.model";
import { ArticleNormalisation } from "./article-normalisation.model";
import { ArticleEmballage } from "./article-emballage.model";
import Historique from "./historique.model";
import Document from "./document.model";

@ModelName("Article")
export class Article extends Model {
    @Field({ asKey: true }) public id: string;
    @Field() public articleAssocie: string;
    @Field({ model: import("./article-matiere-premiere.model") })
    public matierePremiere: ArticleMatierePremiere;
    @Field({ asLabel: true }) public description: string;
    @Field() public blueWhaleStock: boolean;
    @Field({ model: import("./article-cahier-des-charges.model") })
    public cahierDesCharge: ArticleCahierDesCharges;
    @Field({ model: import("./article-normalisation.model") })
    public normalisation: ArticleNormalisation;
    @Field() public valide: boolean;
    @Field() public preSaisie: boolean;
    @Field() public gtinColisBlueWhale: string;
    @Field() public gtinUcBlueWhale: string;
    @Field({ model: import("./article-emballage.model") })
    public emballage: ArticleEmballage;
    @Field({ model: import("./historique.model") })
    public historique: Historique[];
    @Field({ model: import("./document.model") })
    public document: Document;
}

export default Article;
