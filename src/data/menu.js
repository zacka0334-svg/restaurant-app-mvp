// Mock menu data (no database). 16 items across 4 categories.
// `image` is an emoji so the app works fully offline without image assets.

export const categories = [
  { id: 'all', name: 'All' },
  { id: 'starters', name: 'Starters' },
  { id: 'mains', name: 'Mains' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'drinks', name: 'Drinks' },
];

export const menu = [
  // Starters
  { id: 'm1', name: 'Chicken Corn Soup', description: 'Classic thick soup with shredded chicken and sweet corn.', price: 450, category: 'starters', image: '🍲', isSpecial: false, isAvailable: true },
  { id: 'm2', name: 'Samosa Platter', description: 'Four crispy potato samosas with mint and tamarind chutney.', price: 350, category: 'starters', image: '🥟', isSpecial: true, isAvailable: true },
  { id: 'm3', name: 'Dynamite Prawns', description: 'Crispy prawns tossed in spicy creamy dynamite sauce.', price: 1250, category: 'starters', image: '🍤', isSpecial: false, isAvailable: true },
  { id: 'm4', name: 'Garlic Bread', description: 'Toasted baguette with garlic butter and mozzarella.', price: 400, category: 'starters', image: '🥖', isSpecial: false, isAvailable: false },

  // Mains
  { id: 'm5', name: 'Chicken Karahi', description: 'Half kg chicken cooked in tomatoes, ginger and green chillies.', price: 1800, category: 'mains', image: '🍛', isSpecial: true, isAvailable: true },
  { id: 'm6', name: 'Mutton Biryani', description: 'Fragrant basmati rice layered with slow-cooked mutton.', price: 1500, category: 'mains', image: '🍚', isSpecial: false, isAvailable: true },
  { id: 'm7', name: 'Beef Burger', description: 'Grilled beef patty, cheddar, caramelised onions and fries.', price: 1100, category: 'mains', image: '🍔', isSpecial: false, isAvailable: true },
  { id: 'm8', name: 'Fajita Pizza', description: 'Medium pizza with chicken fajita, peppers and onions.', price: 1650, category: 'mains', image: '🍕', isSpecial: false, isAvailable: true },
  { id: 'm9', name: 'Grilled Fish', description: 'Seasonal fish fillet with lemon butter sauce and vegetables.', price: 2100, category: 'mains', image: '🐟', isSpecial: false, isAvailable: false },
  { id: 'm10', name: 'Alfredo Pasta', description: 'Fettuccine in a creamy parmesan sauce with grilled chicken.', price: 1350, category: 'mains', image: '🍝', isSpecial: false, isAvailable: true },

  // Desserts
  { id: 'm11', name: 'Gulab Jamun', description: 'Three warm gulab jamun in rose-scented syrup.', price: 300, category: 'desserts', image: '🍡', isSpecial: false, isAvailable: true },
  { id: 'm12', name: 'Molten Lava Cake', description: 'Chocolate cake with a gooey centre and vanilla ice cream.', price: 750, category: 'desserts', image: '🍫', isSpecial: true, isAvailable: true },
  { id: 'm13', name: 'Kheer', description: 'Slow-cooked rice pudding with cardamom and pistachios.', price: 350, category: 'desserts', image: '🍮', isSpecial: false, isAvailable: true },

  // Drinks
  { id: 'm14', name: 'Mint Margarita', description: 'Frozen lemon and fresh mint slush.', price: 380, category: 'drinks', image: '🍹', isSpecial: false, isAvailable: true },
  { id: 'm15', name: 'Kashmiri Chai', description: 'Pink tea with crushed pistachio and almonds.', price: 300, category: 'drinks', image: '🍵', isSpecial: false, isAvailable: true },
  { id: 'm16', name: 'Mango Lassi', description: 'Chilled yoghurt drink blended with Sindhri mango.', price: 420, category: 'drinks', image: '🥭', isSpecial: true, isAvailable: true },
];

// Simulates a network request. Resolves after `delay` ms; the returned
// `cancel` function clears the timer so no state update happens after unmount.
// `failRate` lets us demo the error + Retry state (10% of requests fail).
export function fetchMenu(source = menu, { delay = 1500, failRate = 0.1 } = {}) {
  let timerId;
  const promise = new Promise((resolve, reject) => {
    timerId = setTimeout(() => {
      if (Math.random() < failRate) {
        reject(new Error('Could not load the menu. Please check your connection.'));
      } else {
        resolve(source.map((item) => ({ ...item })));
      }
    }, delay);
  });
  return { promise, cancel: () => clearTimeout(timerId) };
}

export default menu;
