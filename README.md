# Eleven Academy - App de Captación de Clientes

Plataforma completa para captar, gestionar y automatizar la comunicación con jugadores y agentes para Eleven Academy.

## 🚀 Instalación Rápida

### Paso 1: Instalar dependencias

```bash
npm install
```

### Paso 2: Iniciar el servidor

```bash
npm start
```

El servidor se abrirá en: **http://localhost:3000**

> ✅ El servidor debe estar **siempre corriendo** para que Mailchimp funcione.

---

## ⚙️ Configuración de Mailchimp

### Obtener credenciales de Mailchimp (GRATIS)

1. **Crea cuenta gratis en:** https://mailchimp.com
   - 500 contactos
   - 1,000 envíos/mes gratis
   - Sin tarjeta de crédito

2. **Obtén tu API Key:**
   - Accede a Settings → Account & billing → Extras → API keys
   - Copia la API Key

3. **Obtén el Server Prefix:**
   - Está al final de tu API Key
   - Ejemplo: `xxxxxxxx-**us21**` → servidor es `us21`

4. **Obtén tu Audience ID (List ID):**
   - Ve a Audience → Settings → Audience name and campaign defaults
   - Copia el Audience ID

5. **En la app:**
   - Ve a **Configuración**
   - Pega los datos en:
     - API Key
     - Server Prefix
     - Audience / List ID
   - Haz clic en **"Guardar y Probar Conexión"**

---

## 📋 Características Actuales

### Dashboard
- Métricas de leads, emails, conversión
- Gráficos de distribución por país y programa
- Trend de captación mensual

### Prospector / Buscador de Contactos
- **60+ contactos pre-cargados:**
  - Academias de fútbol en España e internacionales
  - Colegios e institutos (para contactar padres)
  - Los 7 agentes africanos reales
  - Federaciones deportivas
  - Clubes juveniles
- Filtros por país, categoría, región
- Búsqueda en tiempo real
- Acciones por contacto:
  - Agregar a CRM
  - Enviar email
  - Sincronizar a Mailchimp

### CRM de Leads
- Vista tabla + Kanban
- 5 etapas: Nuevo → Contactado → Interesado → Negociación → Inscrito
- Crear/editar/eliminar leads
- Sincronizar con Mailchimp

### Emails Pre-hechos
- **7 emails B2C en español** (secuencia de captación)
- **3 emails B2B en inglés** (para agentes africanos)
- Editor de emails con variables
- Envío individual vía mailto
- Copia al portapapeles

### Integración Mailchimp
- ✅ Configuración de API
- ✅ Probar conexión
- ✅ Agregar contacto individual
- ✅ Sincronizar leads del CRM en bloque
- ✅ Crear tags
- ✅ Ver estadísticas de audiencia
- ✅ Historial de actividad

### Catálogo de Programas
- Todos los programas con precios reales (EUR)
- Trial 1 semana → Programa Anual
- Detalles de alojamiento Standard vs VIP
- Generar propuestas comerciales

### Configuración
- Datos de Mailchimp
- API Key de Anthropic (futuro)
- Email remitente
- Tema claro/oscuro
- Exportar/Importar datos JSON
- Resetear base de datos

---

## 💾 Datos y Persistencia

Todos los datos se guardan **automáticamente** en localStorage (tu navegador):
- Leads
- Configuración
- Historial de emails
- Tags de Mailchimp

**Para hacer backup:**
- Configuración → Exportar JSON
- Guarda el archivo

**Para restaurar:**
- Configuración → Importar JSON
- Selecciona el archivo

---

## 📧 Usando los Emails

### Opción 1: Envío Individual (Recomendado para ahora)
1. Ve a **Emails de Captación**
2. Elige el email que deseas
3. Completa las variables ([Nombre], etc)
4. Haz clic en **"Copiar"**
5. Pega en tu cliente de email y envía

### Opción 2: Sincronizar a Mailchimp (Futuro)
Una vez Mailchimp esté completamente integrado:
1. Selectiona leads en el CRM
2. Haz clic en "Enviar Secuencia"
3. Elige los 7 emails
4. Se enviarán automáticamente en horarios escalonados

---

## 🔄 Flujo de Trabajo Típico

1. **Prosperar:**
   - Abre **Prospector**
   - Busca contactos por país/categoría
   - Haz clic en **"Agregar a CRM"**

2. **Gestionar:**
   - Ve a **CRM**
   - Edita detalles del lead
   - Mueve por el pipeline

3. **Comunicar:**
   - Ve a **Emails**
   - Copia el email
   - Envía desde tu email personal o Mailchimp

4. **Sincronizar (opcional):**
   - En **Mailchimp**, haz clic en "Sincronizar Leads"
   - Los contactos se agregan con tags automáticos

---

## 🆘 Troubleshooting

### "Error: servidor no iniciado"
```bash
# Verifica que el servidor esté corriendo:
npm start

# Debe mostrar:
# ✓ Servidor corriendo en http://localhost:3000
```

### "Error de conexión con Mailchimp"
- Verifica tu API Key (Settings → Account & billing → API keys)
- Verifica el Server Prefix (está en tu API Key)
- Verifica el Audience ID
- Haz clic en "Guardar y Probar Conexión"

### Datos desaparecieron
- Los datos están en localStorage
- Si limpiaste el navegador, se pierden
- Usa **Exportar JSON** regularmente como backup

### App lenta o no carga
- Abre las Developer Tools (F12)
- Ve a Console y busca errores rojos
- Reinicia el servidor: Ctrl+C en la terminal, luego `npm start`

---

## 📱 Acceso Remoto (Futuro)

Actualmente la app funciona **solo localmente**. Para acceso remoto, necesitarás:
- Railway.app (hosting gratuito)
- Vercel (hosting gratuito)
- Render.com (hosting gratuito)

Te guiaré cuando necesites expandir.

---

## 📝 Próximas Actualizaciones

- [ ] Integración con WhatsApp Business API
- [ ] Generador de mensajes con IA (Anthropic)
- [ ] Automatización de secuencias de emails
- [ ] Webhooks de Zapier para leads de formularios
- [ ] Dashboard avanzado con predicciones
- [ ] Mobile app (PWA)

---

## 👨‍💻 Soporte

Si tienes problemas:
1. Abre F12 (Developer Tools)
2. Ve a Console y copia el error
3. Contacta y comparte la captura

---

**Eleven Academy** © 2026 | Vilanova i la Geltrú, Barcelona
