# POS Moles Chabelita SV — versión app (PWA)

## Archivos
| Archivo | Para qué sirve |
|---|---|
| `index.html` | La app (tu POS, con las mejoras) |
| `manifest.json` | Nombre, ícono y colores de la app instalada |
| `sw.js` | Permite que la app abra sin internet |
| `icons/` | Íconos de la app (puedes reemplazarlos por tu logo, mismos nombres y tamaños) |
| `apps-script/Codigo.gs` | Tu Apps Script completo + lo nuevo del POS (login, ventas, resúmenes) |

## 0. Actualizar el Apps Script (hazlo ANTES de usar la app nueva)
1. Abre tu Google Sheet → **Extensiones → Apps Script**.
2. Borra todo el código y pega el contenido de `apps-script/Codigo.gs`.
   Lo que ya tenías (catálogo, login de clientes, administración de usuarios) queda **igual**; solo se agregó una sección al final y la columna GRANEL a los productos.
3. Guarda (💾). Arriba, en el selector de funciones, elige **`prepararHojasPOS`** y presiona **▶ Ejecutar**.
   Google te pedirá permisos la primera vez: *Revisar permisos → tu cuenta → Configuración avanzada → Ir a (proyecto) → Permitir*.
   Esto crea las hojas `VENTAS`, `VENTAS_DETALLE`, `RESUMEN_PRODUCTOS`, `RESUMEN_DIARIO` y `RESUMEN_VENDEDORES`.
4. **Implementar → Administrar implementaciones → ✏️ (editar) → Versión: "Nueva versión" → Implementar.**
   ⚠️ No uses "Nueva implementación", porque cambia la URL. Si la URL que aparece no es la misma que está en `index.html` (`API_URL`), copia la nueva en esa línea.

### Usuarios del POS
Se usan los de la hoja **USUARIOS** que ya tienes. Para dar acceso a alguien, agrega un renglón:

| ID | USUARIO | PASSWORD | NOMBRE | TIPO | ACTIVO |
|---|---|---|---|---|---|
| 5 | maria | (su contraseña) | María López | cajero | SI |

- **TIPO** puede ser `admin`, `cajero` o `vendedor`. Los de tipo `cliente` **no** pueden entrar al POS.
- Para quitarle el acceso a alguien pon `ACTIVO = NO`. Sus ventas pendientes de subir se rechazan y la app le pide entrar de nuevo.
- USUARIO puede ser un correo o un nombre corto (`maria`); así es como se escribe al entrar.

### Qué se guarda en Google Sheets
- **VENTAS**: una fila por venta (folio, fecha, hora, dispositivo, quién atendió, cliente, método, total, cuánto fue en efectivo y cuánto en transferencia/tarjeta, cambio...).
- **VENTAS_DETALLE**: una fila por producto vendido.
- **RESUMEN_PRODUCTOS**: total vendido de cada producto (cantidad e importe), de mayor a menor. Se actualiza solo.
- **RESUMEN_DIARIO**: lo mismo, separado por día.
- **RESUMEN_VENDEDORES**: ventas y dinero por día y por persona (efectivo vs transferencia/tarjeta, útil para el corte de caja).
- El stock **no** se modifica.

## 1. Publicarla (gratis, una sola vez)
Una PWA tiene que estar en internet con **https**. Lo más fácil es GitHub Pages:

1. Crea una cuenta en github.com y un repositorio nuevo **público** (por ejemplo `pos-chabelita`).
2. En el repositorio: **Add file → Upload files** y arrastra *todo el contenido* de esta carpeta (incluida la carpeta `icons`).
3. Ve a **Settings → Pages**, en *Branch* elige `main` y `/ (root)`, y guarda.
4. En 1–2 minutos queda en: `https://TU-USUARIO.github.io/pos-chabelita/`

> Alternativa: netlify.com → "Deploy manually" → arrastra la carpeta.

## 2. Instalarla en el celular
- **Android (Chrome):** abre el link → menú ⋮ → **Instalar app** (o "Agregar a pantalla de inicio").
- **iPhone (Safari):** abre el link → botón Compartir → **Agregar a inicio**.

## 3. Imprimir en impresora térmica
Al cobrar aparece el botón **🖨️ Imprimir ticket** y un selector de papel (58 mm u 80 mm; se recuerda).
El ticket para imprimir se genera en blanco y negro puro, al ancho exacto del papel.

**En Android (impresora Bluetooth o USB):**
1. Instala **RawBT** desde la Play Store y en ella conecta tu impresora (Bluetooth, USB o red).
2. En el POS toca **Imprimir ticket** → se abre el menú Compartir → elige **RawBT** → imprime.

**En la PC (Windows) con impresora térmica USB:**
1. Instala el driver de la impresora para que aparezca en Windows.
2. Toca **Imprimir ticket** → en el diálogo elige la térmica, *Márgenes: ninguno*, y desactiva "Encabezados y pies de página".

**iPhone:** solo imprime a impresoras compatibles con AirPrint; la mayoría de las térmicas Bluetooth baratas no lo son.

## 4. Cuando hagas cambios
Sube el `index.html` nuevo a GitHub **y** abre `sw.js` y cambia `const VERSION = 'pos-v1'` por `'pos-v2'` (luego v3, etc.).
Así los teléfonos detectan la versión nueva. Puede que necesites cerrar y abrir la app dos veces.

## Uso diario
- **Iniciar sesión:** usuario y contraseña. Con *Recordarme* la sesión queda abierta en ese dispositivo y Chrome ofrece guardar la contraseña, que luego rellena solo (en Android incluso con la huella). Si se cambia de cajero, se usa **👤 Nombre → Cambiar usuario**; los usuarios recordados aparecen como botones.
- **Sin internet:** se puede vender igual. Las ventas quedan en el teléfono (indicador naranja "☁️ N pendientes") y se suben solas cuando regresa la señal. También puede entrar sin internet quien ya haya iniciado sesión antes en ese dispositivo con *Recordarme*.
- **Código de dispositivo:** cada teléfono genera uno (por ejemplo `K2`) que va en el folio: `V-K2-20261027-001`. Puedes cambiarlo en **👤 → Ajustes** a algo fácil de reconocer (por ejemplo `CAJA`, `TEL1`).
- **Venta por importe (granel):** en el ticket, los productos a granel tienen el importe en un cuadro verde editable. Escribe lo que pide el cliente (ej. `10`) y los kilos se calculan solos; se cobra exactamente ese importe. Si cambias los kilos o usas − / +, se vuelve a calcular el importe normal.
- **Ventas anteriores:** las ventas hechas con la versión anterior no se suben solas; en **Ajustes** aparece un botón para subirlas.

## Cambios respecto a tu versión original
- **Fecha local:** las ventas después de las 6 pm ya no se registran con el día siguiente (antes se usaba hora UTC). Las ventas viejas del historial también se reagrupan con la fecha correcta.
- **Folios:** ya no se brincan números al abrir o recargar; el folio solo se usa al confirmar el cobro.
- **Ticket mixto:** ahora muestra cuánto se pagó en efectivo y cuánto en transferencia/tarjeta.
- **Nombres largos** en el ticket se recortan según el espacio real, sin encimarse con la cantidad.

- **Usuarios, envío a Google Sheets y código de dispositivo** (ver arriba). El ticket muestra quién atendió.

## Seguridad: qué conviene saber
- Las contraseñas están escritas tal cual en la hoja USUARIOS (así ya funcionaba tu sistema). Comparte esa hoja solo con quien deba administrarla.
- El POS manda la contraseña por POST (no queda en la URL). El teléfono **no guarda la contraseña**, solo una huella cifrada para poder entrar sin internet, y una "llave" de sesión que dura 180 días.
