# Deployment a Railway

## Configuración previa

Este proyecto está listo para deployarse en Railway. Hemos creado los archivos de configuración necesarios:

- `railway.json` - Configuración del build y deploy
- `.railwayignore` - Archivos a ignorar en el deploy
- `.env.railway.example` - Variables de entorno requeridas

## Pasos para deployar

### 1. Preparar Railway CLI (opcional pero recomendado)

```bash
npm install -g @railway/cli
railway login
```

### 2. Crear el proyecto en Railway

Opción A: Via web dashboard
- Ve a [railway.app](https://railway.app)
- Crea un nuevo proyecto
- Conecta tu repositorio Git

Opción B: Via CLI
```bash
railway init
```

### 3. Agregar PostgreSQL

En el dashboard de Railway:
1. Click en "Add Service"
2. Selecciona "Database"
3. Elige PostgreSQL

Railway automáticamente:
- Provisionará una base de datos
- Generará una URL de conexión
- La asignará a la variable de entorno `DATABASE_URL`

### 4. Configurar variables de entorno

En el dashboard o via CLI, agrega estas variables:

**Requeridas:**
```
SESSION_SECRET=tu-secreto-aleatorio-aqui
NODE_ENV=production
```

**Opcionales (solo si usas Google OAuth):**
```
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
```

### 5. Deploy

**Via web dashboard:**
- El deploy se dispara automáticamente cuando haces push a tu rama
- Railway ejecutará los comandos en `railway.json`

**Via CLI:**
```bash
railway up
```

## Detalles del build

Railway ejecutará estos comandos en orden:

1. **Instalación**: `pnpm install`
2. **Build**: `pnpm run build` (ejecuta typecheck y compila todo)
3. **Start**: `pnpm --filter @workspace/api-server run start`

## Monitoreo

- Logs en tiempo real: En el dashboard o `railway logs`
- Métricas: Dashboard muestra CPU, memoria, requests
- Reintentos: Configurado para reintentar en caso de fallos

## Solución de problemas

### El deploy falla en build

**Problema**: "PORT environment variable is required"
- **Solución**: Railway lo provee automáticamente, pero verifica que `NODE_ENV=production` esté configurado

**Problema**: "DATABASE_URL must be set"
- **Solución**: Conecta un servicio PostgreSQL a tu proyecto en Railway

### El servidor no inicia

1. Revisa los logs: `railway logs --tail`
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que PostgreSQL esté disponible

### Cambios no se despliegan

1. Verifica que hayas hecho push a la rama correcta
2. Accede al dashboard y dispara un redeploy manualmente
3. Railway by default despliega en cada push

## URLs y acceso

Una vez deployado:
- URL pública de la API: `https://your-app.railway.app`
- Bases de datos: Solo accesible desde tu aplicación (privada)
- Métricas: Dashboard de Railway

## Configuración de dominio personalizado

En el dashboard de Railway:
1. Ve a tu proyecto
2. Settings → Domains
3. Agrega tu dominio personalizado
4. Sigue las instrucciones de DNS

## Node.js Version

Este proyecto requiere **Node.js 24**. Railway automáticamente:
- Detecta el `package.json`
- Instala la versión de Node.js correcta via nixpacks

Si necesitas especificar la versión explícitamente, agrega a `railway.json`:
```json
"build": {
  "nixpacks": {
    "nodeVersion": "24"
  }
}
```

## Rollback

Si algo sale mal después del deploy:
1. Dashboard → Deployments
2. Selecciona una versión anterior
3. Click en "Redeploy"

## Costos

Railway es gratuito hasta ciertos límites:
- 500 horas/mes gratis de CPU
- Bases de datos incluidas
- Check [railway.app/pricing](https://railway.app/pricing) para más detalles
