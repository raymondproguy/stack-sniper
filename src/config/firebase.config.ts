// src/config/firebase.config.ts
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Load the service account JSON file
  const serviceAccountPath = path.join(__dirname, '../../stacksniperauth-firebase-adminsdk-fbsvc-8f1a81aa9e.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });

  console.log('🎉 Firebase Admin SDK initialized successfully!');
} catch (error: any) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('💡 Make sure you have firebase-service-account.json in your project root');
  process.exit(1);
}

export default admin;
