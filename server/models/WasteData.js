import mongoose from 'mongoose';

// Waste Data Schema for UrbanMine AI
const wasteDataSchema = new mongoose.Schema({
  waste_type: {
    type: String,
    required: true
  },
  waste_disposed_of_tonne: {
    type: Number,
    required: true
  },
  total_waste_recycled_tonne: {
    type: Number,
    required: true
  },
  total_waste_generated_tonne: {
    type: Number,
    required: true
  },
  recycling_rate: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
const WasteData = mongoose.model('WasteData', wasteDataSchema);

export default WasteData;
