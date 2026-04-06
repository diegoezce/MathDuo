# 🚀 Quick Start: Deploy a Railway en 5 minutos

## Checklist pre-deploy

- [ ] Cuenta en [railway.app](https://railway.app)
- [ ] Repositorio Git sincronizado
- [ ] Acceso a Google OAuth (cliente ID & secret) - OPCIONAL

## Paso 1: Conectar repo (2 min)

1. Ve a [railway.app](https://railway.app)
2. Click "Create New Project"
3. "Deploy from GitHub"
4. Conecta tu cuenta GitHub y selecciona el repo

## Paso 2: Agregar PostgreSQL (1 min)

1. En tu proyecto Railway
2. Click "Add Service" → "Database" → "PostgreSQL"
3. Railway genera `DATABASE_URL` automáticamente ✨

## Paso 3: Variables de entorno (1 min)

Copia estas en el dashboard de Railway (Settings → Variables):

```
SESSION_SECRET=generar-algo-aleatorio-como-abc123xyz789

NODE_ENV=production

LOG_LEVEL=info
```

**Si usas Google OAuth:**
```
GOOGLE_CLIENT_ID=tu-id-aqui
GOOGLE_CLIENT_SECRET=tu-secret-aqui
```

## Paso 4: Deploy (1 min)

1. Click "Deploy" en el dashboard
2. O simplemente haz `git push` - Railway lo detecta automáticamente
3. Espera a que aparezca ✅ "Deployment successful"

## ¡Listo! 🎉

Tu API está viva en: `https://your-app-name.railway.app`

### Verificar que funciona:

```bash
curl https://your-app-name.railway.app/api/lessons
```

---

## Troubleshooting en 30 segundos

| Problema | Solución |
|----------|----------|
| Error "DATABASE_URL" | Agrega PostgreSQL service |
| Error "PORT required" | Railway lo provee automáticamente, reinicia deploy |
| Build muy lento | Normal primera vez (30-60s), luego caché lo acelera |
| Servidor no inicia | Revisa logs con: `railway logs --tail` |

---

## Documentación completa

Lee `RAILWAY_DEPLOYMENT.md` para:
- Configuración avanzada
- Custom domains
- Monitoreo y logs
- Rollback y historial
