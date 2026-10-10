// npm run seed
// Empties the collections and fills them with the A1 data.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Reservation = require('./models/Reservation');
const Order = require('./models/Order');
const { users, menuItems, tables } = require('./data/seedData');
const { toDateKey } = require('./utils/rules');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected, seeding...');

    await Promise.all([
      User.deleteMany({}),
      MenuItem.deleteMany({}),
      Table.deleteMany({}),
      Reservation.deleteMany({}),
      Order.deleteMany({}),
    ]);

    // Passwords are hashed exactly like in register.
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 10) }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    const createdMenu = await MenuItem.insertMany(menuItems);
    const createdTables = await Table.insertMany(tables);

    // Demo bookings for tomorrow (same as A1):
    // 20:00 -> every table booked, so the slot shows as "Full" in the app
    // 19:00 -> the big tables booked, so it is full for groups larger than 4
    const sara = createdUsers.find((u) => u.email === 'sara@dastarkhwan.pk');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = toDateKey(tomorrow);
    const demo = [
      ...createdTables.map((t) => ({ table: t, time: '20:00', status: 'Accepted', partySize: Math.min(t.seats, 2) })),
      ...createdTables.filter((t) => t.seats > 4).map((t) => ({ table: t, time: '19:00', status: 'Pending', partySize: 6 })),
    ];
    await Reservation.insertMany(
      demo.map((d) => ({
        customer: sara._id,
        table: d.table._id,
        tableNumber: d.table.number,
        name: sara.fullName,
        phone: '0321-1234567',
        date,
        time: d.time,
        partySize: d.partySize,
        status: d.status,
      }))
    );

    console.log(`Seeded ${createdUsers.length} users, ${createdMenu.length} menu items, ${createdTables.length} tables, ${demo.length} reservations`);
    console.log('Customer login: customer@dastarkhwan.pk / Customer123');
    console.log('Manager login:  manager@dastarkhwan.pk / Manager123');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
