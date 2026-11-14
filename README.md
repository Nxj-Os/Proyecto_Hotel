# Proyecto_Hotel

Sistema hotelero (Eclipse Suites) para el curso de Herramientas de Desarrollo.

El **backend** (Spring Boot + PostgreSQL) sirve la API REST y, además, los archivos estáticos del
**frontend**, por lo que **todo se ejecuta con un solo comando en una sola terminal**.

---

## Requisitos

- **JDK 21** (verifica con `java -version`)
- **PostgreSQL** en ejecución (por defecto en `localhost:5432`) y **pgAdmin** para administrarlo.
- No necesitas instalar Maven: se usa el wrapper incluido (`mvnw` / `mvnw.cmd`).

---

## Base de datos (PostgreSQL + pgAdmin)

1. Abre pgAdmin y conéctate al servidor local (host `localhost`, puerto `5432`, usuario `postgres`).
2. Crea la base de datos `hotel_db` (Owner: `postgres`). En el **Query Tool**:

   ```sql
   CREATE DATABASE hotel_db WITH OWNER = postgres ENCODING = 'UTF8';
   ```

3. Las tablas (`usuarios`, `habitaciones`, `reservas`) las crea Hibernate automáticamente
   (`ddl-auto=update`) la primera vez que arranca la aplicación.

Configuración de conexión usada en `backend/src/main/resources/application.properties`:

| Parámetro | Valor |
|---|---|
| URL | `jdbc:postgresql://localhost:5432/hotel_db` |
| Usuario | `postgres` |
| Contraseña | `postgres` |

> Si tus credenciales son distintas, edita ese archivo o define la variable de entorno
> `SPRING_DATASOURCE_PASSWORD`.

---

## Ejecutar (un solo comando)

Desde la carpeta `backend`:

**Windows (PowerShell / CMD):**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**
```bash
cd backend
./mvnw spring-boot:run
```

Luego abre en el navegador:

| Recurso | URL |
|---|---|
| Aplicación web (frontend) | http://localhost:8080 |
| API REST | http://localhost:8080/api |

Para detener el servidor: `Ctrl + C`.

### Ver datos en pgAdmin

En pgAdmin, refresca `hotel_db → Schemas → public → Tables` y consulta las tablas:

```sql
SELECT * FROM usuarios;
SELECT * FROM habitaciones;
SELECT r.id, u.email, h.numero, r.fecha_inicio, r.fecha_fin, r.estado
FROM reservas r
JOIN usuarios u ON u.id = r.usuario_id
JOIN habitaciones h ON h.id = r.habitacion_id;
```

---

## Usuario de prueba

| Correo | Contraseña |
|---|---|
| `demo@hotel.com` | `demo123` |

También puedes crear tu propia cuenta desde **Crear cuenta** (se guarda en la base de datos).

---

## Funcionalidades

- **Registro** (`registro.html`): crea el usuario en la base de datos vía `POST /api/usuarios`
  e inicia sesión automáticamente.
- **Inicio de sesión** (`iniciar-sesion.html`): valida credenciales vía `POST /api/usuarios/login`
  y permite recordar la sesión.
- **Mi Perfil** (`perfil.html`): muestra los datos del usuario creado y el historial de sus
  reservas consultando la API.
- **Reservas** (`reservar.html`): carga las habitaciones disponibles desde la API y crea la
  reserva vía `POST /api/reservas`, asociándola al usuario (lo crea si no existe).
- **Cerrar sesión**: disponible desde la barra de navegación y desde el perfil.

---

## Endpoints de la API

### Usuarios — `/api/usuarios`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Listar usuarios |
| GET | `/api/usuarios/{id}` | Buscar por id |
| GET | `/api/usuarios/email/{email}` | Buscar por email |
| POST | `/api/usuarios` | Crear usuario (409 si el email existe) |
| POST | `/api/usuarios/login` | Iniciar sesión (401 si credenciales inválidas) |
| PUT | `/api/usuarios/{id}` | Actualizar |
| DELETE | `/api/usuarios/{id}` | Eliminar |

### Habitaciones — `/api/habitaciones`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/habitaciones` | Listar todas |
| GET | `/api/habitaciones/disponibles` | Solo disponibles |
| GET | `/api/habitaciones/{id}` | Buscar por id |
| POST | `/api/habitaciones` | Crear |
| PUT | `/api/habitaciones/{id}` | Actualizar |
| DELETE | `/api/habitaciones/{id}` | Eliminar |

### Reservas — `/api/reservas`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/reservas` | Listar todas |
| GET | `/api/reservas/{id}` | Buscar por id |
| GET | `/api/reservas/usuario/{usuarioId}` | Reservas de un usuario |
| POST | `/api/reservas` | Crear reserva |
| PUT | `/api/reservas/{id}` | Actualizar |
| DELETE | `/api/reservas/{id}` | Eliminar |

---

## Estructura del proyecto

```
Proyecto_Hotel/
├── backend/    Spring Boot (API REST + sirve el frontend)
│   └── src/main/resources/application.properties
└── frontend/   HTML + CSS + JavaScript (vanilla)
    ├── index.html, habitaciones.html, reservar.html
    ├── registro.html, iniciar-sesion.html, perfil.html
    ├── css/
    ├── js/
    └── img/
```

> La conexión frontend ↔ backend se logra con `spring.web.resources.static-locations`
> en `backend/src/main/resources/application.properties`, que expone la carpeta
> `frontend/` como recursos estáticos del servidor.
