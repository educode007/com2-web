require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Habilitar CORS para todas las rutas
app.use(cors());
app.use(express.json());

// Variable global para almacenar los últimos datos
let lastData = null;

// Servir archivos estáticos desde la carpeta public
app.use(express.static('public'));

// Ruta para obtener los últimos datos
app.get('/api/wits-data', (req, res) => {
    if (lastData) {
        res.json(lastData);
    } else {
        res.status(404).json({ error: 'No hay datos disponibles' });
    }
});

// Ruta para recibir datos (protegida con API key)
app.post('/api/wits-data', (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'API key inválida' });
    }

    lastData = req.body;
    console.log('Datos recibidos:', lastData);
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
