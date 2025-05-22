# COM2 Web Service

Servicio web para mostrar datos del puerto COM2 con código 0113.

## Configuración

1. Crear archivo `.env` con:
```
PORT=3001
API_KEY=your-secret-api-key-here
```

2. Instalar dependencias:
```
npm install
```

3. Iniciar el servidor:
```
npm start
```

## Endpoints

- `GET /api/wits-data`: Obtener los últimos datos recibidos
- `POST /api/wits-data`: Enviar nuevos datos (requiere API key en header `x-api-key`)

## Despliegue en Render

1. Conectar repositorio a Render
2. Configurar como "Web Service"
3. Agregar variable de entorno `API_KEY`
4. Build Command: `npm install`
5. Start Command: `npm start`
