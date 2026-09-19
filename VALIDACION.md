# Validación de SANA MK2

Revisión: 18 de septiembre de 2026.

- `npm run build`: correcto, sin errores de TypeScript ni advertencias de metadatos. Next.js 16.3.5, App Router.
- `npm test`: 6 pruebas correctas. Orden, duplicados, validación de enlaces, ausencia de credenciales, caché, concurrencia, llegada de nuevas entradas y recuperación de la última copia ante fallo.
- Vista de escritorio y viewport móvil 390 × 844 inspeccionados en navegador. Sin desbordamiento horizontal ni imágenes locales rotas en la inspección.
- Cronología: cambio de 2026 a 2015 comprobado.
- Galería: filtro Escenario devuelve 2 fotos; visor, foto siguiente y cierre comprobados.
- Menú móvil: apertura, navegación y cierre comprobados.
- Scroll: el cambio de la escena editorial a la de escenario altera realmente la imagen, la escala y la opacidad. La fotografía anterior queda con opacidad 0 y la activa con opacidad 1.
- Instagram: perfil público inspeccionado el 18/09/2026 a las 05:29 UTC. Las tres primeras publicaciones visibles son DdYG0Klj8dd, DdQLIJbDwp6 y DdOu2TRD7fJ. `/api/instagram` devuelve 3 publicaciones y `unconfigured` sin credenciales; no afirma conexión en directo.
- Videos: los enlaces de G-DRAGON y Mood Indigo se verificaron mediante YouTube oEmbed y corresponden a 117 y TWICE. El modal abre el reproductor, pero YouTube no permitió reproducir G-DRAGON incrustado en este navegador. Se conserva el enlace directo al video original.

Pendiente de verificación externa: consulta real a Meta con credenciales del administrador. Las pruebas de su flujo utilizan respuestas controladas; no equivalen a una sincronización real. No se ha desplegado MK2 en un dominio público.
