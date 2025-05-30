require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Habilitar CORS para todas las rutas
app.use(cors());
app.use(express.json());

// Variable global para almacenar los últimos datos
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

// Array para mantener el historial de datos 0717
let history0717 = [];

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Ruta para obtener los últimos datos
app.get('/api/wits-data', (req, res) => {
    const response = {
        ...lastDataMap,
        history0717: history0717
    };
    console.log('GET /api/wits-data - Enviando datos con historial');
    res.json(response);
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
        // Para 0717, mantenemos un historial
        if (data.code === '0717') {
            const value = Number(data.value);
            if (!isNaN(value)) {
                // Añadir al inicio del historial
                history0717.unshift({
                    value: value,
                    timestamp: Date.now()
                });
                // Mantener solo los últimos 8 valores
                history0717 = history0717.slice(0, 8);
                
                // Actualizar el último valor en lastDataMap
                lastDataMap['0717'] = data;
                console.log('Nuevo dato 0717 agregado al historial:', value);
            }
        } else {
            // Para otros códigos, actualizamos normalmente
            lastDataMap[data.code] = data;
            console.log('Datos actualizados para código:', data.code);
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
