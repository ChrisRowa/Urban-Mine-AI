import mongoose from 'mongoose';

// Building Component Schema for MongoDB
const componentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  material: {
    type: String,
    required: true
  },
  connectionType: {
    type: String,
    required: true,
    enum: ['Bolted', 'Screwed', 'Glued', 'Adhesive', 'Clipped', 'Welded']
  },
  condition: {
    type: String,
    required: true,
    enum: ['Good', 'Fair', 'Poor']
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    type: String,
    required: true
  },
  dimensions: {
    type: String,
    required: true
  },
  estimatedAge: {
    type: Number,
    required: true,
    min: 0
  },
  reuseScore: {
    type: Number,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    enum: ['Reusable', 'Recyclable', 'Waste']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
const Component = mongoose.model('Component', componentSchema);

export default Component;
