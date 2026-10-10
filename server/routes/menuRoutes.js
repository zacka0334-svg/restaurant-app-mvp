const express = require('express');
const {
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, managerOnly } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

const router = express.Router();

// Anyone can read the menu.
router.get('/', getMenu);
router.get('/:id', validateId, getMenuItem);

// Only a logged-in manager can change it.
router.post('/', protect, managerOnly, createMenuItem);
router.put('/:id', validateId, protect, managerOnly, updateMenuItem);
router.delete('/:id', validateId, protect, managerOnly, deleteMenuItem);

module.exports = router;
