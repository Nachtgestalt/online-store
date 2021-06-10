export interface IProduct {
    id: number;
    companyId: number,
    setupId: number,
    cod: string;
    cod_barras: string;
    name: string;
    amount: number;
    category: string;
    image: string;
    price: number;
    marca: string;
    pvp: number;
    discount: number;
    subtotal?: number;
    total?: number;
    price_type?: string;
}
