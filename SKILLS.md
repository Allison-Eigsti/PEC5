 SKILLS.md — Prompts y técnicas reutilizables (ejemplo)

### Habilidades y *prompts* que he usado con la IA durante el proyecto. Sirven para reproducir el
proceso y demostrar comprensión.

Prompt Inicial: "Necesito crear un marketplace minimalista de ropa de segunda mano (full-stack) utilizando React, Node.js, Express, MongoDB y Mongoose. Ayúdame a definir el modelo de datos mínimo y las operaciones CRUD necesarias sin añadir complejidad innecesaria."

Ejemplo de un para tomar decisiones importants sobre la arquitectura: "Subiré todo el proyecto a Vercel para alojar la API y desplegar el frontend allí. Quiero usar `multer`; ¿instalas tú los paquetes npm necesarios (como `multer` y `bcryptjs`) o debo hacerlo yo? Todas las reglas de autenticación me parecen bien. ¿Debería crear un subesquema para las imágenes o no es necesario? También me gusta la idea de la eliminación lógica (soft delete) marcando el elemento como oculto, en lugar de borrar realmente la información de la base de datos. Usa `react-router-dom` para el enrutamiento del frontend. Además, el frontend debe ser totalmente responsivo. En cuanto a las decisiones tomadas, usar JWT en una cookie de tipo *HTTP-only* es una buena opción. El límite de 1 a 5 imágenes por anuncio es perfecto. Prefiero la eliminación lógica frente a la permanente."

## Técnicas
- Pedir el código por partes pequeñas y revisarlas antes de integrarlas.
- Pedir a la IA que explique el código que genera.
- Verificar siempre con pruebas (`.http` / Postman) antes de dar algo por bueno.

## Qué NO delego a la IA
- Decidir el modelo de datos final y la estructura del proyecto.
- Revisar la seguridad de las variables de entorno.
- Probar la app y validar que funciona de verdad.