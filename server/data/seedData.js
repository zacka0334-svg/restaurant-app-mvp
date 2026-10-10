// The A1 mock data, now used only to fill the database (npm run seed).

const users = [
  { fullName: 'Ahmed Ali', email: 'customer@dastarkhwan.pk', password: 'Customer123', role: 'customer' },
  { fullName: 'Sara Khan', email: 'sara@dastarkhwan.pk', password: 'Sara12345', role: 'customer' },
  { fullName: 'Bilal Ahmad', email: 'manager@dastarkhwan.pk', password: 'Manager123', role: 'manager' },
];

const menuItems = [
  { name: 'Chicken Corn Soup', description: 'Classic thick soup with shredded chicken and sweet corn.', price: 450, category: 'starters', image: '🍲', isSpecial: false, isAvailable: true },
  { name: 'Samosa Platter', description: 'Four crispy potato samosas with mint and tamarind chutney.', price: 350, category: 'starters', image: '🥟', isSpecial: true, isAvailable: true },
  { name: 'Dynamite Prawns', description: 'Crispy prawns tossed in spicy creamy dynamite sauce.', price: 1250, category: 'starters', image: '🍤', isSpecial: false, isAvailable: true },
  { name: 'Garlic Bread', description: 'Toasted baguette with garlic butter and mozzarella.', price: 400, category: 'starters', image: '🥖', isSpecial: false, isAvailable: false },
  { name: 'Chicken Karahi', description: 'Half kg chicken cooked in tomatoes, ginger and green chillies.', price: 1800, category: 'mains', image: '🍛', isSpecial: true, isAvailable: true },
  { name: 'Mutton Biryani', description: 'Fragrant basmati rice layered with slow-cooked mutton.', price: 1500, category: 'mains', image: '🍚', isSpecial: false, isAvailable: true },
  { name: 'Beef Burger', description: 'Grilled beef patty, cheddar, caramelised onions and fries.', price: 1100, category: 'mains', image: '🍔', isSpecial: false, isAvailable: true },
  { name: 'Fajita Pizza', description: 'Medium pizza with chicken fajita, peppers and onions.', price: 1650, category: 'mains', image: '🍕', isSpecial: false, isAvailable: true },
  { name: 'Grilled Fish', description: 'Seasonal fish fillet with lemon butter sauce and vegetables.', price: 2100, category: 'mains', image: '🐟', isSpecial: false, isAvailable: false },
  { name: 'Alfredo Pasta', description: 'Fettuccine in a creamy parmesan sauce with grilled chicken.', price: 1350, category: 'mains', image: '🍝', isSpecial: false, isAvailable: true },
  { name: 'Gulab Jamun', description: 'Three warm gulab jamun in rose-scented syrup.', price: 300, category: 'desserts', image: '🍡', isSpecial: false, isAvailable: true },
  { name: 'Molten Lava Cake', description: 'Chocolate cake with a gooey centre and vanilla ice cream.', price: 750, category: 'desserts', image: '🍫', isSpecial: true, isAvailable: true },
  { name: 'Kheer', description: 'Slow-cooked rice pudding with cardamom and pistachios.', price: 350, category: 'desserts', image: '🍮', isSpecial: false, isAvailable: true },
  { name: 'Mint Margarita', description: 'Frozen lemon and fresh mint slush.', price: 380, category: 'drinks', image: '🍹', isSpecial: false, isAvailable: true },
  { name: 'Kashmiri Chai', description: 'Pink tea with crushed pistachio and almonds.', price: 300, category: 'drinks', image: '🍵', isSpecial: false, isAvailable: true },
  { name: 'Mango Lassi', description: 'Chilled yoghurt drink blended with Sindhri mango.', price: 420, category: 'drinks', image: '🥭', isSpecial: true, isAvailable: true },
];

const tables = [
  { number: 1, seats: 2, location: 'Window' },
  { number: 2, seats: 2, location: 'Window' },
  { number: 3, seats: 4, location: 'Main hall' },
  { number: 4, seats: 4, location: 'Main hall' },
  { number: 5, seats: 6, location: 'Family area' },
  { number: 6, seats: 8, location: 'Family area' },
  { number: 7, seats: 12, location: 'Private room' },
];

module.exports = { users, menuItems, tables };
