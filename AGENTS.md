# AGENTS.md — Instrucciones para la IA

Contexto y reglas que se le dan a las herramientas de IA (asistentes de código) para trabajar
en este proyecto de forma coherente.

## Proyecto (Query inicial para OpenCode)
Crear un marketplace minimalista de ropa de segunda mano (full-stack) utilizando React, Node.js, Express, MongoDB y Mongoose. Definir el modelo de datos mínimo y las operaciones CRUD necesarias sin añadir complejidad innecesaria. Monorepo con dos carpetas: `backend/` y `frontend/`.

## Stack y convenciones
- **Backend:** Node.js + Express + Mongoose (MongoDB Atlas).
- **Frontend:** React (Vite) + Tailwind CSS.
- Nomenclatura: `camelCase` (variables/funciones), `PascalCase` (componentes),
  `kebab-case` (archivos), `UPPER_SNAKE_CASE` (variables de entorno).
- Respuestas de la API siempre en **JSON**; gestionar errores con middlewares **404** y **500**.
- Nada de claves en el código: usar `.env` (y mantener `.env.example`).

## Comandos
```bash
# backend
cd backend && npm install && npm run dev
# frontend
cd frontend && npm install && npm run dev
```

## Reglas para la IA
- Propón cambios pequeños y explica qué haces.
- No inventes endpoints o campos fuera del modelo definido en `PLAN.md`.
- Añade comentarios donde el código no sea evidente.
- Todo lo que generes debe poder ejecutarse y será revisado y probado por el alumno.
- Explica brevemente las decisiones importantes y las alternativas cuando sea relevante.
- No ocultes errores ni asumas que el código funciona: indica qué debe comprobarse o probarse.
- Prioriza soluciones sencillas y coherentes con la estructura y tecnologías ya utilizadas en el proyecto.
- No modifiques código existente que no esté relacionado con la tarea solicitada.