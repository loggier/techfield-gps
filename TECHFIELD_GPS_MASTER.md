# TechField GPS — Master Spec Document
> Plataforma SaaS especializada para técnicos instaladores de GPS vehicular en LATAM  
> Desarrollado por **Vemontech** · RFC: VEM210712JH8 · García, Nuevo León, México  
> Versión: 1.0 · Fecha: Abril 2026

---

## Índice

1. [Visión del producto](#1-visión-del-producto)
2. [Modelo de negocio](#2-modelo-de-negocio)
3. [Tipos de usuario](#3-tipos-de-usuario)
4. [Flujos de registro](#4-flujos-de-registro)
5. [Módulos del sistema](#5-módulos-del-sistema)
6. [Gamificación y Activity Score](#6-gamificación-y-activity-score)
7. [Base de conocimiento](#7-base-de-conocimiento)
8. [Marketplace de técnicos](#8-marketplace-de-técnicos)
9. [Tienda de recompensas](#9-tienda-de-recompensas)
10. [Arquitectura técnica](#10-arquitectura-técnica)
11. [Modelo de datos — PostgreSQL](#11-modelo-de-datos--postgresql)
12. [UI/UX — Principios de diseño](#12-uiux--principios-de-diseño)
13. [PRD — Fase 1 (solo técnicos)](#13-prd--fase-1-solo-técnicos)
14. [PRD — Fase 2 (empresas y marketplace)](#14-prd--fase-2-empresas-y-marketplace)
15. [KPIs y gates de activación](#15-kpis-y-gates-de-activación)
16. [Estrategia LATAM y viabilidad](#16-estrategia-latam-y-viabilidad)
17. [Fuera del alcance por fase](#17-fuera-del-alcance-por-fase)

---

## 1. Visión del producto

### ¿Qué es TechField GPS?

Plataforma SaaS nicho 100% especializada en el flujo de trabajo de técnicos instaladores y de mantenimiento de rastreadores GPS vehiculares. No es una app genérica de field service (como Hubstaff, ServiceM8 o Connecteam) — es la única plataforma construida específicamente para el instalador de GPS.

### Problema que resuelve

| Usuario | Problema actual |
|---|---|
| Técnico independiente | Sin historial formal, sin evidencias, sin reputación verificable. Sus clientes no tienen comprobante de la instalación. |
| Empresa coordinadora | Sin herramienta para gestionar su equipo técnico, sin visibilidad, sin reportes, sin acceso a técnicos externos verificados. |
| Cliente final | No tiene forma de verificar si la instalación fue correcta, por quién y cuándo. |

### Propuesta de valor única

- **Para el técnico:** registro gratuito, historial profesional digital con evidencias, link público por OT para compartir con clientes, sistema de puntos canjeables por premios reales, base de conocimiento colaborativa.
- **Para la empresa:** gestión de equipo, mapa en tiempo real, reportes exportables, acceso al marketplace de técnicos verificados por zona usando créditos.
- **Diferenciador de mercado:** base de conocimiento propietaria (cortes de motor por marca/modelo/año, configuraciones de trackers, APNs por operadora) que se convierte en el activo más valioso a largo plazo.

---

## 2. Modelo de negocio

### Estrategia general — supply first

Construir masa crítica de técnicos activos **antes** de ofrecer el producto a empresas. Meta: 50 técnicos activos por zona geográfica → activar marketplace para empresas en esa zona. Modelo similar al de Uber con conductores antes de abrir a pasajeros.

### Dos tracks de usuario

#### Track A — Técnico independiente

- **Costo:** siempre gratis. Sin excepción. Sin límite de OTs.
- **Registro:** solo por referido (link único de otro técnico o empresa). No hay registro abierto.
- **No paga:** nunca. Ni en fase 1, ni en fase 2, ni en fase 3.
- **Sin requisito fiscal:** no se pide RFC ni CLABE en la fase inicial. El técnico solo da nombre, teléfono, zona y especialidad.

#### Track B — Empresa coordinadora

- **Costo:** suscripción mensual según plan.
- **Registro:** libre, sin referido. Trial gratuito 14 días sin tarjeta.
- **Planes:**

| Plan | Precio MXN/mes | Técnicos | Créditos marketplace incluidos |
|---|---|---|---|
| Starter | $199 | hasta 3 | 0 |
| Pro | $399 | hasta 10 | **10 créditos/mes gratis** |
| Business | $799 | ilimitados | **30 créditos/mes gratis** |

### Fuentes de ingreso (por fase)

#### Fase 1 — MVP técnicos (meses 1–4)
- Sin ingreso. Objetivo: construir la red.

#### Fase 2 — Empresas activas (meses 5–12)
- **Suscripciones mensuales** ($199/$399/$799 MXN)
- **Paquetes de créditos para marketplace:**
  - 10 créditos: $199 MXN ($19.9 c/u)
  - 30 créditos: $499 MXN ($16.6 c/u)
  - 100 créditos: $1,299 MXN ($12.9 c/u)
- Los créditos no expiran. Se usan para desbloquear datos de contacto de técnicos externos.

#### Fase 3 — Escala LATAM (mes 12+)
- Licenciamiento de la base de conocimiento a fabricantes de trackers y plataformas GPS
- White-label para plataformas GPS (WOX, Wialon, gpsscan.net, etc.)
- Escrow de pagos con comisión 8–10% (cuando la regulación y el volumen lo justifiquen)
- Alianza con aseguradoras: verificación de instalaciones para pólizas de flotillas

### Modelo fiscal de Vemontech

- Vemontech S.A.S. factura **suscripciones y créditos** como servicio de software (SaaS) con IVA 16% normal.
- **No toca** el pago entre empresa y técnico → no hay obligación de retenciones ISR/IVA de plataformas tecnológicas en esta fase.
- Si en fase futura se procesa escrow: consultar contador especializado en régimen de plataformas digitales (Art. 113-A/B/C LISR, Art. 18-J LIVA).

---

## 3. Tipos de usuario

### 3.1 Técnico independiente (`role: technician`)

Persona física que instala, revisa o da soporte a rastreadores GPS. Puede trabajar solo o para múltiples empresas simultáneamente. Su perfil y puntos son **portátiles** — no pertenecen a ninguna empresa.

**Especialidades posibles:**
- Instalación nueva
- Revisión / mantenimiento
- Soporte / diagnóstico
- Configuración de dispositivo
- Corte y reconexión de motor

### 3.2 Coordinador de empresa (`role: company_admin`)

Administrador del workspace de una empresa. Puede invitar técnicos a su equipo, crear y asignar OTs, ver el mapa y los reportes.

### 3.3 Técnico de empresa (`role: company_technician`)

Técnico vinculado a un workspace. Usa la misma app móvil que el técnico independiente. Sus OTs asignadas por la empresa aparecen en su historial global (salvo las marcadas como privadas por la empresa).

### 3.4 Admin de plataforma (`role: platform_admin`)

Equipo interno de Vemontech. Puede verificar técnicos, aprobar entradas de KB, gestionar reportes y ver métricas globales.

---

## 4. Flujos de registro

### 4.1 Técnico independiente

```
1. Recibe link único → techfield.app/r/{CODIGO_REFERIDOR}
2. Abre el link → pantalla de bienvenida con nombre del referidor
3. Llena formulario:
   - Nombre completo
   - Teléfono (verificación SMS)
   - Zona de trabajo (ciudad/estado/país)
   - Especialidades (multi-select)
   - Foto de perfil (opcional en registro, recomendada)
4. Verificación SMS de 6 dígitos
5. Perfil creado → acceso completo a la app
6. El referidor recibe notificación y suma puntos cuando el nuevo completa su primera OT
```

**Anti-fraude:** el referidor no suma puntos hasta que el nuevo técnico complete al menos 1 OT real.

### 4.2 Empresa

```
1. Entra a techfieldgps.com → botón "Registrar empresa"
2. Llena formulario:
   - Nombre de empresa
   - RFC (opcional en trial)
   - Correo corporativo
   - Teléfono
   - País / ciudad
3. Verificación por correo
4. Trial 14 días con acceso completo
5. Al día 10: recordatorio de activar plan
6. Al día 14: debe elegir plan para continuar
7. Empresa genera links de referido para sus técnicos
```

---

## 5. Módulos del sistema

### 5.1 Agenda y despacho

**Empresa puede:**
- Crear OTs y asignarlas a técnicos de su workspace
- Ver calendario de trabajos del equipo
- Recibir alertas de OTs sin cerrar después de X horas

**Técnico puede:**
- Ver su agenda del día con trabajos asignados
- Crear OTs propias (clientes directos)
- Ver todos los trabajos en mapa del día

### 5.2 Registro de instalación (corazón del producto)

**Formulario de OT — campos:**

| Campo | Tipo | Requerido |
|---|---|---|
| Tipo de trabajo | select (instalación/revisión/soporte/config/corte) | ✓ |
| Cliente nombre | text | ✓ |
| Cliente teléfono | tel | ✓ |
| Vehículo — marca | text + autocomplete | ✓ |
| Vehículo — modelo | text + autocomplete | ✓ |
| Vehículo — año | number | ✓ |
| Vehículo — placa | text | ✓ |
| Vehículo — color | text | opcional |
| VIN | text | opcional |
| Dispositivo — marca | text + autocomplete | ✓ |
| Dispositivo — modelo | text + autocomplete | ✓ |
| IMEI | text (15 dígitos, validado) | ✓ |
| Número SIM | text | ✓ |
| Operadora SIM | select | ✓ |
| Plataforma GPS | text (gpsscan / WOX / Wialon / otro) | ✓ |
| Notas técnicas | textarea | opcional |
| Fotos evidencia | upload multi (con geotag) | mín. 2 |
| Firma digital cliente | canvas | ✓ para cerrar |

**Reglas de cierre:**
- Mínimo 2 fotos requeridas (antes + después)
- Firma del cliente obligatoria
- OT no se puede cerrar sin estos requisitos

### 5.3 Evidencias y media

- Fotos capturadas desde la app guardan automáticamente: coordenadas GPS, timestamp, ID del técnico, ID de la OT
- Upload a **Cloudflare R2** (storage)
- Vista previa antes de confirmar
- Etiquetado por etapa: `before` / `during` / `after` / `device` / `signature`
- Funciona offline: guarda localmente en SQLite y sube al reconectar (queue de sincronización)

### 5.4 Link público de OT (killer feature)

Al cerrar una OT se genera automáticamente una URL única:
```
techfieldgps.com/ot/{uuid-slug}
```

**Vista pública incluye:**
- Header con logo TechField + nombre empresa (si aplica)
- Datos del vehículo (marca, modelo, año, placa)
- Datos del técnico (nombre, foto, nivel, zona)
- Datos del dispositivo (marca, modelo, IMEI parcial)
- Galería de fotos con timestamp y ubicación
- Firma digital del cliente
- Fecha y hora de la instalación
- Mapa con pin de la ubicación del trabajo
- Botón "Descargar PDF"
- QR del link

**La empresa puede:**
- Configurar su logo en el header del reporte
- Marcar OTs como "privadas" (no aparecen en perfil público del técnico)

### 5.5 Historial e inventario

- Historial de OTs por técnico con filtros: fecha, tipo, estado, zona
- Historial de dispositivos: todos los trabajos sobre un IMEI específico
- Alertas de revisión vencida o próxima (configurable por empresa)
- Inventario básico: dispositivos y SIMs disponibles por empresa

### 5.6 Dashboard y reportes

**Técnico ve:**
- OTs completadas este mes / este año
- Rating promedio de clientes
- Puntos y nivel actual
- Activity Score con barra de estado
- Mapa de trabajos realizados (heatmap)

**Empresa ve:**
- Trabajos por técnico (comparativa)
- OTs completadas vs pendientes vs canceladas
- Tiempo promedio por tipo de trabajo
- Mapa de cobertura
- Exportación CSV / PDF mensual

---

## 6. Gamificación y Activity Score

### 6.1 Sistema de puntos

**Acciones que suman puntos:**

| Acción | Puntos |
|---|---|
| OT completada con evidencias mínimas | +5 |
| Firma digital del cliente obtenida | +10 |
| Calificación cliente 4–5 estrellas | +3 |
| Primera OT del mes | +15 |
| Primer referido activo (completa 1 OT) | +20 |
| 3er referido activo | +35 |
| 5to referido activo | +60 |
| OT completada sin incidencias (10 consecutivas) | +50 |
| Aporte a KB aprobado | +3 |
| Aporte a KB usado más de 10 veces | +5 adicionales |
| Login y uso de la app (semanal) | +5 |

**Acciones que restan puntos:**

| Acción | Puntos |
|---|---|
| OT cancelada sin justificación | -5 |
| Calificación cliente < 2 estrellas | -10 |
| OT marcada incompleta por admin | -15 |

### 6.2 Sistema de niveles

| Nivel | Rango de puntos | Beneficios |
|---|---|---|
| Novato | 0 – 49 | Acceso básico, sin marketplace |
| Verificado | 50 – 199 | Aparece en marketplace, puede recibir trabajos de empresas |
| Pro | 200 – 499 | Prioridad en asignaciones, badge visible en perfil |
| Senior | 500 – 999 | Puede aprobar entradas KB, aparece como "certificador", rating destacado |
| Elite | 1,000+ | Top del marketplace, comisión reducida en escrow (fase futura), puede certificar técnicos |

### 6.3 Activity Score (0–100)

Score dinámico que determina la **posición en el marketplace**. Es independiente de los puntos — mide actividad reciente, no histórico.

**Cálculo:**
- Sube con actividad reciente (OTs, logins, aportes KB)
- Baja con inactividad (cron job diario)

**Reglas de decay:**
- Sin actividad 7 días: -5 puntos de score
- Sin actividad 14 días: -12 puntos de score + notificación push
- Sin actividad 21 días: -20 puntos + segundo aviso
- Sin actividad 30 días: perfil oculto en marketplace + notificación urgente

**Impacto según nivel de score:**

| Score | Estado | Efecto |
|---|---|---|
| 80–100 | Destacado | Top de resultados en marketplace |
| 60–79 | Activo | Visible, buen ranking |
| 40–59 | Inactivo | Baja prioridad, aviso en app |
| 20–39 | Dormido | Oculto en búsquedas de empresas |
| 0–19 | Archivado | Perfil suspendido hasta reactivar |

**Notificaciones push de reactivación:**
- Día 10 sin login: "Tu score bajó a X — registra una OT y mantén tu posición"
- Día 20: "Estás a 5 puntos de perder tu nivel Pro"
- Día 30: "Tu perfil está oculto para empresas. 1 OT te reactiva"
- Push positivo: "3 empresas vieron tu perfil esta semana"

### 6.4 Badges / logros

| Badge | Condición |
|---|---|
| Instalador serial | 50 instalaciones completadas |
| Sin errores | 30 OTs consecutivas sin incidencia |
| Reclutador | 5 referidos activos |
| Cliente feliz | Rating promedio 4.8+ |
| Mentor | Nivel Senior que certifica a 3+ técnicos |
| KB Master | 20 entradas KB aprobadas |

---

## 7. Base de conocimiento (KB)

### 7.1 Tipos de entrada

**A. Punto de corte de motor**
```
- vehiculo_marca
- vehiculo_modelo
- año_desde / año_hasta
- ubicacion_cable (descripción textual)
- color_cable
- amperaje
- fusible_recomendado
- fotos[] (mínimo 1)
- notas_adicionales
- tags[]
```

**B. Configuración de dispositivo GPS**
```
- dispositivo_marca
- dispositivo_modelo
- operadora
- apn
- usuario_apn
- password_apn
- puerto_servidor
- comandos_sms[]
- plataformas_compatibles[]
- fotos[]
- notas
```

**C. Problema conocido / solución**
```
- titulo
- sintoma (descripción del problema)
- causa
- solucion_pasos[] (array de strings)
- vehiculo_relacionado (opcional)
- dispositivo_relacionado (opcional)
- fotos[]
```

**D. Guía de instalación por tipo de vehículo**
```
- tipo_vehiculo (auto/camion/moto/maquinaria/taxi)
- marca / modelo / año
- pasos_instalacion[]
- puntos_clave[]
- advertencias[]
- fotos[]
```

### 7.2 Flujo de verificación

```
Técnico envía → estado: "pendiente"
                    ↓
            Notificación a técnicos Senior/Elite de la zona
                    ↓
            Técnico Senior revisa → aprueba/rechaza/pide corrección
                    ↓
            Si aprobado → estado: "verificado" → técnico autor suma +3 pts
                    ↓
            Si la entrada se usa 10+ veces → técnico autor suma +5 pts adicionales
```

### 7.3 Sistema de votos

- Cualquier técnico puede votar "Útil" o "No útil" en una entrada
- Rating de 1–5 estrellas en cada entrada
- Ordenamiento por: más útil / más reciente / más usado / mejor rating

### 7.4 Acceso offline

- Las últimas 50 búsquedas se cachean localmente en la app
- Las entradas favoritas se pueden guardar offline explícitamente

### 7.5 Valor estratégico de la KB

La KB es el **activo diferencial a largo plazo**:
- Con 1,000+ entradas verificadas: licenciable a fabricantes de trackers (JimiIoT, Teltonika, Concox)
- Con 5,000+ entradas LATAM: el dataset de cortes de motor más completo de la región
- API pública de KB en fase 3: plataformas GPS pueden integrarla en sus propios sistemas
- Búsqueda semántica con pgvector + embeddings en fase 3

---

## 8. Marketplace de técnicos

### 8.1 Modelo — solo conexión (sin procesar pagos)

El marketplace conecta empresa con técnico. El **pago del servicio ocurre fuera de la plataforma**. Vemontech no toca ese dinero. Esto evita obligaciones de retención ISR/IVA de plataformas tecnológicas en la fase inicial.

### 8.2 Sistema de créditos

La empresa compra créditos para acceder al marketplace:

**¿Qué cuesta créditos?**

| Acción | Créditos |
|---|---|
| Ver teléfono + WhatsApp del técnico | 1 crédito |
| Ver historial completo de OTs | 1 crédito |
| Enviar mensaje interno a técnico | 1 crédito |
| Publicar solicitud de trabajo (técnicos aplican) | 2 créditos |

**Paquetes:**
- 10 créditos: $199 MXN ($19.9 c/u)
- 30 créditos: $499 MXN ($16.6 c/u)
- 100 créditos: $1,299 MXN ($12.9 c/u)

**Créditos incluidos por plan:**
- Starter ($199/mes): 0 créditos
- Pro ($399/mes): 10 créditos/mes gratis
- Business ($799/mes): 30 créditos/mes gratis

Los créditos no expiran. Los créditos del plan mensual sí expiran al mes (use-it-or-lose-it para incentivar uso activo).

### 8.3 Perfil del técnico en marketplace

El perfil visible para empresas muestra:
- Foto, nombre, zona, especialidades
- Nivel y badges
- Activity Score (indicador de actividad)
- Número de OTs completadas
- Rating promedio
- Últimas 3 OTs (sin datos privados del cliente)
- **Datos de contacto bloqueados → se desbloquean con 1 crédito**

### 8.4 Búsqueda de técnicos

Filtros disponibles para empresa:
- Zona geográfica (ciudad / estado / radio en km)
- Especialidad
- Nivel mínimo (Verificado / Pro / Senior / Elite)
- Rating mínimo
- Disponibilidad (activo en los últimos N días)

Ordenamiento: Activity Score descendente (default) / Rating / Cercanía

### 8.5 Técnico con doble vínculo

Un técnico puede ser independiente Y trabajar para una empresa:
- Sus puntos y nivel son suyos, no de la empresa
- OTs de la empresa aparecen en su historial (salvo marcadas como privadas)
- La empresa puede marcar OTs privadas si el cliente es confidencial
- El técnico puede desvincularse de una empresa en cualquier momento

---

## 9. Tienda de recompensas

Los puntos acumulados se canjean en la **Tienda TechField**:

| Premio | Puntos requeridos | Tipo | Notas |
|---|---|---|---|
| Certificado digital "Técnico Verificado" | 150 pts | Digital | PDF con QR verificable, generado automáticamente |
| SIM card prepago (30 días / 5 GB) | 200 pts | Físico | Telcel o AT&T, coordinado con aliados |
| Descuento 20% en tracker GPS | 350 pts | Cupón | JimiIoT, Teltonika, Concox — aliados |
| Vale de herramienta $300 MXN | 500 pts | Físico | Urrea, Stanley, Pretul |
| Certificación Senior (badge físico + digital) | 800 pts | Mixto | Badge + carta digital avalada por TechField |
| Kit instalador completo | 1,000 pts | Físico | Arnés, fusibles, relay, bridas, cinta vulcanizante |

**Reglas:**
- El canje requiere Activity Score > 50 (anti-cuentas fantasma)
- Los puntos nunca expiran
- Certificados se generan automáticamente (costo $0 para la plataforma)
- Premios físicos se coordinan con proveedores aliados (no requiere inventario propio)

**El certificado digital con QR verificable:**
- Cualquier empresa puede escanear el QR y ver el perfil real del técnico
- Genera tráfico orgánico a la plataforma
- El técnico lo comparte en WhatsApp Business y redes sociales

---

## 10. Arquitectura técnica

### 10.1 Stack

| Capa | Tecnología |
|---|---|
| **Backend API** | NestJS (TypeScript) |
| **Base de datos** | PostgreSQL 15 |
| **ORM** | TypeORM |
| **Auth** | JWT + Guards por rol |
| **Storage fotos** | Cloudflare R2 |
| **Push notifications** | Firebase FCM |
| **PDF generación** | React-PDF / Puppeteer |
| **SMS verificación** | Twilio |
| **Pagos** | Conekta (MX) / Stripe (LATAM expansión) |
| **Búsqueda KB** | PostgreSQL full-text (pg_trgm) → pgvector en fase 3 |
| **App móvil** | Ionic 7 + Capacitor (Angular o React) |
| **Offline** | SQLite local + queue de sincronización |
| **Mapas app** | Mapbox GL |
| **Panel web empresa** | Next.js 14 + TailwindCSS |
| **Mapas web** | Mapbox GL JS |
| **Charts** | Recharts / Chart.js |
| **Hosting** | VPS Ubuntu 22 + Docker Compose |
| **CI/CD** | GitHub Actions |
| **Monitoreo** | Sentry + Uptime Robot |
| **Link público OT** | Next.js SSR (slug UUID) |

### 10.2 Dominios

- `techfieldgps.com` — landing page + panel web empresa + links públicos OT
- `techfieldgps.app` — (alternativa) o app store links
- API: `api.techfieldgps.com`

### 10.3 Estructura de módulos NestJS

```
src/
├── auth/           # JWT, guards, roles
├── users/          # técnicos y admins
├── workspaces/     # empresas y sus configuraciones
├── work-orders/    # OTs, estados, cierre
├── evidences/      # fotos, firma, upload R2
├── devices/        # IMEI, SIM, inventario
├── vehicles/       # catálogo de vehículos
├── gamification/   # puntos, niveles, score, badges
├── referrals/      # sistema de referidos
├── knowledge-base/ # KB, categorías, votos
├── marketplace/    # búsqueda, créditos, desbloqueo
├── rewards/        # tienda, canje
├── notifications/  # FCM push, email
├── reports/        # PDF, exports
├── public/         # endpoints sin auth (OT pública, perfil público)
└── admin/          # panel interno Vemontech
```

### 10.4 Multi-tenancy

- Técnico tiene un `user_id` global único en toda la plataforma
- Empresa tiene un `workspace_id`
- Un técnico puede estar en múltiples workspaces (tabla `workspace_members`)
- Sus puntos y nivel viven en `users`, no en `workspace_members`
- Las OTs tienen `workspace_id` (nullable para técnicos independientes)

---

## 11. Modelo de datos — PostgreSQL

### Tablas principales

```sql
-- Usuarios (técnicos e individuos)
users (
  id UUID PK,
  role ENUM('technician', 'company_admin', 'company_technician', 'platform_admin'),
  name VARCHAR,
  phone VARCHAR UNIQUE,
  phone_verified BOOLEAN DEFAULT false,
  email VARCHAR,
  avatar_url VARCHAR,
  zone_city VARCHAR,
  zone_state VARCHAR,
  zone_country VARCHAR DEFAULT 'MX',
  specialties JSONB, -- array de strings
  referrer_id UUID FK → users.id,
  total_points INTEGER DEFAULT 0,
  current_level ENUM('novato','verificado','pro','senior','elite') DEFAULT 'novato',
  activity_score INTEGER DEFAULT 100,
  last_activity_at TIMESTAMP,
  is_marketplace_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Workspaces (empresas)
workspaces (
  id UUID PK,
  name VARCHAR,
  rfc VARCHAR,
  logo_url VARCHAR,
  plan ENUM('starter','pro','business') DEFAULT 'starter',
  plan_expires_at TIMESTAMP,
  credits_balance INTEGER DEFAULT 0,
  monthly_credits INTEGER DEFAULT 0, -- créditos del plan que se renuevan
  country VARCHAR DEFAULT 'MX',
  created_at TIMESTAMP
)

-- Membresía técnico-empresa
workspace_members (
  id UUID PK,
  workspace_id UUID FK,
  user_id UUID FK,
  role ENUM('admin','technician'),
  joined_at TIMESTAMP,
  UNIQUE(workspace_id, user_id)
)

-- Órdenes de trabajo
work_orders (
  id UUID PK,
  slug VARCHAR UNIQUE, -- para link público
  workspace_id UUID FK nullable,
  technician_id UUID FK,
  type ENUM('installation','revision','support','config','motor_cut'),
  status ENUM('draft','in_progress','completed','cancelled'),
  client_name VARCHAR,
  client_phone VARCHAR,
  vehicle_brand VARCHAR,
  vehicle_model VARCHAR,
  vehicle_year INTEGER,
  vehicle_plate VARCHAR,
  vehicle_color VARCHAR,
  vehicle_vin VARCHAR,
  device_brand VARCHAR,
  device_model VARCHAR,
  device_imei VARCHAR,
  device_sim VARCHAR,
  device_operator VARCHAR,
  device_platform VARCHAR,
  notes TEXT,
  client_rating INTEGER, -- 1-5
  client_signature_url VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  address TEXT,
  is_private BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
)

-- Evidencias fotográficas
evidences (
  id UUID PK,
  work_order_id UUID FK,
  stage ENUM('before','during','after','device','other'),
  url VARCHAR,
  thumbnail_url VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  taken_at TIMESTAMP,
  file_size INTEGER,
  uploaded_at TIMESTAMP
)

-- Log de puntos
points_log (
  id UUID PK,
  user_id UUID FK,
  delta INTEGER, -- positivo o negativo
  reason VARCHAR,
  reference_id UUID, -- OT id, KB id, referral id, etc.
  score_after INTEGER,
  created_at TIMESTAMP
)

-- Referidos
referrals (
  id UUID PK,
  referrer_id UUID FK → users.id,
  referred_id UUID FK → users.id,
  code VARCHAR UNIQUE,
  status ENUM('pending','active','rewarded'),
  first_ot_completed_at TIMESTAMP,
  points_granted INTEGER DEFAULT 0,
  created_at TIMESTAMP
)

-- Base de conocimiento
kb_entries (
  id UUID PK,
  type ENUM('motor_cut','device_config','known_issue','install_guide'),
  title VARCHAR,
  vehicle_brand VARCHAR,
  vehicle_model VARCHAR,
  year_from INTEGER,
  year_to INTEGER,
  device_brand VARCHAR,
  device_model VARCHAR,
  operator VARCHAR,
  content JSONB, -- estructura flexible según tipo
  photos JSONB, -- array de URLs
  author_id UUID FK,
  status ENUM('draft','pending','approved','rejected'),
  approved_by UUID FK nullable,
  use_count INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  rating_avg DECIMAL DEFAULT 0,
  country VARCHAR DEFAULT 'MX',
  created_at TIMESTAMP
)

-- Votos KB
kb_votes (
  id UUID PK,
  entry_id UUID FK,
  user_id UUID FK,
  is_useful BOOLEAN,
  rating INTEGER, -- 1-5
  created_at TIMESTAMP,
  UNIQUE(entry_id, user_id)
)

-- Créditos log
credits_log (
  id UUID PK,
  workspace_id UUID FK,
  delta INTEGER,
  action ENUM('purchase','plan_renewal','unlock_contact','unlock_history','post_request','refund'),
  reference_id UUID nullable,
  balance_after INTEGER,
  created_at TIMESTAMP
)

-- Catálogo de recompensas
rewards_catalog (
  id UUID PK,
  name VARCHAR,
  description TEXT,
  type ENUM('digital','physical','coupon'),
  points_required INTEGER,
  is_active BOOLEAN DEFAULT true,
  partner VARCHAR,
  stock INTEGER nullable -- null = ilimitado (para digitales)
)

-- Canjes de recompensas
rewards_redemptions (
  id UUID PK,
  user_id UUID FK,
  reward_id UUID FK,
  points_spent INTEGER,
  status ENUM('pending','processing','delivered'),
  delivery_details JSONB,
  created_at TIMESTAMP
)

-- Badges
user_badges (
  id UUID PK,
  user_id UUID FK,
  badge_key VARCHAR,
  earned_at TIMESTAMP,
  UNIQUE(user_id, badge_key)
)
```

---

## 12. UI/UX — Principios de diseño

### 12.1 Filosofía general

La app debe verse y sentirse **premium**. Un técnico que la muestra a su cliente debe sentir orgullo, no vergüenza. El diseño es parte del producto, no decoración.

> **Referencia de inspiración de diseño:** Linear, Notion, Duolingo (gamificación), Stripe (reportes), Uber (app de conductor)

### 12.2 App móvil técnico — principios

- **Moderna y atractiva:** iconos de alta calidad (Phosphor Icons o similar), ilustraciones, micro-animaciones
- **Dark mode nativo:** la mayoría de técnicos trabajan en exteriores — el modo oscuro es más usable
- **Tipografía bold y legible:** fuentes que se lean bien bajo el sol directo
- **Colores con significado:** verde = completado, azul = en progreso, naranja = pendiente/atención, rojo = problema
- **Feedback visual inmediato:** animaciones de éxito al cerrar OT, confetti al subir de nivel
- **Bottom navigation:** max 4 tabs (Home, OTs, KB, Perfil)
- **Cards, no tablas:** toda la información en tarjetas con jerarquía visual clara

### 12.3 Pantallas de alto impacto visual

**Home / Dashboard:**
- Score Activity con gauge animado circular
- Nivel con barra de progreso y XP
- "Tus OTs de hoy" en cards horizontales scrollables
- Último badge ganado destacado
- Acceso rápido: botón prominente "Nueva OT"

**Perfil — CV del técnico:**
- Hero section con foto grande, nombre y nivel con badge
- Score Activity visible y con color según estado
- Estadísticas en cards: OTs totales, rating promedio, años activo
- Badges en galería visual (como achievements de videojuego)
- Historial de OTs como timeline elegante
- "Compartir mi perfil" → genera link con preview atractivo
- El perfil debe poder imprimirse / exportarse como PDF tipo CV profesional

**Detalle de OT (para compartir con cliente):**
- Vista tipo "recibo premium" — no un formulario
- Galería de fotos con lightbox
- Firma del cliente integrada elegantemente
- Mapa embedded con el pin de la ubicación
- QR grande y visible para compartir
- Colores de la empresa si está vinculado a workspace

**Base de conocimiento:**
- Búsqueda con resultados instantáneos (debounce 300ms)
- Cards de resultado con rating visual (estrellas), badge de verificado, contador de usos
- Vista de detalle con fotos en carrusel
- Paso a paso numerado y claro

**Gamificación:**
- Nivel actual con barra tipo videojuego (XP hasta siguiente nivel)
- Animación al ganar puntos (número flotante +X)
- Historial de puntos como feed
- Tienda de recompensas con cards tipo e-commerce (imagen del premio, puntos requeridos, disponibilidad)

### 12.4 Panel web empresa

- **Sidebar fijo** con navegación principal
- **Dashboard:** KPIs en cards métricas + gráfica de OTs por período + mapa de trabajos
- **Tabla de OTs:** filtrable, con estados coloreados, exportable
- **Mapa en tiempo real:** pins por técnico con color de estado
- **Marketplace:** cards de técnico tipo LinkedIn — foto, nivel, rating, zona, especialidades
- **Responsive:** funcional en tablet para coordinadores en campo

### 12.5 Reporte público OT (vista cliente)

- Diseño tipo "hoja membretada" premium
- Logo de la empresa (si aplica) en header
- Datos claros con iconos acompañando cada sección
- Fotos en grilla 2x2 o carrusel
- Firma del cliente en recuadro con fecha
- Mapa pequeño con la ubicación del trabajo
- Footer con datos de la empresa y badge "Verificado por TechField GPS"
- Exportación PDF mantiene el mismo diseño elegante

### 12.6 Librería de iconos y recursos recomendados

- **Iconos:** Phosphor Icons (MIT, consistentes, modernos) o Lucide
- **Ilustraciones onboarding:** Storyset o ilustraciones custom SVG
- **Fuente principal app:** DM Sans o Plus Jakarta Sans
- **Fuente display (headings bold):** Sora o Outfit
- **Fuente monoespaciada (IMEI, códigos):** JetBrains Mono
- **Paleta:** 
  - Primario: `#0066FF` (azul confianza)
  - Éxito: `#00C47D` (verde GPS)
  - Advertencia: `#FF9500`
  - Error: `#FF3B30`
  - Superficies dark: `#0F1117`, `#1A1D27`, `#252836`

---

## 13. PRD — Fase 1 (solo técnicos)

**Objetivo:** 50 técnicos activos por zona (NL + Lima) antes de abrir a empresas.

**Duración estimada:** 8 semanas de desarrollo.

**Regla:** si una función no la usa el técnico independiente en su día a día, no entra en Fase 1.

### Semana 1–2: Base y auth
- [ ] Setup NestJS + PostgreSQL + Docker en VPS
- [ ] Schema inicial: users, referrals, profiles
- [ ] Auth JWT con roles (technician / platform_admin)
- [ ] Endpoint registro por referido + generación de código único
- [ ] Verificación por SMS (Twilio)
- [ ] Pantalla de perfil en Ionic: foto, zona, especialidades
- [ ] URL pública del perfil (Next.js SSR)
- [ ] CI/CD básico con GitHub Actions

### Semana 3–4: OTs y evidencias
- [ ] Schema: work_orders, evidences, devices, vehicles
- [ ] Formulario de OT completo en Ionic
- [ ] Captura de foto con geotag (Capacitor Camera + Geolocation)
- [ ] Upload a Cloudflare R2 con metadata (coords, timestamp)
- [ ] Canvas de firma digital en Ionic
- [ ] Cierre de OT: validar evidencias mínimas + firma requerida
- [ ] Modo offline: SQLite local + queue de sincronización
- [ ] Historial de OTs con filtros básicos

### Semana 5: Link público y PDF
- [ ] Generación de slug UUID por OT al cerrar
- [ ] Página SSR pública en Next.js: `/ot/[slug]`
- [ ] Diseño de reporte público premium (datos, fotos, firma, mapa)
- [ ] Generación PDF con React-PDF o Puppeteer
- [ ] Botón "Compartir por WhatsApp" (deep link preformateado)
- [ ] SEO básico en página pública (og:title, og:image con preview)

### Semana 6: Gamificación y score
- [ ] Schema: points_log, user_badges, levels, activity_score
- [ ] Servicio de puntos: reglas automáticas por evento
- [ ] Cálculo de Activity Score con decay (cron job diario)
- [ ] Notificaciones push via FCM cuando score baja de umbral
- [ ] Pantalla "Mi perfil": puntos, nivel, barra de progreso
- [ ] Pantalla de referidos: mi código, compartir, contador

### Semana 7: Base de conocimiento v1
- [ ] Schema: kb_entries, kb_votes, kb_categories
- [ ] Formulario nueva entrada KB
- [ ] Búsqueda full-text con pg_trgm
- [ ] Pantalla detalle KB con fotos y votos
- [ ] Flujo de verificación (pendiente → Senior aprueba)
- [ ] Caché local de búsquedas para offline
- [ ] **Sembrar 20–30 entradas iniciales** (cortes Hilux, NP300, APNs Telcel/AT&T/Movistar)

### Semana 8: Pulido y lanzamiento
- [ ] Testing en dispositivos Android reales
- [ ] Onboarding tour 3 pantallas en primer login
- [ ] Admin panel básico (ver técnicos, OTs, aprobar KB)
- [ ] Publicar en Google Play Store + APK directo (backup)
- [ ] Dominio, SSL, monitoreo Uptime Robot + Sentry
- [ ] Landing page techfieldgps.com con descarga
- [ ] Invitar primeros 10 técnicos semilla (red Vemontech)
- [ ] Video tutorial 2 min por WhatsApp para primeros técnicos

### Historias de usuario Fase 1 (priorizadas)

**P1 — Crítico:**
- Registrarse con link de referido (< 3 min, sin RFC)
- Completar perfil profesional con foto y zona
- Generar mi link de referido para compartir por WhatsApp
- Crear una OT con formulario de instalación
- Subir evidencias con geotag automático
- Obtener firma digital del cliente en pantalla
- Compartir link de OT con cliente por WhatsApp
- Ver mis puntos, nivel y Activity Score

**P2 — Importante:**
- Ver historial de OTs con filtros
- Consultar la base de conocimiento
- Recibir notificación push cuando mi score baja
- Ver mis badges y logros

**P3 — Deseable (si hay tiempo):**
- Aportar una entrada a la KB
- Ver mi perfil público como lo ve una empresa
- Exportar mi perfil como PDF tipo CV

---

## 14. PRD — Fase 2 (empresas y marketplace)

**Trigger de activación:** 50 técnicos activos (≥1 OT/semana) en al menos 1 zona + 100 entradas KB aprobadas + retención 14d ≥ 60%.

**Duración estimada:** 8–10 semanas adicionales.

### Funciones a construir en Fase 2
- [ ] Registro de empresa + trial 14 días
- [ ] Panel web Next.js para empresa (dashboard, OTs, equipo, mapa)
- [ ] Suscripciones mensuales con Conekta
- [ ] Sistema de créditos: compra, consumo, historial
- [ ] Marketplace: búsqueda, filtros, desbloqueo con créditos
- [ ] Asignación de OTs desde empresa a técnico
- [ ] Mapa en tiempo real del equipo (geolocation opt-in)
- [ ] Reportes y exportación CSV/PDF
- [ ] Workspace multi-tenant sólido
- [ ] Inventario básico de dispositivos GPS
- [ ] Alertas de revisión vencida o próxima
- [ ] Tienda de recompensas completa
- [ ] Primeras alianzas con distribuidores para premios

---

## 15. KPIs y gates de activación

### Gate de Fase 1 → Fase 2

| Métrica | Meta | Descripción |
|---|---|---|
| Técnicos activos / zona | ≥ 50 | Al menos 1 OT registrada en los últimos 7 días |
| Entradas KB aprobadas | ≥ 100 | Sin KB mínima, el diferencial frente a Computrabajo es menor |
| Retención 14 días | ≥ 60% | % de técnicos registrados que hicieron login en últimos 14 días |
| NPS técnico | ≥ 40 | Encuesta breve en app después de primera semana |

### KPIs de salud mensual

| KPI | Saludable | Preocupante |
|---|---|---|
| DAU / MAU técnicos | > 40% | < 20% |
| OTs por técnico activo / mes | > 8 | < 3 |
| Score promedio de técnicos activos | > 65 | < 45 |
| Conversión trial → plan empresa | > 30% | < 15% |
| Créditos consumidos / empresa / mes | > 5 | < 2 |

### Hitos de valoración

| Hito | Valoración estimada |
|---|---|
| 50 técnicos activos, 0 ingreso | $15–30K USD (activo de red) |
| 10 empresas pagando, marketplace activo | $40–80K USD |
| 100 empresas, escrow activo | $150–250K USD |
| LATAM 3 países, 1,500 técnicos | $300–500K USD |
| Primera licencia KB o white-label | $500K–1M USD |
| Alianza aseguradora activa | $2–5M USD |

---

## 16. Estrategia LATAM y viabilidad

### Mercado objetivo inicial

| País | Técnicos estimados | Prioridad | Nota |
|---|---|---|---|
| México (NL, CDMX, GDL) | ~18,000 | **Arranque** | Red de contactos Vemontech existente |
| Perú (Lima) | ~9,000 | **Paralelo MVP** | Clientes Vemontech actuales |
| Colombia (Bogotá, Medellín) | ~12,000 | Mes 4–6 | Mercado GPS muy activo |
| Ecuador | ~6,000 | Mes 6–8 | Contacto puntoexacto.ec existente |
| Venezuela | ~5,500 | Mes 8–10 | Alta demanda GPS por seguridad |
| Chile / Argentina | ~4,500 c/u | Mes 10–12 | Mercados más formales |

### Ventajas competitivas de Vemontech

1. **Conocimiento del nicho:** gpsscan.net, JimiIoT, WOX, Wialon son el stack diario. Cero curva de aprendizaje del producto.
2. **Red existente:** clientes en Perú y México que pueden ser los primeros usuarios semilla.
3. **Stack dominado:** NestJS, Ionic, Next.js, PostgreSQL, Docker ya en producción.
4. **La KB como foso:** 1,000+ entradas de cortes de motor LATAM es imposible de replicar sin comunidad real.

### Ruta al millón de dólares

**Camino A — Valoración $1M USD (18–24 meses):**
- 5,000 técnicos activos en LATAM
- 300+ empresas pagando en 3+ países
- KB con 2,000+ entradas verificadas
- 1 licencia KB o white-label activa
→ Atractivo para adquisición por plataforma GPS regional (Geotab, Samsara, Wialon)

**Camino B — Ingreso $1M USD/año (3–4 años):**
- Escrow activo con volumen real de transacciones
- Alianza con 1–2 aseguradoras (verificación de instalaciones GPS para pólizas)
- 500+ empresas en LATAM
- Licenciamiento API de KB

---

## 17. Fuera del alcance por fase

### ❌ No va en Fase 1

- Panel web de empresa
- Sistema de créditos y marketplace
- Pagos / Conekta / Stripe
- Escrow de trabajos
- Tienda de recompensas (se muestra como "próximamente")
- Búsqueda semántica pgvector
- App iOS (Play Store primero)
- Multi-idioma / multi-moneda
- API pública
- White-label
- Retenciones ISR/IVA (no hay procesamiento de pagos)

### ❌ No va en Fase 2

- Escrow de pagos técnico-empresa (Fase 3)
- API pública de KB (Fase 3)
- White-label completo (Fase 3)
- Alianzas con aseguradoras (Fase 3)
- pgvector + IA en KB (Fase 3)

### Regla de oro

> Antes de agregar una función nueva, preguntarse: ¿esta función ayuda a que más técnicos registren más OTs, o a que más empresas paguen? Si la respuesta es no, va a un backlog y se revisa en la siguiente fase.

---

## Notas finales para construcción con Claude

Al usar este documento como contexto en Claude Code o en conversaciones de desarrollo, incluir siempre:

1. La sección de arquitectura técnica completa (sección 10)
2. El modelo de datos relevante para el módulo que se está construyendo (sección 11)
3. Los principios de UI/UX (sección 12) al generar pantallas o componentes
4. El PRD de la fase activa (sección 13 o 14)

**Stack confirmado:**
- Backend: `NestJS + TypeScript + PostgreSQL + TypeORM`
- App: `Ionic 7 + Capacitor`
- Web: `Next.js 14 + TailwindCSS`
- Infra: `Ubuntu VPS + Docker Compose + GitHub Actions`
- Storage: `Cloudflare R2`
- Push: `Firebase FCM`

**Repositorio sugerido:**
```
techfield-gps/
├── apps/
│   ├── api/          # NestJS backend
│   ├── mobile/       # Ionic app técnico
│   └── web/          # Next.js panel empresa + links públicos
├── packages/
│   ├── types/        # TypeScript shared types
│   └── utils/        # shared utilities
└── docker-compose.yml
```

---

*Documento generado con Claude · Vemontech 2026*

---

## 18. Guía de construcción para Claude Code

> Esta sección es el prompt de contexto para pasarle a Claude Code (claude.ai/code o CLI). Contiene todo lo necesario para construir el sistema sin explicar el negocio desde cero.

---

### 18.1 Resumen ejecutivo del sistema

Estás construyendo **TechField GPS** — plataforma SaaS para técnicos instaladores de rastreadores GPS vehiculares en LATAM. El producto tiene dos apps:

1. **App móvil** (Ionic + Capacitor) — para el técnico independiente. Siempre gratis.
2. **Panel web** (Next.js 14) — para empresas coordinadoras. De pago.
3. **API REST** (NestJS) — backend compartido para ambas apps.

La Fase 1 solo construye la app móvil para técnicos. El panel de empresa va en Fase 2.

---

### 18.2 Stack exacto

```
Backend:    NestJS 10 + TypeScript + PostgreSQL 15 + TypeORM
App móvil:  Ionic 7 + Capacitor 5 + Angular 17 (standalone components)
Panel web:  Next.js 14 App Router + TailwindCSS + shadcn/ui
Storage:    Cloudflare R2 (S3-compatible)
Push:       Firebase Cloud Messaging (FCM)
SMS:        Twilio Verify
PDF:        @react-pdf/renderer
Auth:       JWT (access token 30d) + Refresh token
ORM:        TypeORM con migraciones
Infra:      Docker Compose (api + postgres + redis)
CI/CD:      GitHub Actions
Monitoreo:  Sentry
```

---

### 18.3 Estructura de repositorio (monorepo)

```
techfield-gps/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── database/
│   │   │   │   ├── data-source.ts
│   │   │   │   ├── migrations/
│   │   │   │   └── seeds/
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   └── pipes/
│   │   │   ├── config/
│   │   │   │   └── configuration.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── dto/
│   │   │   ├── users/
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.entity.ts
│   │   │   │   └── dto/
│   │   │   ├── referrals/
│   │   │   │   ├── referrals.module.ts
│   │   │   │   ├── referrals.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   └── referral.entity.ts
│   │   │   │   └── dto/
│   │   │   ├── work-orders/
│   │   │   │   ├── work-orders.module.ts
│   │   │   │   ├── work-orders.service.ts
│   │   │   │   ├── work-orders.controller.ts
│   │   │   │   ├── entities/
│   │   │   │   │   ├── work-order.entity.ts
│   │   │   │   │   └── evidence.entity.ts
│   │   │   │   └── dto/
│   │   │   ├── evidences/
│   │   │   │   ├── evidences.module.ts
│   │   │   │   ├── evidences.service.ts
│   │   │   │   └── entities/
│   │   │   ├── storage/
│   │   │   │   ├── storage.module.ts
│   │   │   │   └── storage.service.ts   # Cloudflare R2
│   │   │   ├── gamification/
│   │   │   │   ├── gamification.module.ts
│   │   │   │   ├── gamification.service.ts
│   │   │   │   ├── score.service.ts     # Activity Score + decay cron
│   │   │   │   └── entities/
│   │   │   │       ├── points-log.entity.ts
│   │   │   │       └── user-badge.entity.ts
│   │   │   ├── knowledge-base/
│   │   │   │   ├── kb.module.ts
│   │   │   │   ├── kb.service.ts
│   │   │   │   ├── kb.controller.ts
│   │   │   │   └── entities/
│   │   │   │       ├── kb-entry.entity.ts
│   │   │   │       └── kb-vote.entity.ts
│   │   │   ├── notifications/
│   │   │   │   ├── notifications.module.ts
│   │   │   │   └── notifications.service.ts  # FCM push
│   │   │   ├── reports/
│   │   │   │   ├── reports.module.ts
│   │   │   │   └── reports.service.ts   # PDF generation
│   │   │   └── public/
│   │   │       ├── public.module.ts
│   │   │       └── public.controller.ts # /ot/:slug sin auth
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── mobile/                 # Ionic Angular app técnico
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.component.ts
│   │   │   │   ├── app.routes.ts
│   │   │   │   ├── core/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   │   ├── api.service.ts
│   │   │   │   │   │   ├── storage.service.ts  # SQLite offline
│   │   │   │   │   │   └── sync.service.ts     # offline queue
│   │   │   │   │   ├── guards/
│   │   │   │   │   └── interceptors/
│   │   │   │   ├── shared/
│   │   │   │   │   ├── components/
│   │   │   │   │   └── pipes/
│   │   │   │   └── pages/
│   │   │   │       ├── auth/
│   │   │   │       │   ├── welcome/        # pantalla bienvenida + referido
│   │   │   │       │   ├── register/       # registro técnico
│   │   │   │       │   └── verify-sms/     # verificación 6 dígitos
│   │   │   │       ├── home/               # dashboard principal
│   │   │   │       ├── work-orders/
│   │   │   │       │   ├── list/           # historial OTs
│   │   │   │       │   ├── new/            # crear OT (multi-step)
│   │   │   │       │   │   ├── step-data/  # datos vehículo + dispositivo
│   │   │   │       │   │   ├── step-evidences/ # fotos + geotag
│   │   │   │       │   │   └── step-signature/ # firma digital
│   │   │   │       │   └── detail/         # detalle + link compartir
│   │   │   │       ├── knowledge-base/
│   │   │   │       │   ├── search/
│   │   │   │       │   ├── detail/
│   │   │   │       │   └── contribute/
│   │   │   │       └── profile/
│   │   │   │           ├── view/           # CV del técnico
│   │   │   │           ├── referrals/      # mis referidos
│   │   │   │           └── rewards/        # tienda puntos
│   │   ├── capacitor.config.ts
│   │   └── package.json
│   │
│   └── web/                    # Next.js — links públicos OT + panel empresa (F2)
│       ├── src/
│       │   └── app/
│       │       ├── layout.tsx
│       │       ├── page.tsx            # landing
│       │       ├── ot/[slug]/          # reporte público OT (sin auth)
│       │       │   └── page.tsx
│       │       └── dashboard/          # panel empresa (Fase 2)
│       └── package.json
│
├── packages/
│   └── types/                  # TypeScript shared types
│       ├── src/
│       │   ├── user.types.ts
│       │   ├── work-order.types.ts
│       │   └── index.ts
│       └── package.json
│
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

---

### 18.4 Variables de entorno — `apps/api/.env.example`

```env
# App
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=techfield_db
DB_USER=techfield_user
DB_PASS=tu_password_seguro

# JWT
JWT_SECRET=minimo_32_caracteres_cambiar_en_produccion
JWT_EXPIRES_IN=30d
JWT_REFRESH_SECRET=otro_secret_diferente_32_chars
JWT_REFRESH_EXPIRES_IN=90d

# Twilio (SMS verificación)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxx

# Firebase (push notifications)
FIREBASE_PROJECT_ID=techfield-gps
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@techfield-gps.iam.gserviceaccount.com

# Cloudflare R2 (storage fotos)
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxx
R2_BUCKET_NAME=techfield-evidences
R2_PUBLIC_URL=https://evidences.techfieldgps.com

# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

---

### 18.5 `docker-compose.yml` (desarrollo)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: techfield_db
      POSTGRES_USER: techfield_user
      POSTGRES_PASSWORD: techfield_pass_change_me
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    env_file:
      - ./apps/api/.env
    depends_on:
      - postgres
    volumes:
      - ./apps/api:/app
      - /app/node_modules

volumes:
  pgdata:
```

---

### 18.6 Entidades TypeORM — esquema completo

#### `user.entity.ts`
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.TECHNICIAN })
  role: UserRole  // 'technician' | 'company_admin' | 'company_technician' | 'platform_admin'

  @Column() name: string
  @Column({ unique: true }) phone: string
  @Column({ default: false }) phoneVerified: boolean
  @Column({ nullable: true }) email: string
  @Column({ nullable: true }) avatarUrl: string

  // Zona de trabajo
  @Column({ nullable: true }) zoneCity: string
  @Column({ nullable: true }) zoneState: string
  @Column({ default: 'MX' }) zoneCountry: string

  @Column({ type: 'jsonb', default: [] }) specialties: string[]
  // ['installation','revision','support','config','motor_cut']

  // Referido
  @Column({ nullable: true }) referrerId: string
  @ManyToOne(() => User, { nullable: true }) referrer: User

  // Gamificación
  @Column({ default: 0 }) totalPoints: number
  @Column({ type: 'enum', enum: UserLevel, default: UserLevel.NOVATO })
  level: UserLevel  // 'novato'|'verificado'|'pro'|'senior'|'elite'
  @Column({ default: 100 }) activityScore: number
  @Column({ nullable: true }) lastActivityAt: Date

  @Column({ default: true }) isMarketplaceVisible: boolean
  @Column({ nullable: true }) fcmToken: string  // Firebase push token

  @Column({ nullable: true }) referralCode: string  // código único para invitar

  @CreateDateColumn() createdAt: Date
  @UpdateDateColumn() updatedAt: Date

  // Relations
  @OneToMany(() => WorkOrder, wo => wo.technician) workOrders: WorkOrder[]
  @OneToMany(() => PointsLog, pl => pl.user) pointsLog: PointsLog[]
  @OneToMany(() => UserBadge, ub => ub.user) badges: UserBadge[]
}
```

#### `work-order.entity.ts`
```typescript
@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column({ unique: true }) slug: string  // UUID corto para URL pública

  @Column({ nullable: true }) workspaceId: string  // null = técnico independiente

  @Column() technicianId: string
  @ManyToOne(() => User) technician: User

  @Column({ type: 'enum', enum: WOType })
  type: WOType  // 'installation'|'revision'|'support'|'config'|'motor_cut'

  @Column({ type: 'enum', enum: WOStatus, default: WOStatus.DRAFT })
  status: WOStatus  // 'draft'|'in_progress'|'completed'|'cancelled'

  // Cliente
  @Column() clientName: string
  @Column({ nullable: true }) clientPhone: string

  // Vehículo
  @Column() vehicleBrand: string
  @Column() vehicleModel: string
  @Column() vehicleYear: number
  @Column() vehiclePlate: string
  @Column({ nullable: true }) vehicleColor: string
  @Column({ nullable: true }) vehicleVin: string

  // Dispositivo
  @Column() deviceBrand: string
  @Column() deviceModel: string
  @Column() deviceImei: string
  @Column({ nullable: true }) deviceSim: string
  @Column({ nullable: true }) deviceOperator: string
  @Column({ nullable: true }) devicePlatform: string  // gpsscan / WOX / Wialon / otro

  @Column({ type: 'text', nullable: true }) notes: string

  // Cierre
  @Column({ nullable: true }) clientRating: number  // 1-5
  @Column({ nullable: true }) clientSignatureUrl: string

  // Geolocalización del trabajo
  @Column({ type: 'decimal', nullable: true }) latitude: number
  @Column({ type: 'decimal', nullable: true }) longitude: number
  @Column({ nullable: true }) address: string

  @Column({ default: false }) isPrivate: boolean  // empresa puede ocultar del perfil público

  @Column({ nullable: true }) completedAt: Date
  @CreateDateColumn() createdAt: Date
  @UpdateDateColumn() updatedAt: Date

  @OneToMany(() => Evidence, e => e.workOrder) evidences: Evidence[]
}
```

#### `evidence.entity.ts`
```typescript
@Entity('evidences')
export class Evidence {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column() workOrderId: string
  @ManyToOne(() => WorkOrder, wo => wo.evidences) workOrder: WorkOrder

  @Column({ type: 'enum', enum: EvidenceStage })
  stage: EvidenceStage  // 'before'|'during'|'after'|'device'|'other'

  @Column() url: string
  @Column({ nullable: true }) thumbnailUrl: string
  @Column({ type: 'decimal', nullable: true }) latitude: number
  @Column({ type: 'decimal', nullable: true }) longitude: number
  @Column({ nullable: true }) takenAt: Date
  @Column({ nullable: true }) fileSize: number
  @CreateDateColumn() uploadedAt: Date
}
```

#### `referral.entity.ts`
```typescript
@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column() referrerId: string
  @ManyToOne(() => User) referrer: User
  @Column() referredId: string
  @ManyToOne(() => User) referred: User
  @Column({ unique: true }) code: string

  @Column({ type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDING })
  status: ReferralStatus  // 'pending'|'active'|'rewarded'

  @Column({ nullable: true }) firstOtCompletedAt: Date
  @Column({ default: 0 }) pointsGranted: number
  @CreateDateColumn() createdAt: Date
}
```

#### `points-log.entity.ts`
```typescript
@Entity('points_log')
export class PointsLog {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column() userId: string
  @ManyToOne(() => User) user: User
  @Column() delta: number           // positivo o negativo
  @Column() reason: string          // descripción legible
  @Column({ nullable: true }) referenceId: string  // OT id, KB id, referral id
  @Column() scoreAfter: number      // puntos totales después del evento
  @CreateDateColumn() createdAt: Date
}
```

#### `kb-entry.entity.ts`
```typescript
@Entity('kb_entries')
export class KbEntry {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column({ type: 'enum', enum: KbType })
  type: KbType  // 'motor_cut'|'device_config'|'known_issue'|'install_guide'

  @Column() title: string

  // Vehículo (para motor_cut e install_guide)
  @Column({ nullable: true }) vehicleBrand: string
  @Column({ nullable: true }) vehicleModel: string
  @Column({ nullable: true }) yearFrom: number
  @Column({ nullable: true }) yearTo: number

  // Dispositivo (para device_config)
  @Column({ nullable: true }) deviceBrand: string
  @Column({ nullable: true }) deviceModel: string
  @Column({ nullable: true }) operator: string  // operadora para APNs

  @Column({ type: 'jsonb' }) content: Record<string, any>  // estructura flexible por tipo
  @Column({ type: 'jsonb', default: [] }) photos: string[]

  @Column() authorId: string
  @ManyToOne(() => User) author: User

  @Column({ type: 'enum', enum: KbStatus, default: KbStatus.PENDING })
  status: KbStatus  // 'draft'|'pending'|'approved'|'rejected'

  @Column({ nullable: true }) approvedBy: string

  @Column({ default: 0 }) useCount: number
  @Column({ default: 0 }) voteCount: number
  @Column({ type: 'decimal', default: 0 }) ratingAvg: number

  @Column({ default: 'MX' }) country: string

  @CreateDateColumn() createdAt: Date
  @UpdateDateColumn() updatedAt: Date
}
```

---

### 18.7 Endpoints API — referencia completa

#### Auth
```
POST   /auth/register          — registro por referido (sin auth)
POST   /auth/verify-sms        — verificar código SMS de 6 dígitos
POST   /auth/resend-sms        — reenviar código
POST   /auth/login             — login con teléfono + PIN
POST   /auth/refresh           — refresh token
POST   /auth/logout            — invalidar refresh token
PUT    /auth/fcm-token         — actualizar token FCM para push
```

#### Users
```
GET    /users/me               — perfil propio (auth)
PUT    /users/me               — actualizar perfil
GET    /users/:id/public       — perfil público (sin auth)
GET    /users/me/referral-code — obtener mi código de referido
GET    /users/me/referrals     — mis referidos y estado
GET    /referrals/validate/:code — validar código antes de registro (sin auth)
```

#### Work Orders
```
GET    /work-orders            — mis OTs paginadas (auth)
POST   /work-orders            — crear OT nueva
GET    /work-orders/:id        — detalle OT
PUT    /work-orders/:id        — actualizar OT
POST   /work-orders/:id/close  — cerrar OT (requiere mín. 2 fotos + firma)
DELETE /work-orders/:id        — cancelar OT (solo si draft)
GET    /work-orders/:id/pdf    — generar PDF del reporte
POST   /work-orders/:id/share  — generar/obtener link público
```

#### Evidencias
```
POST   /evidences/upload       — subir foto con geotag (multipart/form-data)
DELETE /evidences/:id          — eliminar evidencia (solo OT en draft)
```

#### OT Pública (sin auth)
```
GET    /public/ot/:slug        — vista pública del reporte
GET    /public/ot/:slug/pdf    — descargar PDF
GET    /public/profile/:code   — perfil público del técnico
```

#### Gamificación
```
GET    /gamification/me        — mis puntos, nivel, score, badges
GET    /gamification/me/log    — historial de puntos
GET    /gamification/levels    — catálogo de niveles y requisitos
GET    /gamification/badges    — todos los badges disponibles
```

#### Base de conocimiento
```
GET    /kb                     — buscar entradas (query params: q, type, brand, model, country)
GET    /kb/:id                 — detalle de entrada
POST   /kb                     — crear nueva entrada (auth, nivel >= verificado)
PUT    /kb/:id                 — editar entrada (solo autor o senior+)
POST   /kb/:id/vote            — votar utilidad
POST   /kb/:id/approve         — aprobar entrada (solo senior/elite/admin)
POST   /kb/:id/use             — registrar uso (para contar useCount)
GET    /kb/offline-cache       — últimas 50 entradas para cache offline
```

#### Notificaciones
```
GET    /notifications          — mis notificaciones
PUT    /notifications/:id/read — marcar como leída
```

---

### 18.8 Reglas de negocio críticas — implementar exactamente así

#### Registro por referido
```
1. El endpoint POST /auth/register requiere referralCode en el body.
2. Validar que el código existe en la tabla referrals/users.referralCode.
3. Si el código no existe → error 400 "Código de referido inválido".
4. Crear el usuario con status phoneVerified = false.
5. Enviar SMS con Twilio Verify.
6. Crear el registro en tabla referrals con status = 'pending'.
7. El referidor NO suma puntos en este momento.
```

#### Activación del referido
```
1. Cuando el técnico cierra su primera OT con status = 'completed':
2. Buscar en referrals donde referred_id = técnico.id y status = 'pending'.
3. Actualizar referral.status = 'active', referral.firstOtCompletedAt = now().
4. Calcular bonos escalonados:
   - Referidos activos del referidor: 1 → +20 pts
   - Referidos activos del referidor: 3 → +35 pts
   - Referidos activos del referidor: 5 → +60 pts
5. Llamar a GamificationService.addPoints(referrerId, puntos, 'referral_activated', referral.id).
6. Actualizar referral.status = 'rewarded', referral.pointsGranted = puntos.
7. Enviar push notification al referidor: "¡Tu referido completó su primera instalación! +N puntos"
```

#### Cierre de OT — validaciones
```
Antes de permitir status = 'completed':
1. Contar evidences donde workOrderId = ot.id → mínimo 2 fotos requeridas.
2. Verificar que clientSignatureUrl no sea null → firma obligatoria.
3. Si alguna validación falla → error 422 con mensaje específico.
4. Si pasa → status = 'completed', completedAt = now().
5. Generar slug único: shortUUID() → guardar en ot.slug.
6. Llamar a GamificationService.onWorkOrderCompleted(technician.id, ot.id).
7. Si el técnico tiene referral activo con 0 OTs → llamar a activateReferral().
```

#### Puntos por OT completada
```typescript
// GamificationService.onWorkOrderCompleted(userId, workOrderId)
// Sumar puntos en este orden:
const points = []
points.push({ delta: 5, reason: 'OT completada con evidencias' })

const hasSignature = workOrder.clientSignatureUrl !== null
if (hasSignature) points.push({ delta: 10, reason: 'Firma del cliente obtenida' })

const isFirstOfMonth = await this.isFirstOtOfMonth(userId)
if (isFirstOfMonth) points.push({ delta: 15, reason: 'Primera OT del mes' })

const streak = await this.getConsecutiveStreak(userId)
if (streak > 0 && streak % 10 === 0) {
  points.push({ delta: 50, reason: `${streak} OTs consecutivas sin rechazo` })
}

for (const p of points) {
  await this.addPoints(userId, p.delta, p.reason, workOrderId)
}
await this.recalculateLevel(userId)
```

#### Activity Score — decay diario (CRON)
```typescript
// Ejecutar cada día a las 00:00 (cron: '0 0 * * *')
// Para cada técnico con role = 'technician' y isMarketplaceVisible = true:

const daysSinceActivity = diffInDays(now, user.lastActivityAt)

let decay = 0
if (daysSinceActivity >= 30) {
  decay = 30
  // Ocultar del marketplace
  user.isMarketplaceVisible = false
  // Push: "Tu perfil está oculto. 1 OT te reactiva."
} else if (daysSinceActivity >= 21) {
  decay = 20
  // Push: "Estás a X puntos de perder tu nivel"
} else if (daysSinceActivity >= 14) {
  decay = 12
  // Push: "Tu score bajó. Registra una OT para mantener tu posición."
} else if (daysSinceActivity >= 7) {
  decay = 5
}

if (decay > 0) {
  user.activityScore = Math.max(0, user.activityScore - decay)
  await this.usersRepo.save(user)
}
```

#### Cálculo de nivel por puntos
```typescript
function calculateLevel(totalPoints: number): UserLevel {
  if (totalPoints >= 1000) return UserLevel.ELITE
  if (totalPoints >= 500)  return UserLevel.SENIOR
  if (totalPoints >= 200)  return UserLevel.PRO
  if (totalPoints >= 50)   return UserLevel.VERIFICADO
  return UserLevel.NOVATO
}
// Llamar cada vez que se agregan puntos.
// Si el nivel sube → enviar push notification + badge de subida de nivel.
```

---

### 18.9 Upload de fotos — flujo con Cloudflare R2

```typescript
// EvidencesService.uploadEvidence(file, metadata)
// 1. Recibir multipart/form-data con:
//    - file: imagen (jpeg/png, max 10MB)
//    - workOrderId: string
//    - stage: EvidenceStage
//    - latitude: number
//    - longitude: number
//    - takenAt: ISO string (timestamp del dispositivo)

// 2. Validar que la OT existe y pertenece al técnico autenticado.
// 3. Validar que la OT no está cerrada (status !== 'completed').
// 4. Generar filename: `ot-${workOrderId}/${stage}-${uuid()}.jpg`
// 5. Subir a R2 usando AWS SDK v3 (S3-compatible):
//    - Bucket: process.env.R2_BUCKET_NAME
//    - ContentType: image/jpeg
//    - CacheControl: 'public, max-age=31536000'
// 6. Generar thumbnail (resize a 400px) y subir también.
// 7. Guardar en tabla evidences con todos los metadatos.
// 8. Actualizar user.lastActivityAt = now() (reactiva score).
// 9. Retornar la URL pública: `${R2_PUBLIC_URL}/${filename}`
```

---

### 18.10 PDF del reporte de OT

```typescript
// ReportsService.generateOtPdf(slug: string): Buffer
// Usar @react-pdf/renderer con este layout:

// Secciones del PDF (en orden):
// 1. Header: logo TechField GPS + nombre empresa (si workspace) + fecha
// 2. Badge "Instalación verificada" con QR del link público
// 3. Sección técnico: foto (avatar), nombre, nivel, zona, rating
// 4. Sección vehículo: marca/modelo/año, placa, color
// 5. Sección dispositivo: marca/modelo, IMEI parcial (ocultar últimos 5), SIM, plataforma
// 6. Galería de evidencias: grid 2 columnas, cada foto con badge de etapa y timestamp
// 7. Firma del cliente: recuadro con imagen de firma + nombre + fecha
// 8. Mapa estático: usar Mapbox Static Images API con el pin de la ubicación
// 9. Footer: "Verificado por TechField GPS" + URL + fecha de generación

// El PDF se genera on-demand (no se guarda), se devuelve como Buffer.
// Cache: guardar hash del PDF en Redis con TTL 1h para no regenerar.
```

---

### 18.11 App móvil Ionic — flujo de nueva OT (multi-step)

```
La pantalla de Nueva OT tiene 4 pasos con stepper visual en el header:

PASO 1 — Datos del trabajo
  Campos: tipo (tabs: Instalación/Revisión/Soporte/Config/Corte)
          cliente nombre, cliente teléfono
          vehículo: marca (con autocomplete de BD), modelo, año, placa, color
          notas técnicas (textarea opcional)
  Guardar en SQLite local como draft (offline-first).
  Botón "Continuar →"

PASO 2 — Dispositivo GPS
  Campos: dispositivo marca, modelo
          IMEI (input con validación de 15 dígitos)
          SIM, operadora (select: Telcel/AT&T/Movistar/Claro/Tigo/Otro)
          plataforma GPS (texto libre con sugerencias)
  Al ingresar marca+modelo → buscar en KB si hay config disponible (snackbar informativo).
  Botón "Continuar →"

PASO 3 — Evidencias
  Mostrar requerimientos: "2 fotos mínimo requeridas"
  Grid de slots: Antes (requerida) | Durante (opcional) | Después (requerida) | Dispositivo | Extra
  Cada slot: botón cámara → Capacitor Camera → geotag automático → preview
  Contador: "2/2 requeridas ✓"
  Botón "Continuar →" (deshabilitado hasta cubrir mínimos)

PASO 4 — Firma del cliente
  Instrucción: "Pide al cliente que firme en pantalla"
  Canvas de firma (signature_pad o similar)
  Nombre del cliente (pre-llenado del paso 1)
  Botón "Limpiar" + "Confirmar firma"
  Al confirmar → guardar como PNG → subir a R2
  Botón "Completar OT ✓"

AL COMPLETAR:
  1. POST /work-orders/:id/close
  2. Loading con mensaje "Generando tu reporte..."
  3. Toast de éxito con confetti animation (Lottie)
  4. Pantalla de éxito con:
     - "¡OT completada! +15 puntos"
     - Botón "Compartir con cliente" → navigator.share() con el link
     - Botón "Ver reporte"
```

---

### 18.12 Offline mode — SQLite + sync queue

```typescript
// StorageService (Ionic) — usar @capacitor-community/sqlite

// Al crear/actualizar una OT sin conexión:
// 1. Guardar en SQLite local con id temporal (local-uuid)
// 2. Guardar en tabla sync_queue: { action, endpoint, payload, createdAt, attempts }
// 3. Mostrar indicador "Sin conexión — guardado localmente"

// SyncService — ejecutar al recuperar conexión (@capacitor/network Network.addListener)
// 1. Leer todos los items de sync_queue ordenados por createdAt
// 2. Para cada item: hacer la petición HTTP
//    - Si 200: eliminar de sync_queue, actualizar id local → id servidor
//    - Si 4xx: eliminar (error de datos, no reintentar)
//    - Si 5xx o timeout: incrementar attempts, si attempts > 3 → marcar como failed
// 3. Para fotos: subir en background con progreso visible

// KB offline cache:
// Al abrir la app → GET /kb/offline-cache → guardar en SQLite
// Búsqueda primero en SQLite, luego API si hay conexión
```

---

### 18.13 Diseño de la app móvil — instrucciones para Claude Code

```
Usar el design system definido en techfield_design_system.html como referencia visual.

REGLAS DE UI para la app Ionic:
- Tema: dark mode obligatorio (variables CSS definidas en el design system)
- Fuente: Sora (importar de Google Fonts en global.scss)
- Color primario: #00C47D (variable: --tf-green)
- Fondo base: #080C12 (variable: --tf-bg)
- Fondo cards: #0D1320 (variable: --tf-bg2)
- Iconos: Phosphor Icons (npm install phosphor-icons)
- Border radius cards: 16px
- Animaciones: usar @ionic/animations para transiciones entre páginas
- Feedback de éxito: Lottie animation de confetti al cerrar OT
- Bottom tabs: 4 tabs → Home | OTs | KB | Perfil
- Skeleton loaders en todas las listas mientras cargan datos

COMPONENTES COMPARTIDOS a crear en shared/components:
- TfCardComponent — card con bg2, border, radius
- TfBadgeComponent — pill coloreado según variante (green/blue/amber/purple)
- TfScoreGaugeComponent — gauge circular SVG animado para el Activity Score
- TfLevelBarComponent — barra de progreso con gradiente verde
- TfAvatarComponent — círculo con iniciales y color de nivel
- TfSkeletonComponent — placeholder animado

PANTALLA HOME — elementos requeridos:
1. Header con saludo + nombre del técnico + avatar
2. TfScoreGaugeComponent con score actual + estado (Destacado/Activo/Inactivo)
3. TfLevelBarComponent con nivel actual + pts para el siguiente
4. Grid 2x2 con stats: OTs este mes, Puntos totales, Rating promedio, Referidos
5. Sección "Hoy" con lista de OTs del día en tarjetas horizontales scrollables
6. FAB (Floating Action Button) verde en bottom-right: "+" → Nueva OT
```

---

### 18.14 Orden de construcción recomendado para Claude Code

Seguir exactamente este orden. Cada paso depende del anterior:

```
SPRINT 1 — Base (días 1-4)
  1. Setup monorepo con npm workspaces
  2. Docker Compose (postgres + api)
  3. NestJS: app.module, config, database connection
  4. TypeORM: todas las entidades + migraciones iniciales
  5. Seed de datos básicos (niveles, catálogo de badges)

SPRINT 2 — Auth (días 5-8)
  6. Users module (entidad + service básico)
  7. Auth: POST /auth/register (con referralCode)
  8. Twilio SMS: envío de verificación
  9. Auth: POST /auth/verify-sms
  10. Auth: POST /auth/login + JWT guards
  11. Auth: refresh token flow
  12. PUT /auth/fcm-token

SPRINT 3 — Referidos y perfiles (días 9-11)
  13. Referrals module: validar código, crear referral
  14. GET /users/me + PUT /users/me
  15. GET /referrals/validate/:code (sin auth)
  16. GET /users/:id/public
  17. Generar referralCode único al crear usuario

SPRINT 4 — OTs y evidencias (días 12-17)
  18. WorkOrders module: CRUD básico
  19. Storage service: upload a R2 (S3 SDK)
  20. Evidences module: upload con geotag
  21. POST /work-orders/:id/close (con validaciones)
  22. Generación de slug al cerrar OT

SPRINT 5 — Gamificación (días 18-21)
  23. GamificationService: addPoints, recalculateLevel
  24. Evento onWorkOrderCompleted: suma de puntos
  25. Evento onReferralActivated: bonus escalonados
  26. Score decay: cron job diario con @nestjs/schedule
  27. Notifications service: FCM push para eventos de score

SPRINT 6 — Link público y PDF (días 22-25)
  28. Public module: GET /public/ot/:slug
  29. PDF generation con @react-pdf/renderer
  30. Next.js: página /ot/[slug] (SSR)
  31. OG tags para preview en WhatsApp

SPRINT 7 — Base de conocimiento (días 26-30)
  32. KB module: CRUD + búsqueda full-text (pg_trgm)
  33. KB: flujo de verificación (pending → approved)
  34. KB: votos y rating
  35. Seed de 30 entradas iniciales (Hilux, NP300, APNs)
  36. Endpoint offline-cache

SPRINT 8 — App Ionic (días 31-45)
  37. Setup Ionic + Capacitor + Angular
  38. Core services: AuthService, ApiService, StorageService
  39. Páginas auth: Welcome, Register, VerifySMS
  40. Shared components: TfCard, TfBadge, TfScoreGauge, TfLevelBar
  41. Página Home con dashboard completo
  42. Páginas OTs: List, New (4 pasos), Detail
  43. Firma digital: canvas + guardar PNG
  44. Captura de foto con geotag (Capacitor Camera + Geolocation)
  45. Offline mode: SQLite + sync queue
  46. Páginas KB: Search, Detail, Contribute
  47. Página Perfil: CV elegante + Referidos + Rewards básico
  48. Push notifications: FCM + Capacitor PushNotifications

SPRINT 9 — Pulido (días 46-50)
  49. Animaciones Lottie: confetti al completar OT, subida de nivel
  50. Skeleton loaders en todas las listas
  51. Error handling global + Sentry
  52. Play Store: generar APK + preparar listing
  53. Landing page básica techfieldgps.com
  54. Admin panel mínimo (ver técnicos, OTs, aprobar KB)
```

---

### 18.15 Comandos de inicio rápido

```bash
# Clonar y arrancar
git clone https://github.com/loggier/techfield-gps
cd techfield-gps

# Levantar infraestructura
docker-compose up -d

# Instalar dependencias API
cd apps/api && npm install

# Copiar env
cp .env.example .env
# → editar .env con tus credenciales

# Correr migraciones
npm run migration:run

# Seed datos iniciales (niveles, badges, KB inicial)
npm run seed

# Dev mode
npm run start:dev

# Instalar dependencias app móvil
cd ../mobile && npm install

# Dev mode Ionic
ionic serve

# Build para Android
ionic capacitor build android
```

---

### 18.16 Tests mínimos requeridos (E2E críticos)

```typescript
// auth.e2e-spec.ts
describe('Auth flow', () => {
  it('should reject register without referral code')
  it('should reject register with invalid referral code')
  it('should register with valid referral code and send SMS')
  it('should verify SMS and return JWT')
  it('should login with phone and return JWT')
})

// work-orders.e2e-spec.ts
describe('Work order flow', () => {
  it('should create work order as draft')
  it('should reject close without 2 evidences')
  it('should reject close without signature')
  it('should close with all requirements and generate slug')
  it('should add points on close')
  it('should activate referral on first OT close')
})

// gamification.e2e-spec.ts
describe('Gamification', () => {
  it('should calculate level correctly by points thresholds')
  it('should decay activity score after 7 days inactivity')
  it('should hide profile after 30 days inactivity')
  it('should restore visibility on new OT')
})
```

---

### 18.17 Notas finales para Claude Code

1. **Siempre validar** que el técnico autenticado sea el dueño de la OT antes de modificarla.
2. **Nunca exponer** el IMEI completo en las vistas públicas — mostrar solo los primeros 10 dígitos + `•••••`.
3. **Todos los uploads** de fotos van directamente a R2 desde el backend — nunca desde el frontend directo.
4. **El referralCode** del usuario es único, generado con `shortUUID()` al crear la cuenta, no modificable.
5. **La tabla `points_log`** es append-only — nunca actualizar ni eliminar registros, solo insertar.
6. **Activity Score** se calcula en el backend (cron), nunca en el frontend.
7. **El slug de OT** se genera una sola vez al cerrar — no se puede regenerar ni cambiar.
8. **Modo offline**: si el técnico intenta cerrar una OT sin conexión, encolar en SQLite y sincronizar al reconectar.
9. **FCM token**: actualizarlo cada vez que el usuario abre la app (puede cambiar).
10. **Nunca pedir RFC, CLABE ni datos fiscales** en el registro del técnico — eso va en Fase 3.

---

*Fin del documento · TechField GPS Master Spec v1.0 · Vemontech 2026*
