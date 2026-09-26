# Plan de datos

## Objetivo
Mini aplicación fullstack de venta de ropa de segunda mano (CRUD completo) creada con apoyo de IA,
para demostrar el uso crítico de estas herramientas.

## Alcance
- Una entidad principal: Listings (para cada prenda).
- CRUD completo desde la interfaz (crear, listar, editar, completar, eliminar).
- Backend Node + Express + MongoDB (Atlas). Frontend React. Despliegue en Vercel.
- Cloudinary para almanecer imagenes.

## Modelo de datos (Listing)

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| seller | ObjectId | sí | Referencia al usuario propietario (`User`). |
| title | String | sí | Título del anuncio. Máximo 120 caracteres. |
| description | String | no | Descripción opcional. Por defecto `""`. Máximo 3000 caracteres. |
| priceCents | Number | sí | Precio entero no negativo almacenado en centavos. |
| category | String | sí | `tops` \| `bottoms` \| `dresses` \| `outerwear` \| `shoes` \| `accessories`. |
| size | String | sí | Talla o descripción corta de la talla. Máximo 30 caracteres. |
| condition | String | sí | `new` \| `excellent` \| `good` \| `fair`. |
| images | Array[Image] | sí | Entre 1 y 5 imágenes almacenadas en Cloudinary. |
| status | String | no | `available` \| `sold` \| `hidden`. Por defecto `available`. `hidden` representa la eliminación lógica. |
| createdAt | Date | no | Automático. Indica cuándo se creó el anuncio. |
| updatedAt | Date | no | Automático. Indica la última actualización. |

### Submodelo de imagen (`Image`)

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| publicId | String | sí | Identificador del recurso en Cloudinary. |
| secureUrl | String | sí | URL segura de la imagen alojada en Cloudinary. |

MongoDB solo almacena los metadatos de las imágenes. Los archivos binarios se envían a Cloudinary y no se guardan en la base de datos.
