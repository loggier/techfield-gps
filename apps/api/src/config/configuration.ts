export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'techfield_db',
    user: process.env.DB_USER || 'techfield_user',
    pass: process.env.DB_PASS || 'techfield_pass',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret_in_production_32chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'another_secret_different_32chars',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '90d',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    verifySid: process.env.TWILIO_VERIFY_SERVICE_SID,
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },

  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || 'techfield-evidences',
    publicUrl: process.env.R2_PUBLIC_URL || 'https://evidences.techfieldgps.vemontech.com',
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
});
