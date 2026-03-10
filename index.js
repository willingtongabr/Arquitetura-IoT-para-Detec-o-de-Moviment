const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

/* ============================
   SWAGGER CONFIG
============================ */

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'IoT Movement API',
    version: '2.0.0',
    description: 'API para recebimento de alertas Edge do ESP32'
  },
  paths: {
    '/': {
      get: {
        summary: 'Status da API',
        responses: {
          '200': {
            description: 'API funcionando'
          }
        }
      }
    },
    '/data': {
      post: {
        summary: 'Recebe alerta do dispositivo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  device_id: { type: 'string' },
                  timestamp: { type: 'number' },
                  Movimento: { type: 'string' },
                  total_por_minuto: { type: 'number' }
                },
                required: ['device_id', 'timestamp', 'Movimento']
              },
              example: {
                device_id: 'esp32-01',
                timestamp: 1700000000,
                Movimento: 'ALERTA_MOVIMENTO_ALTO',
                total_por_minuto: 35
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Alerta salvo'
          }
        }
      }
    },
    '/data': {
      get: {
        summary: 'Lista últimos alertas',
        responses: {
          '200': {
            description: 'Lista retornada'
          }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'iot_db',
  password: 'postgres',
  port: 5433,
});


app.get('/', (req, res) => {
  res.json({ message: 'API is running 🚀' });
});

/* -------- POST ALERTA -------- */

app.post('/data', async (req, res) => {
  const { device_id, Movimento, timestamp, total_por_minuto } = req.body;

  try {
    await pool.query(
      `INSERT INTO movements 
       (device_id, movimento, total_por_minuto, event_time)
       VALUES ($1, $2, $3, to_timestamp($4))`,
      [
        device_id,
        Movimento,
        total_por_minuto || 0,
        timestamp
      ]
    );

    res.json({ status: 'saved in database' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'database error' });
  }
});

/* -------- GET ÚLTIMOS ALERTAS -------- */

app.get('/data', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT device_id,
              movimento,
              total_por_minuto,
              event_time
       FROM movements
       ORDER BY event_time DESC
       LIMIT 50`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs on http://localhost:${port}/api-docs`);
});