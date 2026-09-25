import type { ICategoria } from "./ICategoria.js";
export interface IProduct {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    activo: boolean;
    imagenUrl: string;
    categoria: ICategoria;
}
//# sourceMappingURL=IProduct.d.ts.map