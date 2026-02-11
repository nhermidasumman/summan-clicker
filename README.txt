PLEASE READ: INSTRUCCIONES PARA EJECUTAR Y COMPARTIR EL JUEGO
=========================================================

Este paquete contiene todo lo necesario para ejecutar "Summan Clicker" en tu red local.

CÓMO EJECUTAR EL JUEGO:
-----------------------
1. Haz doble clic en el archivo `run_game.bat`.
2. Se abrirá una ventana negra (terminal). NO LA CIERRES mientras quieras que el juego esté activo.
3. El juego se abrirá automáticamente o podrás acceder yendo a: http://localhost:8000

CÓMO COMPARTIR EN LA RED (LAN):
-------------------------------
Para que tus compañeros de trabajo jueguen desde sus computadoras o celulares:

1. Asegúrate de que tu computadora y la de ellos estén en la misma red Wi-Fi o cableada.
2. Necesitas saber tu "Dirección IP Local". 
   - La ventana negra del servidor te la mostrará al iniciarse, algo como: `http://192.168.1.XX:8000`
   - O abre CMD y escribe `ipconfig` para ver tu dirección IPv4.
3. Comparte ese enlace (ej. `http://192.168.1.45:8000`) con tus compañeros.
4. ¡Ellos podrán entrar desde cualquier navegador moderno!

NOTA: Es posible que el Firewall de Windows te pida permiso la primera vez. Dale a "Permitir" para redes privadas/domésticas.

ARCHIVOS IMPORTANTES:
- run_game.bat: El lanzador.
- main.py: El servidor (no tocar).
- static/ y templates/: Los archivos del juego.
