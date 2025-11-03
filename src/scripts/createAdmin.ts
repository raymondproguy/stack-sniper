// scripts/createAdmin.ts
import { connectDB } from '../src/config/database';
import { User } from '../src/models/User.model';

async function createAdminUser() {
  try {
    await connectDB();
    
    const adminUser = new User({
      uid: 'admin-uid-001',
      email: 'admin@stacksniper.com',
      displayName: 'StackSniper Admin',
      provider: 'manual',
      isAdmin: true,
      emailVerified: true
    });
    
    await adminUser.save();
    console.log('🎉 Admin user created successfully!');
    console.log('Email: admin@stacksniper.com');
    console.log('UID: admin-uid-001');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
