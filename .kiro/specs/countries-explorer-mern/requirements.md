# Requirements Document

## Introduction

Countries Explorer es una aplicación web full-stack construida con el stack MERN (MongoDB, Express, React, Node.js). La aplicación consume la API pública de RestCountries para obtener datos de países en tiempo real, los presenta visualmente con bandera, nombre, población y región, y ofrece funcionalidades de búsqueda en tiempo real, eliminación de países, y generación de PDFs individuales y generales. El proyecto se despliega en Railway con control de versiones en GitHub.

## Glossary

- **Frontend**: Aplicación React que se ejecuta en el navegador del usuario.
- **Backend**: Servidor Node.js/Express que actúa como intermediario entre el Frontend y la API externa.
- **RestCountries_API**: API pública externa `https://restcountries.com/v3.1/all?fields=name,capital,population,region,flags` que provee datos de países.
- **Country_Card**: Componente visual del Frontend que muestra la bandera, nombre, población y región de un país.
- **Search_Bar**: Componente del Frontend que permite al usuario ingresar texto para filtrar países.
- **PDF_Generator**: Módulo del Backend responsable de crear documentos PDF con datos de países.
- **Country_Store**: Estado global del Frontend que mantiene la lista de países activos (no eliminados).
- **Railway**: Plataforma de despliegue en la nube donde se alojan tanto el Frontend como el Backend.
- **GitHub_Repository**: Repositorio remoto de control de versiones donde se almacena el código fuente.

---

## Requirements

### Requirement 1: Obtención de datos de países desde la API externa

**User Story:** Como usuario, quiero ver una lista actualizada de países con sus datos, para explorar información geográfica en tiempo real.

#### Acceptance Criteria

1. WHEN el Backend recibe una solicitud GET en el endpoint `/api/countries`, THE Backend SHALL consultar la RestCountries_API y retornar la respuesta con los campos `name`, `capital`, `population`, `region` y `flags`.
2. IF la RestCountries_API no responde en 10 segundos, THEN THE Backend SHALL retornar un error HTTP 504 con el mensaje `"External API timeout"`.
3. IF la RestCountries_API retorna un código de error HTTP (4xx o 5xx), THEN THE Backend SHALL retornar un error HTTP 502 con el mensaje `"External API error"`.
4. THE Backend SHALL exponer el endpoint `/api/countries` bajo el método HTTP GET.

---

### Requirement 2: Visualización de países en el Frontend

**User Story:** Como usuario, quiero ver cada país representado visualmente con su bandera, nombre, población y región, para identificar y explorar países fácilmente.

#### Acceptance Criteria

1. WHEN el Frontend carga exitosamente los datos del Backend, THE Frontend SHALL renderizar un Country_Card por cada país recibido.
2. THE Country_Card SHALL mostrar la imagen de la bandera del país usando la URL provista en el campo `flags.svg` o `flags.png`.
3. THE Country_Card SHALL mostrar el nombre oficial del país usando el campo `name.common`.
4. THE Country_Card SHALL mostrar la población del país formateada con separadores de miles.
5. THE Country_Card SHALL mostrar la región del país.
6. IF el Frontend no puede obtener datos del Backend, THEN THE Frontend SHALL mostrar un mensaje de error visible al usuario con el texto `"No se pudieron cargar los países. Intente nuevamente."`.
7. WHILE los datos están siendo cargados desde el Backend, THE Frontend SHALL mostrar un indicador visual de carga (spinner o skeleton).

---

### Requirement 3: Búsqueda en tiempo real de países

**User Story:** Como usuario, quiero buscar países por nombre mientras escribo, para encontrar rápidamente el país que me interesa sin recargar la página.

#### Acceptance Criteria

1. THE Frontend SHALL incluir una Search_Bar visible en la parte superior de la lista de países.
2. WHEN el usuario ingresa texto en la Search_Bar, THE Frontend SHALL filtrar los Country_Cards visibles para mostrar únicamente los países cuyo `name.common` contenga el texto ingresado, sin distinción de mayúsculas o minúsculas.
3. WHEN el usuario borra el texto de la Search_Bar, THE Frontend SHALL restaurar la visualización de todos los países no eliminados del Country_Store.
4. THE Frontend SHALL aplicar el filtro de búsqueda en menos de 100ms desde el último carácter ingresado por el usuario.
5. IF la búsqueda no produce resultados, THEN THE Frontend SHALL mostrar el mensaje `"No se encontraron países con ese nombre."`.

---

### Requirement 4: Eliminación de países

**User Story:** Como usuario, quiero eliminar países de la lista visible, para personalizar mi vista y enfocarse en los países de interés.

#### Acceptance Criteria

1. THE Country_Card SHALL incluir un botón de eliminación claramente identificable (ícono o texto "Eliminar").
2. WHEN el usuario hace clic en el botón de eliminación de un Country_Card, THE Frontend SHALL remover ese país del Country_Store y actualizar la lista visible sin recargar la página.
3. WHEN un país es eliminado del Country_Store, THE Frontend SHALL mantener eliminado ese país durante toda la sesión activa del usuario.
4. THE Frontend SHALL incluir un botón "Restaurar países" que, WHEN el usuario lo activa, THE Frontend SHALL repoblar el Country_Store con todos los países originalmente obtenidos del Backend.
5. IF el Country_Store queda vacío después de eliminar países, THEN THE Frontend SHALL mostrar el mensaje `"No hay países para mostrar. Restaura la lista para continuar."`.

---

### Requirement 5: Generación de PDF individual por país

**User Story:** Como usuario, quiero descargar un PDF con la información de un país específico, para tener un reporte imprimible de ese país.

#### Acceptance Criteria

1. THE Country_Card SHALL incluir un botón "Descargar PDF" visible para cada país.
2. WHEN el usuario hace clic en "Descargar PDF" de un Country_Card, THE Frontend SHALL enviar una solicitud POST al Backend en el endpoint `/api/countries/pdf/single` con los datos del país seleccionado.
3. WHEN el Backend recibe una solicitud POST válida en `/api/countries/pdf/single`, THE PDF_Generator SHALL crear un documento PDF que incluya la bandera, nombre, capital, población y región del país.
4. THE Backend SHALL retornar el PDF generado como respuesta binaria con el header `Content-Type: application/pdf`.
5. WHEN el Frontend recibe el PDF del Backend, THE Frontend SHALL iniciar la descarga automática del archivo con el nombre `{nombre-del-pais}.pdf`.
6. IF el Backend recibe una solicitud POST en `/api/countries/pdf/single` con datos de país incompletos o inválidos, THEN THE Backend SHALL retornar un error HTTP 400 con el mensaje `"Datos de país inválidos o incompletos"`.

---

### Requirement 6: Generación de PDF general con todos los países

**User Story:** Como usuario, quiero descargar un PDF con la información de todos los países visibles, para tener un reporte completo de la lista actual.

#### Acceptance Criteria

1. THE Frontend SHALL incluir un botón "Descargar PDF General" visible fuera de los Country_Cards, accesible desde la vista principal.
2. WHEN el usuario hace clic en "Descargar PDF General", THE Frontend SHALL enviar una solicitud POST al Backend en el endpoint `/api/countries/pdf/all` con la lista completa de países actualmente visibles en el Country_Store.
3. WHEN el Backend recibe una solicitud POST válida en `/api/countries/pdf/all`, THE PDF_Generator SHALL crear un documento PDF que incluya una entrada por cada país con su bandera, nombre, capital, población y región.
4. THE Backend SHALL retornar el PDF generado como respuesta binaria con el header `Content-Type: application/pdf`.
5. WHEN el Frontend recibe el PDF del Backend, THE Frontend SHALL iniciar la descarga automática del archivo con el nombre `countries-report.pdf`.
6. IF el Backend recibe una solicitud POST en `/api/countries/pdf/all` con una lista vacía de países, THEN THE Backend SHALL retornar un error HTTP 400 con el mensaje `"La lista de países está vacía"`.

---

### Requirement 7: Estructura del proyecto y control de versiones con GitHub

**User Story:** Como desarrollador, quiero que el proyecto esté organizado en un repositorio GitHub con una estrategia de ramas definida, para mantener un flujo de trabajo ordenado y seguro en producción.

#### Acceptance Criteria

1. THE GitHub_Repository SHALL contener dos directorios raíz: `frontend/` para el código React y `backend/` para el código Node.js/Express.
2. THE GitHub_Repository SHALL mantener una rama `main` que represente el estado de producción del proyecto.
3. THE GitHub_Repository SHALL mantener una rama `develop` desde la cual se deriven las ramas de funcionalidades.
4. WHEN se desarrolla una nueva funcionalidad, THE GitHub_Repository SHALL utilizar ramas con el prefijo `feature/` derivadas de `develop`.
5. WHEN una funcionalidad está lista, THE GitHub_Repository SHALL integrar la rama `feature/` en `develop` mediante un Pull Request antes de fusionar en `main`.
6. THE GitHub_Repository SHALL incluir un archivo `.gitignore` que excluya `node_modules/`, archivos `.env` y artefactos de build.

---

### Requirement 8: Despliegue en Railway

**User Story:** Como desarrollador, quiero desplegar tanto el Frontend como el Backend en Railway en modo producción, para que la aplicación sea accesible públicamente.

#### Acceptance Criteria

1. THE Backend SHALL ser desplegado como un servicio independiente en Railway, expuesto en un puerto configurado mediante la variable de entorno `PORT`.
2. THE Frontend SHALL ser desplegado como un servicio independiente en Railway, configurado para servir el build de producción de React.
3. THE Backend SHALL leer la URL de la RestCountries_API desde una variable de entorno `RESTCOUNTRIES_URL` configurada en Railway.
4. THE Frontend SHALL leer la URL base del Backend desde una variable de entorno `REACT_APP_API_URL` (o `VITE_API_URL` si se usa Vite) configurada en Railway.
5. WHEN el Backend es desplegado en Railway, THE Backend SHALL responder con HTTP 200 en el endpoint `/health` para confirmar que el servicio está activo.
6. WHERE el entorno de despliegue es producción, THE Frontend SHALL servir los archivos estáticos del build optimizado de React, sin exponer código fuente ni herramientas de desarrollo.
