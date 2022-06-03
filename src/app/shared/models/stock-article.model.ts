import { Field, Model, ModelName } from "./model";

@ModelName("StockArticle")
export class StockArticle extends Model {

    @Field({ asKey: true })
    id: string;

    @Field({ asLabel: true })
    articleDescription: string;

    @Field()
    bio: boolean;

    @Field()
    age: string;

    @Field()
    valide: boolean;

    @Field()
    especeID: string;

    @Field()
    varieteID: string;

    @Field()
    calibreFournisseurID: string;

    @Field()
    calibreMarquageID: string;

    @Field()
    categorieID: string;

    @Field()
    colisID: string;

    @Field()
    origineID: string;

    @Field()
    stockID: string;

    @Field()
    fournisseurCode: string;

    @Field()
    proprietaireCode: string;

    @Field()
    description: string;

    @Field({ dataType: "datetime" })
    dateFabrication: string;

    @Field()
    statut: string;

    @Field({ dataType: "datetime" })
    dateStatut: string;

    @Field()
    typePaletteID: string;

    @Field()
    quantiteInitiale1: number;

    @Field()
    quantiteRestante1: number;

    @Field()
    quantiteOptionnelle1: number;

    @Field()
    quantiteInitiale2: number;

    @Field()
    quantiteRestante2: number;

    @Field()
    quantiteOptionnelle2: number;

    @Field()
    quantiteInitiale3: number;

    @Field()
    quantiteRestante3: number;

    @Field()
    quantiteOptionnelle3: number;

    @Field()
    quantiteInitiale4: number;

    @Field()
    quantiteRestante4: number;

    @Field()
    quantiteOptionnelle4: number;
}

export default StockArticle;
