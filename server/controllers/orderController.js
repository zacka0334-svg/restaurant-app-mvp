const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const handleError = require('../utils/handleError');
const { computeTotals, checkStatusChange } = require('../utils/rules');
const { PROMO_CODES } = require('../config/constants');

// POST /api/orders  (customer)
// Body: { items: [{ id, quantity, note }], type, tableId, pickupTime, promoCode }
async function placeOrder(req, res) {
  try {
    const { items, type, tableId, pickupTime, promoCode } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Your order has no items' });
    }
    if (!['Dine-in', 'Takeaway'].includes(type)) {
      return res.status(400).json({ message: 'Order type must be Dine-in or Takeaway' });
    }

    let table = null;
    if (type === 'Dine-in') {
      if (!mongoose.isValidObjectId(tableId)) return res.status(400).json({ message: 'Please choose a table' });
      table = await Table.findById(tableId);
      if (!table) return res.status(404).json({ message: 'Table not found' });
    } else if (!pickupTime) {
      return res.status(400).json({ message: 'Please choose a pickup time' });
    }

    // Build every line from the DATABASE, not from what the app sent.
    // Why: the app's prices could be old (the manager just changed them) or
    // could be edited by someone to pay less. Only the server is trusted,
    // so we ignore any price or total coming from the app.
    const lines = [];
    for (const line of items) {
      const id = line.id || line.menuItem;
      const quantity = Number(line.quantity);
      if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'An item in your cart is not valid' });
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
      }
      const menuItem = await MenuItem.findById(id);
      if (!menuItem) return res.status(400).json({ message: 'An item in your cart no longer exists' });
      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is not available right now` });
      }
      lines.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        note: String(line.note || '').slice(0, 200),
      });
    }

    let discountPercent = 0;
    let code = null;
    if (promoCode) {
      code = String(promoCode).trim().toUpperCase();
      discountPercent = PROMO_CODES[code];
      if (!discountPercent) return res.status(400).json({ message: `"${code}" is not a valid promo code` });
    }

    const totals = computeTotals(lines, discountPercent);

    const order = await Order.create({
      customer: req.user._id,
      customerName: req.user.fullName,
      items: lines,
      type,
      table: table ? table._id : undefined,
      tableNumber: table ? table.number : undefined,
      pickupTime: type === 'Takeaway' ? pickupTime : undefined,
      promoCode: code,
      ...totals,
      history: [{ status: 'Pending', by: 'customer' }],
    });
    return res.status(201).json(order);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/orders/my  (customer) - newest first
async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/orders  (manager) - all orders
async function getAllOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return handleError(res, error);
  }
}

// PATCH /api/orders/:id/status  (manager)  Body: { status }
async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'Status is required' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const problem = checkStatusChange(order.status, status);
    if (problem) return res.status(400).json({ message: problem });

    order.status = status;
    order.history.push({ status, by: 'manager' });
    await order.save();
    return res.status(200).json(order);
  } catch (error) {
    return handleError(res, error);
  }
}

// PATCH /api/orders/:id/cancel  (customer, own order, only while Pending)
async function cancelMyOrder(req, res) {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const problem = checkStatusChange(order.status, 'Cancelled');
    if (problem) return res.status(400).json({ message: problem });

    order.status = 'Cancelled';
    order.history.push({ status: 'Cancelled', by: 'customer' });
    await order.save();
    return res.status(200).json(order);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus, cancelMyOrder };
