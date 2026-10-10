const MenuItem = require('../models/MenuItem');
const handleError = require('../utils/handleError');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/menu?category=Mains&search=karahi
async function getMenu(req, res) {
  try {
    const filter = {};
    if (req.query.category && req.query.category.toLowerCase() !== 'all') {
      filter.category = req.query.category.toLowerCase();
    }
    if (req.query.search) {
      filter.name = { $regex: escapeRegex(req.query.search), $options: 'i' }; // i = not case sensitive
    }
    const items = await MenuItem.find(filter).sort({ createdAt: 1 });
    return res.status(200).json(items);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/menu/:id
async function getMenuItem(req, res) {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    return res.status(200).json(item);
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/menu  (manager)
async function createMenuItem(req, res) {
  try {
    const body = req.body || {};
    const { name, price, category } = body;
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Name is required' });
    if (price === undefined || price === '' || Number.isNaN(Number(price))) {
      return res.status(400).json({ message: 'Price is required and must be a number' });
    }
    if (Number(price) < 0) return res.status(400).json({ message: 'Price cannot be negative' });
    if (!category) return res.status(400).json({ message: 'Category is required' });

    const item = await MenuItem.create({
      name,
      description: body.description,
      price: Number(price),
      category,
      image: body.image || undefined,
      isSpecial: body.isSpecial,
      isAvailable: body.isAvailable,
    });
    return res.status(201).json(item);
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/menu/:id  (manager) - change price, availability, name ...
async function updateMenuItem(req, res) {
  try {
    const allowed = ['name', 'description', 'price', 'category', 'image', 'isSpecial', 'isAvailable'];
    const body = req.body || {};
    const updates = {};
    allowed.forEach((key) => {
      if (body[key] !== undefined) updates[key] = body[key];
    });
    if (updates.price !== undefined && (Number.isNaN(Number(updates.price)) || Number(updates.price) < 0)) {
      return res.status(400).json({ message: 'Price must be a number that is not negative' });
    }
    const item = await MenuItem.findByIdAndUpdate(req.params.id, updates, {
      new: true, // return the updated item
      runValidators: true, // apply schema rules (min, enum ...) on update too
    });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    return res.status(200).json(item);
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/menu/:id  (manager)
async function deleteMenuItem(req, res) {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    return res.status(200).json({ message: 'Menu item deleted', id: req.params.id });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem };
