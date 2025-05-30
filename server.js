require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Habilitar CORS para todas las rutas
app.use(cors());
app.use(express.json());

// Variables globales para almacenar los datos
let lastDataMap = {
    '0713': null,
    '0715': null,
    '0732': null,
    '0731': null,
    '0717': null,
    '0716': null,
    '0736': null,
    '0737': null
};

// Variable para controlar cuándo fue la última actualización real de 0717
let last0717Update = null;

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Ruta para obtener los últimos datos
app.get('/api/wits-data', (req, res) => {
    // Creamos una copia del mapa de datos
    const responseData = { ...lastDataMap };
    
    // Solo incluimos 0717 si ha habido una actualización real
    if (!last0717Update) {
        responseData['0717'] = null;
    }
    
    res.json(responseData);
});

// Ruta para recibir datos (protegida con API key)
app.post('/api/wits-data', (req, res) => {
    console.log('POST /api/wits-data - headers:', req.headers);
    console.log('POST /api/wits-data - body:', req.body);
    
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
    console.log('API key recibida:', apiKey);
    console.log('API key esperada:', process.env.API_KEY);
    console.log('¿Son iguales?', apiKey === process.env.API_KEY);
    
    if (!apiKey) {
        console.log('No se recibió API key');
        return res.status(401).json({ error: 'API key no proporcionada' });
    }
    
    if (apiKey !== process.env.API_KEY) {
        console.log('API key no coincide');
        console.log('Longitud recibida:', apiKey.length);
        console.log('Longitud esperada:', process.env.API_KEY.length);
        return res.status(401).json({ error: 'API key inválida' });
    }

    // Validar que los datos sean del formato correcto
    const data = req.body;
    if (!data || !data.code || !data.value) {
        console.log('Datos inválidos:', data);
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    // Actualizar el mapa de datos si el código es uno de los que nos interesa
    if (['0713', '0715', '0732', '0731', '0717', '0716', '0736', '0737'].includes(data.code)) {
        if (data.code === '0717') {
            // Siempre actualizamos cuando recibimos un nuevo POST de 0717
            // ya que esto significa que el peripheral sender envió un nuevo dato
            lastDataMap['0717'] = data;
            last0717Update = Date.now();
            console.log('Nuevo dato 0717 recibido del peripheral sender:', data.value);
        } else {
            // Para otros códigos, actualizamos normalmente
            lastDataMap[data.code] = data;
        }
    }

    res.json({ status: 'ok', data: lastDataMap });
});

// Servir archivos estáticos desde la carpeta public
app.use(express.static('public'));

// Ruta catch-all para SPA
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
    console.log(`API_KEY configurada: ${process.env.API_KEY ? 'Sí' : 'No'}`);
});
