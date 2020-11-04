import { Injectable } from '@angular/core';

export class StockCategory {
    id: number;
    stockName: string;
}

const stockCategories: StockCategory[] = [{
    id: 1,
    stockName: 'Produits Finis'
}, {
    id: 2,
    stockName: 'Prévisionnels'
}, {
    id: 3,
    stockName: 'Entrepôts BWS'
}];

@Injectable({
  providedIn: 'root',
})
export class StockService {
    getStockCategories(): StockCategory[] {
        return stockCategories;
    }
}
