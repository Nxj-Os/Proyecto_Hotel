# Proyecto_Hotel

Sistema hotelero (Eclipse Suites) para el curso de Herramientas de Desarrollo.

El **backend** (Spring Boot + H2) sirve la API REST y, además, los archivos estáticos del
**frontend**, por lo que **todo se ejecuta con un solo comando en una sola terminal**.

---

## Requisitos

- **JDK 21** (verifica con `java -version`)
- No necesitas instalar Maven: se usa el wrapper incluido (`mvnw` / `mvnw.cmd`).

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
| Consola H2 | http://localhost:8080/h2-console |

Para detener el servidor: `Ctrl + C`.

### Consola H2 (opcional)

- JDBC URL: `jdbc:h2:mem:testdb`
- Usuario: `sa`
- Contraseña: (vacía)

---

## Usuario de prueba

| Correo | Contraseña |
|---|---|
| `demo@hotel.com` | `demo123` |

También puedes crear tu propia cuenta desde **Crear cuenta** (se guarda en la base de datos).

---

## Funcionalidades

- **Registro** (`registro.html`): crea el usuario en la base de datos vía `POST /api/usuarios`.
- **Inicio de sesión** (`iniciar-sesion.html`): valida credenciales vía `POST /api/usuarios/login`.
- **Reservas** (`reservar.html`): carga las habitaciones desde la API y crea la reserva
  vía `POST /api/reservas`, asociándola al usuario (lo crea si no existe).

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
    ├── *.html
    ├── css/
    ├── js/
    └── img/
```

> La conexión frontend ↔ backend se logra con `spring.web.resources.static-locations`
> en `backend/src/main/resources/application.properties`, que expone la carpeta
> `frontend/` como recursos estáticos del servidor.
