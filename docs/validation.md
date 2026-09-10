# Verificación del corte 1–3

Verificado el 9 de septiembre de 2026.

| Comprobación | Resultado |
| --- | --- |
| npm install y package-lock.json | 726 paquetes instalados en una copia local temporal |
| npm run build | Correcto: ocho aplicaciones NestJS y frontend React/Vite, incluido chequeo TypeScript del frontend |
| npm run lint | Correcto |
| npm test | 3 suites, 7 pruebas correctas: configuración, seguridad y mensajería |
| npm run test:integration | 1 prueba HTTP correcta; salud disponible y login aún inexistente |
| Docker Compose config | Correcto en configuración base y con override de desarrollo |
| Caddy validate | Correcto para proxy local, servidor estático y dominio con HTTPS automático |
| git diff --check | Sin errores de whitespace |
| docker compose up --build | No ejecutado: este equipo no tiene Docker Engine/Desktop disponible |

## Entorno y límites

La instalación inicial de dependencias en G: (Google Drive) devolvió errores de escritura UNKNOWN/EBADF/EPERM. Para comprobar el código se sincronizó una copia en `%TEMP%/greenalert-validation`, se instalaron dependencias allí y se ejecutaron los comandos npm sobre esa misma versión final. El lockfile validado se copió al repositorio.

Persisten residuos de `node_modules` incompleto en la unidad sincronizada: dos intentos de limpieza encontraron directorios que Google Drive no permitió eliminar. Están ignorados por Git y Docker y no se consideran una instalación utilizable. Utilizar una copia en disco local y `npm ci` para desarrollo. No se modificó la configuración global del sistema ni se instaló Docker.

Docker Compose y Caddy se descargaron como herramientas temporales para validar sintaxis/configuración; eso no prueba la ejecución de MongoDB, RabbitMQ ni las imágenes. La conexión real al broker, los permisos efectivos de MongoDB, la reconexión ante caída y la emisión real de certificados quedan por comprobar con un motor Docker. CI incluye el arranque del conjunto, pero no se ha ejecutado desde esta sesión.

Los tests de mensajería usan un canal simulado y comprueban confirmación de publicación, ack tras éxito y nack sin requeue para errores. No sustituyen una prueba con RabbitMQ real.

No se ha implementado ni iniciado la etapa 4 ni la etapa 5.
