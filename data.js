

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'biryani', label: 'Biryani', emoji: '🍛' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'dessert', label: 'Desserts', emoji: '🍰' },
  { id: 'drinks', label: 'Drinks', emoji: '🧃' },
];

const RESTAURANTS = [
  {
    id: 'r1',
    name: "Bella Napoli Pizzeria",
    category: 'pizza',
    rating: 4.8,
    reviews: 2340,
    eta: '20-30 min',
    minOrder: 149,
    deliveryFee: 29,
    discount: '40% OFF up to ₹120',
    tags: ['Pizza', 'Italian', 'Pasta'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
    isOpen: true,
    featured: true,
  },
  {
    id: 'r2',
    name: "Burger Republic",
    category: 'burger',
    rating: 4.6,
    reviews: 1890,
    eta: '15-25 min',
    minOrder: 99,
    deliveryFee: 0,
    discount: 'FREE Delivery',
    tags: ['Burgers', 'Fries', 'Shakes'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    isOpen: true,
    featured: true,
  },
  {
    id: 'r3',
    name: "Dum Pukht Biryani House",
    category: 'biryani',
    rating: 4.9,
    reviews: 5120,
    eta: '30-45 min',
    minOrder: 199,
    deliveryFee: 19,
    discount: '20% OFF',
    tags: ['Biryani', 'North Indian', 'Kebabs'],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
    isOpen: true,
    featured: false,
  },
  {
    id: 'r4',
    name: "Tokyo Garden Sushi",
    category: 'sushi',
    rating: 4.7,
    reviews: 980,
    eta: '35-50 min',
    minOrder: 299,
    deliveryFee: 49,
    discount: '15% OFF on first order',
    tags: ['Sushi', 'Japanese', 'Ramen'],
    image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80',
    isOpen: true,
    featured: true,
  },
  {
    id: 'r5',
    name: "La Pasta Fresca",
    category: 'pasta',
    rating: 4.5,
    reviews: 672,
    eta: '25-35 min',
    minOrder: 179,
    deliveryFee: 39,
    discount: '30% OFF',
    tags: ['Pasta', 'Italian', 'Risotto'],
    image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&q=80',
    isOpen: true,
    featured: false,
  },
  {
    id: 'r6',
    name: "El Fuego Tacos",
    category: 'tacos',
    rating: 4.4,
    reviews: 430,
    eta: '20-30 min',
    minOrder: 129,
    deliveryFee: 0,
    discount: 'FREE Delivery',
    tags: ['Tacos', 'Mexican', 'Burritos'],
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
    isOpen: false,
    featured: false,
  },
  {
    id: 'r7',
    name: "Sweet Dreams Bakery",
    category: 'dessert',
    rating: 4.8,
    reviews: 1540,
    eta: '15-25 min',
    minOrder: 99,
    deliveryFee: 29,
    discount: 'Buy 2 Get 1 Free',
    tags: ['Cakes', 'Pastries', 'Ice Cream'],
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
    isOpen: true,
    featured: false,
  },
  {
    id: 'r8',
    name: "The Grill Master",
    category: 'burger',
    rating: 4.3,
    reviews: 820,
    eta: '20-35 min',
    minOrder: 149,
    deliveryFee: 19,
    discount: '25% OFF',
    tags: ['Burgers', 'Grills', 'Wings'],
    image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=600&q=80',
    isOpen: true,
    featured: false,
  },
];

const MENUS = {
  r1: [
    {
      category: 'Bestsellers 🔥',
      items: [
        { id: 'm1', name: 'Margherita Classic', desc: 'Tomato sauce, fresh mozzarella, basil leaves', price: 349, rating: 4.8, veg: true, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', popular: true },
        { id: 'm2', name: 'Pepperoni Feast', desc: 'Double pepperoni, mozzarella, oregano', price: 449, rating: 4.9, veg: false, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', popular: true },
        { id: 'm3', name: 'BBQ Chicken Supreme', desc: 'Grilled chicken, BBQ sauce, red onion, mozzarella', price: 499, rating: 4.7, veg: false, image: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=400&q=80', popular: false },
      ]
    },
    {
      category: 'Pasta & Sides',
      items: [
        { id: 'm4', name: 'Spaghetti Carbonara', desc: 'Creamy egg sauce, pancetta, parmesan', price: 299, rating: 4.6, veg: false, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80', popular: false },
        { id: 'm5', name: 'Garlic Bread (4 pcs)', desc: 'Toasted baguette with herb garlic butter', price: 129, rating: 4.5, veg: true, image: 'https://images.unsplash.com/photo-1619531040576-f9416740661f?w=400&q=80', popular: false },
      ]
    },
    {
      category: 'Drinks',
      items: [
        { id: 'm6', name: 'Sparkling Water', desc: '500ml chilled', price: 49, rating: 4.0, veg: true, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80', popular: false },
        { id: 'm7', name: 'Fresh Lemonade', desc: 'Freshly squeezed with mint', price: 99, rating: 4.4, veg: true, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80', popular: false },
      ]
    }
  ],
  r2: [
    {
      category: 'Signature Burgers 🔥',
      items: [
        { id: 'b1', name: 'Double Smash Burger', desc: 'Two smash patties, American cheese, special sauce', price: 349, rating: 4.9, veg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', popular: true },
        { id: 'b2', name: 'Crispy Chicken Burger', desc: 'Fried chicken fillet, coleslaw, pickles', price: 299, rating: 4.7, veg: false, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80', popular: true },
        { id: 'b3', name: 'Veggie Supreme', desc: 'Aloo tikki, lettuce, tomato, veg mayo', price: 199, rating: 4.4, veg: true, image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80', popular: false },
      ]
    },
    {
      category: 'Sides & Fries',
      items: [
        { id: 'b4', name: 'Loaded Cheese Fries', desc: 'Crispy fries, nacho cheese, jalapeños', price: 179, rating: 4.8, veg: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80', popular: true },
        { id: 'b5', name: 'Onion Rings', desc: 'Crunchy battered rings with dipping sauce', price: 149, rating: 4.5, veg: true, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80', popular: false },
      ]
    },
    {
      category: 'Shakes',
      items: [
        { id: 'b6', name: 'Oreo Milkshake', desc: 'Thick creamy shake with Oreo crumble', price: 199, rating: 4.9, veg: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80', popular: true },
        { id: 'b7', name: 'Strawberry Shake', desc: 'Fresh strawberry blended with vanilla ice cream', price: 179, rating: 4.6, veg: true, image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80', popular: false },
      ]
    }
  ],
  r3: [
    {
      category: 'Biryani Specials 🔥',
      items: [
        { id: 'bi1', name: 'Hyderabadi Chicken Biryani', desc: 'Dum-cooked basmati, tender chicken, saffron', price: 349, rating: 4.9, veg: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', popular: true },
        { id: 'bi2', name: 'Mutton Biryani', desc: 'Slow-cooked mutton, caramelized onion, rose water', price: 449, rating: 4.8, veg: false, image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&q=80', popular: true },
        { id: 'bi3', name: 'Veg Dum Biryani', desc: 'Seasonal vegetables, paneer, aromatic spices', price: 249, rating: 4.6, veg: true, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80', popular: false },
      ]
    },
    {
      category: 'Starters',
      items: [
        { id: 'bi4', name: 'Seekh Kebab (6 pcs)', desc: 'Minced lamb kebabs on skewers with chutney', price: 299, rating: 4.7, veg: false, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', popular: false },
        { id: 'bi5', name: 'Paneer Tikka', desc: 'Marinated cottage cheese grilled in tandoor', price: 249, rating: 4.6, veg: true, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80', popular: false },
      ]
    }
  ],
  r4: [
    {
      category: 'Sushi Rolls 🔥',
      items: [
        { id: 's1', name: 'Dragon Roll (8 pcs)', desc: 'Prawn tempura, avocado, spicy mayo, tobiko', price: 549, rating: 4.9, veg: false, image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80', popular: true },
        { id: 's2', name: 'California Roll (8 pcs)', desc: 'Crab meat, avocado, cucumber, sesame', price: 449, rating: 4.7, veg: false, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', popular: true },
        { id: 's3', name: 'Veggie Roll (8 pcs)', desc: 'Avocado, cucumber, carrot, asparagus', price: 349, rating: 4.5, veg: true, image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80', popular: false },
      ]
    },
    {
      category: 'Nigiri & Sashimi',
      items: [
        { id: 's4', name: 'Salmon Nigiri (4 pcs)', desc: 'Fresh Atlantic salmon on sushi rice', price: 399, rating: 4.8, veg: false, image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&q=80', popular: false },
        { id: 's5', name: 'Tuna Sashimi (6 pcs)', desc: 'Premium grade tuna, thinly sliced', price: 499, rating: 4.9, veg: false, image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&q=80', popular: true },
      ]
    }
  ],
  r5: [
    {
      category: 'Classic Pasta 🔥',
      items: [
        { id: 'p1', name: 'Pasta Carbonara', desc: 'Guanciale, egg yolk, pecorino, black pepper', price: 329, rating: 4.8, veg: false, image: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=400&q=80', popular: true },
        { id: 'p2', name: 'Penne Arrabbiata', desc: 'Spicy tomato sauce, garlic, fresh chili, basil', price: 249, rating: 4.6, veg: true, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80', popular: false },
        { id: 'p3', name: 'Truffle Mushroom Pasta', desc: 'Black truffle oil, porcini, shaved parmesan', price: 399, rating: 4.9, veg: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', popular: true },
      ]
    }
  ],
  r6: [
    {
      category: 'Street Tacos 🔥',
      items: [
        { id: 't1', name: 'Chicken Al Pastor (3 pcs)', desc: 'Marinated chicken, pineapple, cilantro, onion', price: 249, rating: 4.7, veg: false, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', popular: true },
        { id: 't2', name: 'Beef Barbacoa (3 pcs)', desc: 'Slow-cooked beef, lime, cotija cheese', price: 299, rating: 4.8, veg: false, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80', popular: true },
        { id: 't3', name: 'Cauliflower Tacos (3 pcs)', desc: 'Roasted cauliflower, black beans, avocado', price: 199, rating: 4.5, veg: true, image: 'https://images.unsplash.com/photo-1570461226513-e08b58a52a50?w=400&q=80', popular: false },
      ]
    }
  ],
  r7: [
    {
      category: 'Signature Cakes 🔥',
      items: [
        { id: 'd1', name: 'Chocolate Lava Cake', desc: 'Warm chocolate fondant, vanilla ice cream', price: 199, rating: 4.9, veg: true, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80', popular: true },
        { id: 'd2', name: 'New York Cheesecake', desc: 'Creamy baked cheesecake, berry coulis', price: 249, rating: 4.8, veg: true, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80', popular: true },
        { id: 'd3', name: 'Tiramisu', desc: 'Classic Italian dessert with espresso', price: 229, rating: 4.7, veg: true, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', popular: false },
      ]
    }
  ],
  r8: [
    {
      category: 'Grill Specials 🔥',
      items: [
        { id: 'g1', name: 'BBQ Beef Burger', desc: 'Angus beef, smoked cheddar, BBQ sauce, crispy bacon', price: 399, rating: 4.7, veg: false, image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80', popular: true },
        { id: 'g2', name: 'Chicken Wings (8 pcs)', desc: 'Buffalo, honey garlic, or BBQ glaze', price: 299, rating: 4.8, veg: false, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80', popular: true },
        { id: 'g3', name: 'Veggie Mushroom Burger', desc: 'Portobello patty, Swiss cheese, truffle mayo', price: 279, rating: 4.5, veg: true, image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80', popular: false },
      ]
    }
  ],
};
