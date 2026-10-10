const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const Category = require('./models/Category');
const Restaurant = require('./models/Restaurant');

// Read data.js and extract the objects
const dataContent = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');

// Function to evaluate data.js variables safely
function loadSeedData() {
  const sandbox = {};
  const fn = new Function('exports', dataContent + '; return { CATEGORIES, RESTAURANTS, MENUS };');
  return fn(sandbox);
}

async function seedDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quickbite';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const { CATEGORIES, RESTAURANTS, MENUS } = loadSeedData();

    // Clear existing data
    await Category.deleteMany({});
    await Restaurant.deleteMany({});
    console.log('Cleared existing database records.');

    // Insert Categories
    await Category.insertMany(CATEGORIES);
    console.log(`Successfully seeded ${CATEGORIES.length} categories.`);

    // Attach menu to restaurants and insert
    const restaurantsWithMenus = RESTAURANTS.map(r => ({
      ...r,
      menu: MENUS[r.id] || []
    }));

    await Restaurant.insertMany(restaurantsWithMenus);
    console.log(`Successfully seeded ${restaurantsWithMenus.length} restaurants with menus.`);

    console.log('🎉 Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();
