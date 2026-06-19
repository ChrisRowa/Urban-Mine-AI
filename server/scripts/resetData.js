import mongoose from 'mongoose';
import Component from '../models/Component.js';
import { connectDB } from '../config/database.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetData() {
  try {
    // Connect to database
    await connectDB();
    console.log('🔌 Connected to MongoDB');
    
    // Clear all existing data
    await Component.deleteMany({});
    console.log('🗑️  Cleared all existing data from components collection');
    
    // Load sample building components
    const sampleDataPath = path.join(__dirname, '../data/sampleComponents.json');
    const data = await fs.readFile(sampleDataPath, 'utf8');
    const { components } = JSON.parse(data);
    
    console.log(`📦 Found ${components.length} building components in sample data`);
    
    // Insert building components
    await Component.insertMany(components);
    console.log('✅ Successfully loaded building components into database');
    
    // Verify the data
    const count = await Component.countDocuments();
    console.log(`📊 Total components in database: ${count}`);
    
    // Show sample of what was loaded
    const sample = await Component.findOne();
    console.log('🔍 Sample component:', {
      id: sample.id,
      name: sample.name,
      material: sample.material,
      location: sample.location
    });
    
    console.log('🎉 Data reset complete! Refresh MongoDB Compass to see the building components.');
    
  } catch (error) {
    console.error('❌ Error resetting data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

resetData();
