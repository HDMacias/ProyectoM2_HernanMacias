# Blog API – Authors & Posts

API REST desarrollada con **Node.js + Express + PostgreSQL** que permite gestionar autores y posts.

---

## Descripción del proyecto

Servicio backend tipo JSONPlaceholder que expone endpoints CRUD para dos entidades relacionadas:

- **authors**: usuarios que escriben posts.
- **posts**: artículos vinculados a un author mediante FK.

La aplicación usa consultas SQL directas con el driver `pg`, manejo centralizado de errores, validaciones básicas y respuestas con códigos HTTP adecuados.

---

## Estructura del repositorio

```
blog-api/
├── src/
│   ├── app.js                  # Configuración de Express
│   ├── server.js               # Entry point (listen)
│   ├── db/
│   │   └── pool.js             # Conexión a PostgreSQL con pg.Pool
│   ├── routes/
│   │   ├── authors.routes.js   # Rutas /authors
│   │   └── posts.routes.js     # Rutas /posts
│   ├── services/
│   │   ├── authors.service.js  # Queries SQL de authors
│   │   └── posts.service.js    # Queries SQL de posts
│   └── middlewares/
│       └── errorHandler.js     # Middleware global de errores
├── tests/
│   ├── authors.test.js         # Tests con supertest (authors)
│   └── posts.test.js           # Tests con supertest (posts)
├── scripts/
│   └── setup.sql               # Crea tablas e inserta datos de ejemplo
├── docs/
│   └── openapi.yaml            # Documentación OpenAPI 3.0
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

---

## Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

---

## Cómo ejecutar localmente

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/blog-api.git
cd blog-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales reales:

```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/blog_db
PORT=3000
NODE_ENV=development
```

### 4. Crear la base de datos

```bash
# Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE blog_db;"
```

### 5. Ejecutar el script SQL (tablas + seed)

```bash
psql -U postgres -d blog_db -f scripts/setup.sql
```

Verifica que las tablas se crearon:

```bash
psql -U postgres -d blog_db -c "\dt"
psql -U postgres -d blog_db -c "SELECT * FROM authors;"
psql -U postgres -d blog_db -c "SELECT * FROM posts;"
```

### 6. Iniciar el servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor queda disponible en `http://localhost:3000`.

### 7. Verificar que funciona

```bash
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"..."}

curl http://localhost:3000/authors
# → [ { "id": 1, "name": "Ana García", ... }, ... ]
```

---

## Endpoints disponibles

### Authors

| Método | Ruta            | Descripción            |
|--------|-----------------|------------------------|
| GET    | /authors        | Listar todos           |
| GET    | /authors/:id    | Obtener uno por ID     |
| POST   | /authors        | Crear author           |
| PUT    | /authors/:id    | Actualizar author      |
| DELETE | /authors/:id    | Eliminar author        |

### Posts

| Método | Ruta                      | Descripción                          |
|--------|---------------------------|--------------------------------------|
| GET    | /posts                    | Listar todos (con datos del author)  |
| GET    | /posts/:id                | Obtener uno por ID                   |
| GET    | /posts/author/:authorId   | Posts de un author con su detalle    |
| POST   | /posts                    | Crear post                           |
| PUT    | /posts/:id                | Actualizar post                      |
| DELETE | /posts/:id                | Eliminar post                        |

### Ejemplos de uso con curl

```bash
# Crear author
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Luis Torres", "email": "luis@example.com", "bio": "Dev backend"}'

# Obtener posts de un author
curl http://localhost:3000/posts/author/1

# Crear post
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Nuevo post", "content": "Contenido del post", "author_id": 1}'

# Eliminar author
curl -X DELETE http://localhost:3000/authors/1
```

---

## Cómo ejecutar los tests

Los tests usan **Jest + supertest** y mockean el pool de base de datos, por lo que **no necesitan una BD real**.

```bash
# Ejecutar todos los tests
npm test

# Ver cobertura
npm run test:coverage
```

Los tests cubren:
- Listar, obtener, crear, actualizar y eliminar authors
- Listar, obtener, crear y eliminar posts
- Validaciones de campos obligatorios
- Respuestas 404 para recursos inexistentes
- Manejo de email duplicado (constraint 23505)
- Manejo de FK inválida (constraint 23503)

---

## Documentación OpenAPI

El archivo `docs/openapi.yaml` contiene la especificación completa de la API.

### Ver con Swagger UI (sin instalar nada)

1. Ir a [https://editor.swagger.io](https://editor.swagger.io)
2. Pegar el contenido de `docs/openapi.yaml`

### Ver con Swagger UI localmente

```bash
npx @redocly/cli preview-docs docs/openapi.yaml
```

---

## Deployment en Railway

### Paso 1: Preparar el repositorio

```bash
git init
git add .
git commit -m "feat: initial API implementation"
git remote add origin https://github.com/tu-usuario/blog-api.git
git push -u origin main
```



### Paso 2: Crear el proyecto en Railway

1. Ir a [https://railway.app](https://railway.app) e iniciar sesión con GitHub.
2. Click en **New Project** → **Deploy from GitHub repo**.
3. Seleccionar el repositorio `blog-api`.

### Paso 3: Agregar PostgreSQL

1. En el dashboard del proyecto, click en **+ New** → **Database** → **PostgreSQL**.
2. Railway crea la base de datos automáticamente.

### Paso 4: Configurar variables de entorno

En el servicio de la API (no en la DB), ir a **Variables** y agregar:

| Variable       | Valor                                              |
|----------------|---------------------------------------------------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (variable interna Railway) |
| `NODE_ENV`     | `production`                                      |
| `PORT`         | `3000`                                            |

> Railway inyecta `${{Postgres.DATABASE_URL}}` automáticamente si usas la referencia interna.

### Paso 5: Ejecutar el script SQL en producción

1. En el servicio PostgreSQL en Railway, ir a la pestaña **Connect**.
2. Copiar la **Public URL** de conexión.
3. Ejecutar localmente:

```bash
psql "postgresql://postgres:password@host.railway.app:PORT/railway" -f scripts/setup.sql
```

O usar el **Query Editor** en Railway para pegar y ejecutar el contenido de `scripts/setup.sql`.

### Paso 6: Deploy

Railway detecta los cambios en `main` y hace deploy automáticamente. También puedes forzarlo:

```bash
git push origin main
```

### Paso 7: Verificar en producción

```bash
curl https://tu-app.up.railway.app/health
curl https://tu-app.up.railway.app/authors
```

### URLs Railway

- **Internal URL**: `http://blog-api.railway.internal:3000` (para comunicación entre servicios en Railway)
- **Public URL**: `https://proyectom2hernanmacias-production.up.railway.app` (acceso externo)

---

## Variables de entorno

| Variable       | Requerida | Descripción                                |
|----------------|-----------|--------------------------------------------|
| `DATABASE_URL` | ✅ Sí     | URL de conexión a PostgreSQL               |
| `PORT`         | ❌ No     | Puerto del servidor (default: 3000)        |
| `NODE_ENV`     | ❌ No     | `development` o `production`               |

---

## Registro de uso de IA

Durante el desarrollo de este proyecto se utilizó **Claude (Anthropic)** como herramienta de asistencia.

### Prompts utilizados y su influencia

| # | Prompt resumido | Influencia en el desarrollo |
|---|----------------|----------------------------|
| 1 | *"Ayúdame a estructurar un proyecto Node.js + Express + PostgreSQL con rutas, servicios y middlewares separados"* | Definió la arquitectura de carpetas: `routes/`, `services/`, `db/`, `middlewares/`. |
| 2 | *"Genera el CRUD completo para authors y posts usando pg con consultas parametrizadas"* | Generó los archivos `authors.service.js` y `posts.service.js` con queries `$1, $2` para evitar SQL injection. |
| 3 | *"Escribe tests con supertest y Jest que mockeen el pool de pg para no necesitar base de datos real"* | Generó `authors.test.js` y `posts.test.js` usando `jest.mock('../src/db/pool')`. |
| 4 | *"Genera el archivo openapi.yaml completo para esta API con schemas, responses reutilizables y ejemplos"* | Produjo `docs/openapi.yaml` con la especificación completa. |
| 5 | *"Escribe el README con guía de ejecución local, tests, OpenAPI y deployment en Railway paso a paso"* | Estructura y contenido de este README. |

### Revisión crítica

Todos los fragmentos de código generados por IA fueron **revisados, probados y ajustados** manualmente:
- Se corrigió el orden de rutas en `posts.routes.js` para que `/posts/author/:authorId` no colisione con `/posts/:id`.
- Se ajustó el manejo de `COALESCE` en los `UPDATE` para permitir actualizaciones parciales.
- Se verificaron los códigos de error de PostgreSQL (`23505`, `23503`) en los catch de las rutas.
