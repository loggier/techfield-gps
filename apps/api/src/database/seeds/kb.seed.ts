import { DataSource } from 'typeorm';
import { KbEntry } from '../../knowledge-base/entities/kb-entry.entity';
import { User } from '../../users/entities/user.entity';
import { KbStatus, KbType } from '@techfield/types';

export async function seedKb(ds: DataSource) {
  const kbRepo = ds.getRepository(KbEntry);
  const usersRepo = ds.getRepository(User);

  const admin = await usersRepo.findOne({ where: { referralCode: 'VEMON01' } });
  if (!admin) {
    console.warn('Admin user not found — run platform-admin seed first');
    return;
  }

  const existing = await kbRepo.count();
  if (existing > 0) {
    console.log(`KB already seeded (${existing} entries) — skipping`);
    return;
  }

  const entries: Partial<KbEntry>[] = [

    // ── Cortes de motor — Toyota Hilux ──────────────────────────────────────
    {
      type: KbType.MOTOR_CUT,
      title: 'Corte de motor Toyota Hilux 2016-2023 — relé 80A en caja de fusibles',
      vehicleBrand: 'Toyota', vehicleModel: 'Hilux', yearFrom: 2016, yearTo: 2023,
      content: {
        relay_location: 'Caja de fusibles bajo capó, fila superior derecha, relé de 80A identificado como ALT',
        wire_to_cut: 'Cable verde con franja blanca (pin 87 del relé)',
        steps: [
          'Localizar caja de fusibles lado conductor bajo capó',
          'Identificar relé ALT de 80A en fila superior derecha',
          'Conectar salida del GPS al pin 87 del relé (cable verde/blanco)',
          'Probar corte: el motor debe apagarse en menos de 3 segundos',
        ],
        warnings: ['No cortar cable rojo principal (batería directa)', 'Verificar que el vehículo esté detenido antes de probar'],
        tested_by: 'TechField GPS',
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 142, voteCount: 38, ratingAvg: 4.8, country: 'MX',
    },
    {
      type: KbType.MOTOR_CUT,
      title: 'Corte de motor Toyota Hilux 2012-2015 — fusible caja interior',
      vehicleBrand: 'Toyota', vehicleModel: 'Hilux', yearFrom: 2012, yearTo: 2015,
      content: {
        relay_location: 'Caja de fusibles interior lado copiloto, panel inferior',
        wire_to_cut: 'Cable amarillo 10A (circuito de arranque)',
        steps: [
          'Abrir panel interior lado copiloto',
          'Localizar fusible 10A marcado como IGN',
          'Interceptar cable amarillo después del fusible',
          'Conectar relé del GPS en serie con el cable interceptado',
        ],
        warnings: ['Modelo 2012-2013 usa cable azul en lugar de amarillo'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 89, voteCount: 22, ratingAvg: 4.6, country: 'MX',
    },

    // ── Cortes de motor — Nissan NP300 ──────────────────────────────────────
    {
      type: KbType.MOTOR_CUT,
      title: 'Corte de motor Nissan NP300 Frontier 2016-2023 — relé en módulo ECU',
      vehicleBrand: 'Nissan', vehicleModel: 'NP300 Frontier', yearFrom: 2016, yearTo: 2023,
      content: {
        relay_location: 'Módulo ECU bajo asiento del conductor, conector C2 pin 14',
        wire_to_cut: 'Cable blanco con franja roja — señal de arranque principal',
        steps: [
          'Retirar asiento conductor para acceder al módulo ECU',
          'Localizar conector C2 (conector gris de 22 pines)',
          'Identificar pin 14 — cable blanco/rojo',
          'Instalar relé GPS en el circuito, NO cortar el cable permanentemente',
        ],
        warnings: ['ECU sensible a descargas estáticas — usar pulsera antiestática', 'Modelo 2020+ tiene módulo adicional de inmovilizador'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 115, voteCount: 30, ratingAvg: 4.7, country: 'MX',
    },
    {
      type: KbType.MOTOR_CUT,
      title: 'Corte de motor Nissan NP300 2008-2015 — método fusible caja motor',
      vehicleBrand: 'Nissan', vehicleModel: 'NP300', yearFrom: 2008, yearTo: 2015,
      content: {
        relay_location: 'Caja de fusibles bajo capó lado izquierdo, fusible 15A FUEL',
        wire_to_cut: 'Cable azul/blanco circuito bomba de combustible',
        steps: [
          'Localizar caja fusibles bajo capó lado conductor',
          'Identificar fusible 15A etiquetado FUEL PUMP',
          'Instalar relé normalmente cerrado en serie',
          'Conectar control del GPS al bobinado del relé (85-86)',
        ],
        warnings: ['Asegurarse de usar relé de 20A mínimo para bombas de alta presión'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 78, voteCount: 19, ratingAvg: 4.5, country: 'MX',
    },

    // ── Cortes de motor — Ford Ranger ───────────────────────────────────────
    {
      type: KbType.MOTOR_CUT,
      title: 'Corte de motor Ford Ranger 2019-2023 — BCM bajo tablero',
      vehicleBrand: 'Ford', vehicleModel: 'Ranger', yearFrom: 2019, yearTo: 2023,
      content: {
        relay_location: 'BCM (Body Control Module) bajo tablero lado conductor, conector C1',
        wire_to_cut: 'Cable gris oscuro pin C1-8 señal de arranque',
        steps: [
          'Acceder al BCM retirando panel inferior tablero conductor',
          'Identificar conector C1 (conector negro 32 pines)',
          'Localizar pin 8 cable gris oscuro',
          'Instalar relé normalmente cerrado en serie',
        ],
        warnings: ['Ranger 2022+ incluye sistema FordPass que puede interferir — consultar manual'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 67, voteCount: 15, ratingAvg: 4.4, country: 'MX',
    },

    // ── Cortes de motor — Chevrolet ─────────────────────────────────────────
    {
      type: KbType.MOTOR_CUT,
      title: 'Corte de motor Chevrolet Silverado 2014-2020 — relé bajo tablero',
      vehicleBrand: 'Chevrolet', vehicleModel: 'Silverado', yearFrom: 2014, yearTo: 2020,
      content: {
        relay_location: 'Panel de fusibles interior lado conductor, cuarta fila desde arriba',
        wire_to_cut: 'Cable verde/amarillo 15A circuito de encendido',
        steps: [
          'Abrir panel de fusibles interior lado conductor',
          'Localizar relé de encendido (identificado en diagrama del tapa)',
          'Interceptar cable verde/amarillo con relé GPS',
          'Asegurar todas las conexiones con cinta automotriz de alta temperatura',
        ],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 54, voteCount: 12, ratingAvg: 4.3, country: 'MX',
    },

    // ── Configuración de APNs — Telcel ──────────────────────────────────────
    {
      type: KbType.DEVICE_CONFIG,
      title: 'APN Telcel para GPS — configuración estándar y con autenticación',
      operator: 'Telcel',
      content: {
        apn: 'internet.itelcel.com',
        username: 'webgprs',
        password: 'webgprs2002',
        apn_type: 'default,supl',
        proxy: '',
        port: '',
        server: '',
        mmsc: '',
        notes: 'Válido para SIMs Telcel prepago y postpago. Si falla, probar APN "isp.telcel.com" sin usuario/contraseña.',
        tested_devices: ['Concox GT06N', 'Coban TK303', 'Teltonika FMB920'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 210, voteCount: 55, ratingAvg: 4.9, country: 'MX',
    },
    {
      type: KbType.DEVICE_CONFIG,
      title: 'APN Telcel M2M para GPS — SIM dedicada IoT',
      operator: 'Telcel',
      content: {
        apn: 'm2m.telcel.com',
        username: '',
        password: '',
        notes: 'Solo para SIMs M2M empresariales contratadas con Telcel Business. Tarifa plana sin límite de datos.',
        tested_devices: ['Queclink GV300', 'Teltonika FMB130'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 88, voteCount: 20, ratingAvg: 4.7, country: 'MX',
    },

    // ── Configuración de APNs — AT&T ─────────────────────────────────────
    {
      type: KbType.DEVICE_CONFIG,
      title: 'APN AT&T México para GPS — configuración completa',
      operator: 'AT&T',
      content: {
        apn: 'internet.att.com.mx',
        username: 'att',
        password: 'att2017',
        apn_type: 'default,supl',
        notes: 'Para SIMs AT&T prepago y postpago México. Si la SIM es corporativa usar APN "m2m.att.mx".',
        tested_devices: ['Concox GT06N', 'Coban TK103B', 'Meitrack T366G'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 165, voteCount: 42, ratingAvg: 4.8, country: 'MX',
    },
    {
      type: KbType.DEVICE_CONFIG,
      title: 'APN AT&T M2M para dispositivos IoT/GPS empresarial',
      operator: 'AT&T',
      content: {
        apn: 'm2m.att.mx',
        username: '',
        password: '',
        notes: 'Exclusivo para SIMs M2M AT&T Business. Requiere activación previa en portal empresarial.',
        tested_devices: ['Teltonika FMB920', 'Queclink GV500'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 72, voteCount: 18, ratingAvg: 4.6, country: 'MX',
    },

    // ── Configuración de APNs — Movistar ────────────────────────────────────
    {
      type: KbType.DEVICE_CONFIG,
      title: 'APN Movistar México para GPS',
      operator: 'Movistar',
      content: {
        apn: 'internet.movistar.mx',
        username: 'movistar',
        password: 'movistar',
        apn_type: 'default,supl',
        notes: 'Para SIMs Movistar prepago y postpago. Señal más débil en zonas rurales.',
        tested_devices: ['Concox AT4', 'Coban TK303'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 98, voteCount: 25, ratingAvg: 4.5, country: 'MX',
    },

    // ── Configuración de APNs — Claro ───────────────────────────────────────
    {
      type: KbType.DEVICE_CONFIG,
      title: 'APN Claro para GPS — Colombia, México, Perú',
      operator: 'Claro',
      content: {
        apn: 'internet.comcel.com.co',
        username: 'comcel',
        password: 'comcel',
        apn_mexico: 'internet.claro.com.mx',
        apn_peru: 'internet.claro.com.pe',
        notes: 'APN varía por país. Usar el correspondiente según SIM contratada.',
        tested_devices: ['Concox GT06N', 'Teltonika FMB920'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 83, voteCount: 21, ratingAvg: 4.4, country: 'MX',
    },

    // ── Configuración de APNs — Tigo ────────────────────────────────────────
    {
      type: KbType.DEVICE_CONFIG,
      title: 'APN Tigo para GPS — Guatemala, Honduras, Colombia',
      operator: 'Tigo',
      content: {
        apn_guatemala: 'internet.tigo.gt',
        apn_honduras: 'internet.tigo.hn',
        apn_colombia: 'web.colombiamovil.com.co',
        username: '',
        password: '',
        notes: 'No requiere autenticación en la mayoría de los países. Verificar en portal Tigo si la SIM tiene datos activos.',
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 61, voteCount: 14, ratingAvg: 4.3, country: 'GT',
    },

    // ── Guías de instalación ─────────────────────────────────────────────────
    {
      type: KbType.INSTALL_GUIDE,
      title: 'Guía de instalación Concox GT06N — paso a paso completo',
      deviceBrand: 'Concox', deviceModel: 'GT06N',
      content: {
        power_voltage: '9-36V DC',
        wiring: {
          red: 'VCC (alimentación positiva)',
          black: 'GND (masa negativa)',
          yellow: 'IGN (señal de encendido ACC)',
          white: 'Salida relé corte de motor (normalmente cerrado)',
          green: 'Entrada digital 1 (botón de pánico)',
        },
        antenna_placement: 'Antena GPS en techo o salpicadero con vista al cielo. Antena GSM alejada mínimo 10cm del GPS.',
        config_sms: [
          'FACTORYRESET# — Resetear a fábrica',
          'APN,internet.itelcel.com,webgprs,webgprs2002# — Configurar APN Telcel',
          'ADMINIP,0,IP_SERVIDOR,PUERTO# — Configurar servidor GPS',
          'GPRSSET,30# — Intervalo de reporte cada 30 segundos',
          'RELAY,1# — Activar relé (corte de motor)',
          'RELAY,0# — Desactivar relé (restaurar motor)',
        ],
        led_indicators: {
          red: 'Parpadeo lento = buscando red GSM, Parpadeo rápido = GPS sin señal, Encendido fijo = operando normal',
          blue: 'Apagado = sin datos, Parpadeo = transmitiendo datos',
        },
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 195, voteCount: 51, ratingAvg: 4.9, country: 'MX',
    },
    {
      type: KbType.INSTALL_GUIDE,
      title: 'Guía de instalación Teltonika FMB920 — configuración con Codec8',
      deviceBrand: 'Teltonika', deviceModel: 'FMB920',
      content: {
        power_voltage: '10-30V DC, consumo 90mA en reposo',
        wiring: {
          red: 'VCC 10-30V',
          black: 'GND',
          yellow: 'Digital input 1 (IGN)',
          white: 'Digital output 1 (relé corte)',
        },
        config_tool: 'Teltonika Configurator (descarga en teltonika-gps.com)',
        codec: 'Codec8 Extended recomendado para mejor resolución de datos',
        key_params: {
          'Data Acquisition Mode': 'High Quality',
          'Min Period': '30 segundos en movimiento',
          'Min Saved Records': '1',
          'Send Period': '120 segundos',
        },
        firmware_update: 'Actualizar firmware a versión mínima 03.27 para soporte completo Codec8E',
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 134, voteCount: 35, ratingAvg: 4.7, country: 'MX',
    },
    {
      type: KbType.INSTALL_GUIDE,
      title: 'Guía de instalación Queclink GV300 — configuración completa',
      deviceBrand: 'Queclink', deviceModel: 'GV300',
      content: {
        power_voltage: '9-36V DC',
        wiring: {
          red_16awg: 'VCC positivo (fusible 3A en línea recomendado)',
          black_16awg: 'GND negativo',
          orange: 'IGN/ACC señal de encendido',
          white: 'Output 1 (relé corte)',
          green: 'Input 1 (botón pánico)',
        },
        apn_command: '+GTBSI=queclink,APN,USER,PASS,,,,,0000$',
        server_command: '+GTFRI=queclink,1,,,,,,,SERVER_IP,SERVER_PORT,,,,,,0000$',
        report_interval: '+GTFRI=queclink,1,,,,30,,60,,,,,,,,,0000$ (30s movimiento, 60s estático)',
        output_control: '+GTOUT=queclink,1,0,1,,0000$ (corte activo) / +GTOUT=queclink,1,0,0,,0000$ (restaurar)',
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 102, voteCount: 27, ratingAvg: 4.6, country: 'MX',
    },

    // ── Problemas conocidos ──────────────────────────────────────────────────
    {
      type: KbType.KNOWN_ISSUE,
      title: 'GT06N pierde señal GPS en Hilux 2018-2020 — solución blindaje',
      vehicleBrand: 'Toyota', vehicleModel: 'Hilux', yearFrom: 2018, yearTo: 2020,
      deviceBrand: 'Concox', deviceModel: 'GT06N',
      content: {
        symptom: 'GPS pierde señal en movimiento o reporta posición incorrecta en modelo Hilux 2018+',
        cause: 'El Hilux 2018+ tiene capas de metal adicionales en techo que interfieren con la señal GPS',
        solution: 'Usar antena GPS externa activa de 5 metros y colocarla en esquina trasera del techo o en plástico del espejo retrovisor',
        alternative: 'Instalar parche de aluminio como "reflector" debajo de la antena para mejorar recepción',
        verified: true,
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 76, voteCount: 19, ratingAvg: 4.6, country: 'MX',
    },
    {
      type: KbType.KNOWN_ISSUE,
      title: 'FMB920 no envía datos con APN AT&T — error GPRS context',
      deviceBrand: 'Teltonika', deviceModel: 'FMB920',
      operator: 'AT&T',
      content: {
        symptom: 'Dispositivo conecta a red GSM pero no transmite datos. LED azul apagado.',
        cause: 'Versiones de firmware menores a 03.25 tienen bug con autenticación CHAP requerida por AT&T México',
        solution: [
          'Actualizar firmware a versión 03.27 o superior desde Teltonika Configurator',
          'Configurar APN con autenticación PAP (no CHAP): internet.att.com.mx, user: att, pass: att2017',
          'En Configurator → GPRS → Auth Mode → seleccionar PAP',
        ],
        verified: true,
        reported_date: '2024-03',
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 58, voteCount: 16, ratingAvg: 4.7, country: 'MX',
    },
    {
      type: KbType.KNOWN_ISSUE,
      title: 'Coban TK303 falla corte de motor en camiones con alternador de alta carga',
      deviceBrand: 'Coban', deviceModel: 'TK303',
      content: {
        symptom: 'El relé interno del TK303 se quema al usarlo en camiones con alternador >150A',
        cause: 'Relé interno del TK303 soporta máximo 10A. Camiones pesados tienen picos de corriente de 30-50A en el circuito de arranque',
        solution: 'Nunca usar relé interno del TK303 para corte en vehículos pesados. Instalar relé externo de 30A y controlar desde el TK303',
        wiring_fix: 'Pin OUT del TK303 → bobina relé externo (85-86) → relé externo (87-30) en serie con circuito de arranque',
        verified: true,
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 93, voteCount: 24, ratingAvg: 4.8, country: 'MX',
    },
    {
      type: KbType.KNOWN_ISSUE,
      title: 'Nissan NP300 2020+ — inmovilizador electrónico bloquea corte GPS',
      vehicleBrand: 'Nissan', vehicleModel: 'NP300', yearFrom: 2020, yearTo: 2023,
      content: {
        symptom: 'Al activar el corte de motor, el vehículo no arranca incluso después de desactivar el corte',
        cause: 'El NP300 2020+ tiene módulo de inmovilizador que detecta interrupción en el circuito de arranque y activa un bloqueo de seguridad que requiere desactivación manual',
        solution: [
          'Instalar relé en el circuito de bomba de combustible en lugar del circuito de arranque',
          'Cable azul 10A en caja de fusibles bajo capó — circuito bomba de combustible',
          'Este método es más seguro y no activa el inmovilizador',
        ],
        verified: true,
        reported_date: '2024-01',
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 71, voteCount: 18, ratingAvg: 4.9, country: 'MX',
    },
    {
      type: KbType.KNOWN_ISSUE,
      title: 'GT06N reporta posición en océano (0,0) tras reseteo de fábrica',
      deviceBrand: 'Concox', deviceModel: 'GT06N',
      content: {
        symptom: 'Tras FACTORYRESET#, el dispositivo reporta latitud 0 longitud 0 (coordenadas nulas)',
        cause: 'El buffer de última posición no se limpia correctamente. El dispositivo necesita adquirir señal GPS nueva.',
        solution: [
          'Llevar el vehículo a espacio abierto con buena visibilidad del cielo',
          'Esperar 5-10 minutos con el motor encendido',
          'Si persiste, enviar comando FIXAT# para forzar actualización',
          'Verificar que la antena GPS esté bien conectada',
        ],
        workaround: 'Ignorar primeras 3 posiciones después de reseteo en la plataforma',
        verified: true,
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 85, voteCount: 22, ratingAvg: 4.5, country: 'MX',
    },

    // ── Más guías de instalación ─────────────────────────────────────────────
    {
      type: KbType.INSTALL_GUIDE,
      title: 'Guía de instalación Meitrack T366G — tracker 3G/4G con cámara',
      deviceBrand: 'Meitrack', deviceModel: 'T366G',
      content: {
        power_voltage: '9-36V DC',
        sim_type: 'Nano-SIM (4G LTE)',
        wiring: {
          red: 'VCC positivo (fusible 2A recomendado)',
          black: 'GND negativo',
          white: 'ACC/IGN señal de encendido',
          yellow: 'OUT1 (relé corte de motor)',
        },
        config_via: 'SMS o Meitrack Manager software',
        key_commands: [
          '0000,A10,APN,USER,PASS — configurar APN',
          '0000,A71,IP,PORT — configurar servidor',
          '0000,D05,1 — activar corte de motor',
          '0000,D05,0 — desactivar corte de motor',
        ],
        camera_notes: 'Cámara requiere almacenamiento microSD (hasta 32GB class 10). Configurar en Meitrack Manager.',
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 67, voteCount: 16, ratingAvg: 4.4, country: 'MX',
    },
    {
      type: KbType.INSTALL_GUIDE,
      title: 'Guía de instalación Coban TK103B — tracker básico popular',
      deviceBrand: 'Coban', deviceModel: 'TK103B',
      content: {
        power_voltage: '12-24V DC',
        wiring: {
          red: 'VCC positivo',
          black: 'GND',
          yellow: 'ACC/IGN',
          white: 'Relé corte (usar relé externo recomendado)',
          green: 'Entrada digital (botón SOS)',
        },
        apn_sms: 'APN,internet.itelcel.com,webgprs,webgprs2002#',
        server_sms: 'ADMINIP,0,IP,PUERTO#',
        track_interval: 'TIMER,30,30# (30 segundos)',
        important_note: 'TK103B sin letra B final no tiene relé interno. Verificar modelo exacto.',
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 148, voteCount: 39, ratingAvg: 4.3, country: 'MX',
    },

    // ── Más cortes de motor ──────────────────────────────────────────────────
    {
      type: KbType.MOTOR_CUT,
      title: 'Corte de motor VW Amarok 2013-2022 — módulo CAN bajo asiento',
      vehicleBrand: 'Volkswagen', vehicleModel: 'Amarok', yearFrom: 2013, yearTo: 2022,
      content: {
        relay_location: 'Módulo CAN Bus bajo asiento conductor',
        wire_to_cut: 'Cable marrón/rojo pin 7 conector T10 — señal de arranque CAN',
        steps: [
          'Retirar asiento conductor para acceder al módulo CAN',
          'Identificar conector T10 (10 pines) color negro',
          'Pin 7 cable marrón/rojo — señal de arranque',
          'IMPORTANTE: No cortar, usar relé normalmente cerrado en derivación',
        ],
        warnings: ['Amarok tiene sistema anti-theft adicional. Probar con motor en ralentí antes de activar corte', 'Modelos con cambio automático requieren verificar en transmisión neutralizada'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 55, voteCount: 13, ratingAvg: 4.5, country: 'MX',
    },
    {
      type: KbType.MOTOR_CUT,
      title: 'Corte de motor Isuzu D-Max 2015-2023 — fusible bomba combustible',
      vehicleBrand: 'Isuzu', vehicleModel: 'D-Max', yearFrom: 2015, yearTo: 2023,
      content: {
        relay_location: 'Caja de fusibles bajo capó lado conductor, fusible FUEL PUMP 20A',
        wire_to_cut: 'Cable verde/negro circuito bomba de combustible',
        steps: [
          'Localizar caja de fusibles bajo capó lado conductor',
          'Identificar fusible FUEL PUMP de 20A (posición F13 en diagrama)',
          'Interceptar cable verde/negro después del fusible',
          'Instalar relé normalmente cerrado en serie',
        ],
        warnings: ['D-Max 2020+ tiene dual bomba — verificar que ambos circuitos queden controlados'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 43, voteCount: 11, ratingAvg: 4.4, country: 'MX',
    },

    // ── Configuraciones adicionales ──────────────────────────────────────────
    {
      type: KbType.DEVICE_CONFIG,
      title: 'Comandos SMS universales para GPS basados en protocolo GT06 (Concox/Coban/clones)',
      content: {
        factory_reset: 'FACTORYRESET#',
        set_apn: 'APN,[apn],[user],[pass]#',
        set_server: 'ADMINIP,[n],[ip],[puerto]#',
        set_interval: 'TIMER,[seg],[seg]# (movimiento,estático)',
        enable_relay: 'RELAY,1#',
        disable_relay: 'RELAY,0#',
        get_position: 'GETLOC#',
        reboot: 'RESTART#',
        status: 'STATUS#',
        notes: 'Estos comandos funcionan en la mayoría de trackers chinos con protocolo GT06/JT701. Enviar desde número de teléfono administrador registrado.',
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 178, voteCount: 46, ratingAvg: 4.7, country: 'MX',
    },
    {
      type: KbType.DEVICE_CONFIG,
      title: 'Plataformas GPS gratuitas y de bajo costo para técnicos independientes',
      content: {
        platforms: [
          { name: 'Traccar', type: 'Open source, self-hosted', url: 'traccar.org', cost: 'Gratis (servidor propio)', protocols: '200+ protocolos' },
          { name: 'GPS-Server.net', type: 'SaaS', cost: '$5-15 USD/mes por vehículo', free_trial: '30 días' },
          { name: 'Wialon Hosting', type: 'SaaS premium', cost: 'Por unidad/mes', protocols: 'Teltonika nativo, 2000+ dispositivos' },
          { name: 'Flespi', type: 'API-first', cost: 'Freemium (100K mensajes gratis)', api: 'REST completa' },
        ],
        recommendation: 'Para técnicos independientes: Traccar self-hosted en VPS $5 USD/mes es la opción más económica y flexible.',
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 132, voteCount: 34, ratingAvg: 4.6, country: 'MX',
    },
    {
      type: KbType.INSTALL_GUIDE,
      title: 'Mejores prácticas de cableado para instalaciones GPS profesionales',
      content: {
        tools_required: ['Multímetro digital', 'Pelacables 18-22 AWG', 'Crimpadora', 'Cinta automotriz 3M', 'Conectores impermeables Posi-Tap', 'Sujetacables plásticos'],
        wire_gauge: {
          power: '16 AWG para VCC y GND principales',
          signal: '22 AWG para señales de ignición y digitales',
          relay_output: '18 AWG para salida de relé de corte',
        },
        routing_tips: [
          'Pasar cables por ductos existentes del vehículo — nunca a la intemperie',
          'Asegurar cables cada 20cm con sujetacables',
          'Dejar espacio de servicio: curvas holgadas sin tensión',
          'Etiqueta cada cable con cinta antes de conectar',
        ],
        power_connection: 'Tomar alimentación directamente de batería con fusible en línea (3A para GPS, 20A para relé)',
        ground_point: 'Buscar tornillo de chasis metálico original — nunca compartir tierra con audio o iluminación',
        waterproofing: 'Cubrir conectores expuestos con termoretráctil + silicona neutra',
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 167, voteCount: 44, ratingAvg: 4.8, country: 'MX',
    },
    {
      type: KbType.KNOWN_ISSUE,
      title: 'GPS no localiza satélites en zonas urbanas densas — cold start prolongado',
      content: {
        symptom: 'El dispositivo tarda más de 10 minutos en localizar primera posición GPS en centro de ciudad',
        cause: 'Cold start sin datos de asistencia (AGPS). Los edificios crean "cañones urbanos" que bloquean señal satelital.',
        solutions: [
          'Activar AGPS si el dispositivo lo soporta (descarga posiciones satelitales via internet)',
          'Colocar antena GPS en posición elevada con máxima visibilidad al cielo',
          'Esperar en zona abierta 3-5 minutos antes de conducir por zonas densas',
          'Para Teltonika: activar GNSS en modo GPS+GLONASS+Galileo para más satélites disponibles',
        ],
        prevention: 'Usar antena activa de alta ganancia (28-40 dB) en lugar de antena pasiva interna',
        verified: true,
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 109, voteCount: 29, ratingAvg: 4.5, country: 'MX',
    },
    {
      type: KbType.MOTOR_CUT,
      title: 'Corte de motor Mitsubishi L200 2015-2022 — método bomba combustible',
      vehicleBrand: 'Mitsubishi', vehicleModel: 'L200', yearFrom: 2015, yearTo: 2022,
      content: {
        relay_location: 'Caja de fusibles bajo capó lado derecho, fusible FUEL PUMP 15A',
        wire_to_cut: 'Cable rosa/negro circuito bomba de combustible',
        steps: [
          'Localizar caja de fusibles bajo capó lado derecho (pasajero)',
          'Identificar fusible FUEL PUMP 15A',
          'Interceptar cable rosa/negro con relé normalmente cerrado',
          'Conectar bobina del relé al GPS (salida de corte)',
        ],
        warnings: ['L200 2020+ modelo Sportero tiene bloqueo electrónico adicional — preferir método bomba'],
      },
      status: KbStatus.APPROVED, authorId: admin.id, approvedBy: admin.id,
      useCount: 48, voteCount: 12, ratingAvg: 4.4, country: 'MX',
    },
  ];

  for (const data of entries) {
    const entry = kbRepo.create({ ...data, authorId: admin.id } as any);
    await kbRepo.save(entry);
  }

  console.log(`KB seeded: ${entries.length} entries`);
}
