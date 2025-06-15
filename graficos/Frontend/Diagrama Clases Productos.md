```mermaid
classDiagram
    direction LR

    class GestionProductosPage {
        -productos: Producto[]
        -categorias: Categoria[]
        +fetchInitialData(): void
        +handleSubmit(): void
        +handleDelete(): void
    }

    class GestionCategoriasPage {
        -categorias: Categoria[]
        +fetchCategorias(): void
        +handleSubmit(): void
        +handleDelete(): void
    }

    class ProductService {
        +getProductos(): Promise~Producto[]~
        +createProducto(data): Promise~Producto~
        +updateProducto(id, data): Promise~Producto~
        +deleteProducto(id): Promise~void~
    }

    class CategoryService {
        +getCategorias(): Promise~Categoria[]~
        +createCategoria(data): Promise~Categoria~
        +updateCategoria(id, data): Promise~Categoria~
        +deleteCategoria(id): Promise~void~
    }

    class ProductosAPI {
        +get(url): Promise~AxiosResponse~
        +post(url, data): Promise~AxiosResponse~
        +put(url, data): Promise~AxiosResponse~
        +delete(url): Promise~AxiosResponse~
    }

    class Producto {
        +id: number
        +nombre: string
        +descripcion: string
        +precio_por_unidad: number
        +stock: number
    }

    class Categoria {
        +id: number
        +nombre: string
        +descripcion: string
    }

    GestionProductosPage ..> ProductService
    GestionProductosPage ..> CategoryService
    GestionCategoriasPage ..> CategoryService
    ProductService ..> ProductosAPI
    CategoryService ..> ProductosAPI

    Producto "1..*" -- "1" Categoria : pertenece a
```