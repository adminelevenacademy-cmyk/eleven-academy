/**
 * Mailchimp Proxy Server - Eleven Academy
 * Ejecuta: npm install express cors dotenv
 * Luego: node server.js
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Variables globales para la API key
let mailchimpConfig = {
  apiKey: '',
  serverPrefix: '',
  audienceId: ''
};

// ============================================
// RUTAS DE CONFIGURACIÓN
// ============================================

// Guardar config de Mailchimp
app.post('/api/config/mailchimp', (req, res) => {
  const { apiKey, serverPrefix, audienceId } = req.body;

  if (!apiKey || !serverPrefix || !audienceId) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  mailchimpConfig = { apiKey, serverPrefix, audienceId };
  res.json({ success: true, message: 'Configuración guardada' });
});

// ============================================
// RUTAS DE MAILCHIMP
// ============================================

// Probar conexión con Mailchimp
app.get('/api/mailchimp/test', async (req, res) => {
  try {
    if (!mailchimpConfig.apiKey) {
      return res.status(400).json({ error: 'Mailchimp no configurado' });
    }

    const { serverPrefix, apiKey } = mailchimpConfig;
    const response = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (response.ok) {
      res.json({ success: true, data });
    } else {
      res.status(response.status).json({ error: data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas de la audiencia
app.get('/api/mailchimp/audience/:audienceId', async (req, res) => {
  try {
    if (!mailchimpConfig.apiKey) {
      return res.status(400).json({ error: 'Mailchimp no configurado' });
    }

    const { serverPrefix, apiKey } = mailchimpConfig;
    const { audienceId } = req.params;

    const response = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (response.ok) {
      res.json(data);
    } else {
      res.status(response.status).json({ error: data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar contacto a Mailchimp
app.post('/api/mailchimp/add-subscriber', async (req, res) => {
  try {
    if (!mailchimpConfig.apiKey) {
      return res.status(400).json({ error: 'Mailchimp no configurado' });
    }

    const { email, name, tags } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    const { serverPrefix, apiKey, audienceId } = mailchimpConfig;

    const subscriberData = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: name || ''
      },
      tags: tags || []
    };

    const response = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriberData)
      }
    );

    const data = await response.json();

    if (response.ok || response.status === 400) {
      res.json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear o actualizar tag en la audiencia
app.post('/api/mailchimp/create-tag', async (req, res) => {
  try {
    if (!mailchimpConfig.apiKey) {
      return res.status(400).json({ error: 'Mailchimp no configurado' });
    }

    const { tagName } = req.body;

    if (!tagName) {
      return res.status(400).json({ error: 'Nombre del tag requerido' });
    }

    const { serverPrefix, apiKey, audienceId } = mailchimpConfig;

    const response = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/segments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: tagName,
          options: {
            match: 'any'
          }
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      res.json(data);
    } else {
      res.status(response.status).json({ error: data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar tag a un miembro
app.post('/api/mailchimp/add-tag-to-member', async (req, res) => {
  try {
    if (!mailchimpConfig.apiKey) {
      return res.status(400).json({ error: 'Mailchimp no configurado' });
    }

    const { email, tags } = req.body;

    if (!email || !tags || tags.length === 0) {
      return res.status(400).json({ error: 'Email y tags requeridos' });
    }

    const { serverPrefix, apiKey, audienceId } = mailchimpConfig;

    // Crear hash MD5 del email (requerido por Mailchimp API)
    const crypto = require('crypto');
    const emailHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

    const response = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${emailHash}/tags`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tags: tags.map(tag => ({ name: tag, status: 'active' }))
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      res.json({ success: true });
    } else {
      res.status(response.status).json({ error: data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SERVIR ARCHIVOS ESTÁTICOS
// ============================================

app.use(express.static(__dirname));

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   ELEVEN ACADEMY - CAPTATION SERVER    ║
╚════════════════════════════════════════╝

✓ Servidor corriendo en http://localhost:${PORT}
✓ Abre en el navegador: http://localhost:${PORT}

Para detener: Ctrl+C
  `);
});
