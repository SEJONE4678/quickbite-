const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  desc: { type: String },
  price: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  veg: { type: Boolean, default: true },
  image: { type: String },
  popular: { type: Boolean, default: false }
});

const menuCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  items: [menuItemSchema]
});

const restaurantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  eta: { type: String, required: true },
  minOrder: { type: Number, default: 99 },
  deliveryFee: { type: Number, default: 30 },
  discount: { type: String, default: '' },
  tags: [{ type: String }],
  image: { type: String },
  isOpen: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  menu: [menuCategorySchema]
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
