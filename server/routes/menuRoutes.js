const express = require('express');
const {
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const validateId = require('../middleware/validateId');

const router = express.Router();

// Anyone can read the menu.
router.get('/', getMenu);
router.get('/:id', validateId, getMenuItem);

router.post('/', createMenuItem);
router.put('/:id', validateId, updateMenuItem);
router.delete('/:id', validateId, deleteMenuItem);

module.exports = router;
