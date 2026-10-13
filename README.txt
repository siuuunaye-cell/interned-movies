INTERNED MOVIES — INSTRUCCIONES

Qué hace este proyecto:
- Carga automáticamente películas populares, series, anime, portadas, sinopsis, puntuaciones y reparto desde TMDB.
- Permite buscar títulos y ver fichas de detalle.
- Reproduce los tráileres de YouTube dentro de la ficha usando un reproductor integrado (YouTube no debe abrirse como página separada).
- Diseño adaptable a celulares.

IMPORTANTE:
1. Este catálogo NO contiene los archivos de las películas completas. La información de una película no es lo mismo que tener permiso para transmitirla.
2. Para reproducir películas completas, agregá únicamente videos que tengas derecho a distribuir, por ejemplo contenido propio, de dominio público o con licencia.
3. TMDB exige atribución y sus términos distinguen el uso no comercial del comercial. Revisá https://developer.themoviedb.org/docs/faq antes de publicar o monetizar.
4. La app muestra esta atribución en la sección de configuración/aviso del sitio: “This product uses the TMDB API but is not endorsed or certified by TMDB.”
5. La API Key se guarda en el navegador del dispositivo. Para un sitio público real, es más seguro mover las llamadas a un backend y no publicar una clave privada.

CÓMO USARLO DESDE EL CELULAR:
1. Extraé el ZIP en tu teléfono o subí los archivos a un repositorio GitHub.
2. Para publicarlo gratis como sitio: en GitHub, abrí el repositorio → Settings → Pages → Deploy from a branch → elegí main y /root → Save.
3. Abrí el sitio publicado. Tocá el engranaje ⚙.
4. Creá una cuenta en https://www.themoviedb.org/ y solicitá una API Key en https://www.themoviedb.org/settings/api.
5. Pegá la API Key v3 en INTERNED MOVIES y tocá “Guardar y cargar catálogo”.

Nota: TMDB indica que la solicitud de API no está optimizada para móviles; si te cuesta desde Android, probá en Chrome con “Sitio para computadora”.

Archivos:
- index.html: estructura de la app.
- style.css: diseño visual.
- app.js: llamadas a la API y funcionamiento.


CONEXIÓN CON SUPABASE (persistencia en la nube)
1. app.js ya está preparado con la URL del proyecto y la clave PUBLICABLE.
2. En Supabase > SQL Editor, ejecutá el contenido de SUPABASE_POLICIES.sql.
3. En Supabase > Authentication > Users, creá un usuario con tu email y contraseña. No uses claves secretas en el sitio.
4. Subí index.html, app.js, style.css y SUPABASE_POLICIES.sql (el SQL solo se ejecuta en Supabase) al repositorio GitHub, reemplazando los archivos anteriores.
5. Abrí tu sitio publicado, tocá Admin, iniciá sesión con el usuario que creaste y agregá títulos y enlaces autorizados.
6. Las películas se guardan en Supabase y se muestran a todos los visitantes. La sesión de administrador se mantiene solo en esa pestaña/sesión.

IMPORTANTE:
- La clave publicable puede estar en el frontend; nunca publiques una sb_secret_ ni service_role.
- Las políticas permiten escribir a cualquier usuario autenticado de Supabase. Por eso no crees cuentas para visitantes; creá solo tu cuenta de administrador.
- Los enlaces de video deben ser de contenido propio, de dominio público o que tengas permiso para distribuir.
- El catálogo TMDB continúa funcionando aparte; Supabase guarda las películas que agregás manualmente.
