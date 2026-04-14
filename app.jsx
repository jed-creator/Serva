import React, { useState, useEffect, useCallback } from 'react';
import {
  Home,
  Search,
  ShoppingCart,
  Zap,
  User,
  MapPin,
  ChevronRight,
  Star,
  Clock,
  DollarSign,
  X,
  Plus,
  Minus,
  Heart,
  Navigation,
  ChefHat,
  Truck,
  Hotel,
  Film,
  Wrench,
  Tag,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Phone,
} from 'lucide-react';

// Mock restaurant data
const RESTAURANTS = [
  {
    id: 1,
    name: 'Pai Northern Thai',
    cuisine: ['Thai', 'Asian'],
    rating: 4.7,
    reviews: 428,
    deliveryTime: '25-35',
    deliveryFee: '$3.99',
    price: '$$$',
    minOrder: 15,
    image: '🍜',
    description: 'Award-winning Thai cuisine featuring bold flavors and traditional recipes',
    featured: true,
  },
  {
    id: 2,
    name: 'Sneaky Dee\'s',
    cuisine: ['Burgers', 'Canadian'],
    rating: 4.5,
    reviews: 312,
    deliveryTime: '20-30',
    deliveryFee: '$2.99',
    price: '$$',
    minOrder: 12,
    image: '🍔',
    description: 'Classic Canadian diner with legendary burgers and wings',
    featured: true,
  },
  {
    id: 3,
    name: 'Terroni Pizzeria',
    cuisine: ['Italian', 'Pizza'],
    rating: 4.8,
    reviews: 856,
    deliveryTime: '30-40',
    deliveryFee: '$4.99',
    price: '$$$',
    minOrder: 18,
    image: '🍕',
    description: 'Authentic Neapolitan pizza made with imported ingredients',
    featured: true,
  },
  {
    id: 4,
    name: 'Sushi Masaki',
    cuisine: ['Japanese', 'Sushi'],
    rating: 4.6,
    reviews: 534,
    deliveryTime: '35-45',
    deliveryFee: '$5.99',
    price: '$$$$',
    minOrder: 25,
    image: '🍣',
    description: 'Premium omakase experience with fresh-daily fish',
  },
  {
    id: 5,
    name: 'El Toro Negrito',
    cuisine: ['Mexican', 'Tacos'],
    rating: 4.4,
    reviews: 287,
    deliveryTime: '20-25',
    deliveryFee: '$2.49',
    price: '$$',
    minOrder: 10,
    image: '🌮',
    description: 'Authentic street tacos and fresh Mexican fare',
  },
  {
    id: 6,
    name: 'Piri Piri Grillhouse',
    cuisine: ['Portuguese', 'Chicken'],
    rating: 4.7,
    reviews: 445,
    deliveryTime: '25-35',
    deliveryFee: '$3.49',
    price: '$$',
    minOrder: 14,
    image: '🍗',
    description: 'Flame-grilled Portuguese chicken with signature spice',
  },
  {
    id: 7,
    name: 'Dragon Palace',
    cuisine: ['Chinese', 'Asian'],
    rating: 4.3,
    reviews: 198,
    deliveryTime: '30-40',
    deliveryFee: '$3.99',
    price: '$$',
    minOrder: 16,
    image: '🥡',
    description: 'Traditional Chinese cuisine with fresh ingredients daily',
  },
  {
    id: 8,
    name: 'Kneehigh Steak & Co',
    cuisine: ['Steakhouse', 'Canadian'],
    rating: 4.8,
    reviews: 612,
    deliveryTime: '40-50',
    deliveryFee: '$6.99',
    price: '$$$$',
    minOrder: 30,
    image: '🥩',
    description: 'Premium Canadian beef with French-inspired sides',
  },
  {
    id: 9,
    name: 'Samosa House',
    cuisine: ['Indian', 'South Asian'],
    rating: 4.5,
    reviews: 356,
    deliveryTime: '25-35',
    deliveryFee: '$2.99',
    price: '$$',
    minOrder: 12,
    image: '🥘',
    description: 'Authentic Indian curry house with vegetarian options',
  },
  {
    id: 10,
    name: 'The Lakeview Restaurant',
    cuisine: ['Fine Dining', 'Canadian'],
    rating: 4.9,
    reviews: 189,
    deliveryTime: '45-60',
    deliveryFee: '$7.99',
    price: '$$$$',
    minOrder: 40,
    image: '🍽️',
    description: 'Contemporary Canadian fine dining with seasonal menus',
  },
];

// Mock menu items
const MENU_ITEMS = {
  1: [
    { id: 101, name: 'Pad Thai', price: 13.99, image: '🍜' },
    { id: 102, name: 'Green Curry', price: 14.99, image: '🌶️' },
    { id: 103, name: 'Tom Yum Soup', price: 12.99, image: '🍲' },
    { id: 104, name: 'Mango Sticky Rice', price: 6.99, image: '🥭' },
  ],
  2: [
    { id: 201, name: 'Classic Burger', price: 11.99, image: '🍔' },
    { id: 202, name: 'Buffalo Wings (10pc)', price: 9.99, image: '🍗' },
    { id: 203, name: 'Poutine', price: 5.99, image: '🍟' },
    { id: 204, name: 'Onion Rings', price: 4.99, image: '🧅' },
  ],
  3: [
    { id: 301, name: 'Margherita Pizza', price: 16.99, image: '🍕' },
    { id: 302, name: 'Pepperoni Pizza', price: 17.99, image: '🍕' },
    { id: 303, name: 'Quattro Formaggi', price: 18.99, image: '🧀' },
    { id: 304, name: 'Tiramisu', price: 7.99, image: '🍰' },
  ],
};

// Services data
const SERVICES = [
  { id: 1, icon: ChefHat, label: 'Food Delivery', color: 'bg-red-100', textColor: 'text-red-600' },
  { id: 2, icon: ShoppingCart, label: 'Grocery', color: 'bg-green-100', textColor: 'text-green-600' },
  { id: 3, icon: Hotel, label: 'Hotels', color: 'bg-blue-100', textColor: 'text-blue-600' },
  { id: 4, icon: Truck, label: 'Rides', color: 'bg-purple-100', textColor: 'text-purple-600' },
  { id: 5, icon: Film, label: 'Movies', color: 'bg-pink-100', textColor: 'text-pink-600' },
  { id: 6, icon: Wrench, label: 'Services', color: 'bg-yellow-100', textColor: 'text-yellow-600' },
  { id: 7, icon: Tag, label: 'Deals', color: 'bg-orange-100', textColor: 'text-orange-600' },
  { id: 8, icon: TrendingUp, label: 'Reviews', color: 'bg-indigo-100', textColor: 'text-indigo-600' },
];

// Flash deals
const FLASH_DEALS = [
  { id: 1, merchant: 'Coffee Express', discount: '30%', ends: '2h 45m', original: 24.99, now: 17.49 },
  { id: 2, merchant: 'Smoothie Bar', discount: '50%', ends: '1h 30m', original: 12.99, now: 6.49 },
  { id: 3, merchant: 'Dessert Haven', discount: '40%', ends: '3h 15m', original: 18.99, now: 11.39 },
];

export default function LocalNowApp() {
  // Global state
  const [currentTab, setCurrentTab] = useState('home');
  const [location, setLocation] = useState('Toronto, ON');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Thai Food', 'Burgers', 'Pizza']);
  const [trendingSearches] = useState(['Sushi Delivery', '30% Off Food', 'Late Night Eats']);
  const [activeOrders, setActiveOrders] = useState([
    { id: 'ORD001', merchant: 'Pai Northern Thai', total: 52.45, progress: 65, status: 'On the way' },
    { id: 'ORD002', merchant: 'Sneaky Dee\'s', total: 38.99, progress: 40, status: 'Preparing' },
  ]);

  const locations = ['Toronto, ON', 'Vancouver, BC', 'Montreal, QC', 'Calgary, AB', 'Ottawa, ON'];

  // Add to cart
  const addToCart = useCallback((item, restaurantId) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.restaurantId === restaurantId);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.restaurantId === restaurantId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, restaurantId, quantity: 1 }];
    });
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((itemId, restaurantId) => {
    setCartItems((prev) => prev.filter((i) => !(i.id === itemId && i.restaurantId === restaurantId)));
  }, []);

  // Update quantity
  const updateQuantity = useCallback((itemId, restaurantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, restaurantId);
    } else {
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === itemId && i.restaurantId === restaurantId ? { ...i, quantity } : i
        )
      );
    }
  }, [removeFromCart]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = selectedRestaurant && cartItems.length > 0 ? 4.99 : 0;
  const serviceFee = subtotal * 0.15;
  const tax = (subtotal + deliveryFee + serviceFee) * 0.13;
  const total = subtotal + deliveryFee + serviceFee + tax;

  // Handle search
  const handleSearch = (query) => {
    if (query && !recentSearches.includes(query)) {
      setRecentSearches((prev) => [query, ...prev].slice(0, 5));
    }
  };

  // Place order
  const handlePlaceOrder = () => {
    setTimeout(() => {
      setOrderConfirmed(true);
      setTimeout(() => {
        setOrderConfirmed(false);
        setShowCheckout(false);
        setShowCart(false);
        setCartItems([]);
        setSelectedRestaurant(null);
        setCurrentTab('orders');
      }, 2000);
    }, 500);
  };

  // ========== RENDER SCREENS ==========

  // Home screen
  const renderHome = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white">
      {/* Location & Search Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-40">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={18} className="text-blue-600" />
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="text-sm font-semibold text-gray-800 hover:text-blue-600"
          >
            {location} <span className="text-gray-400">▼</span>
          </button>
        </div>

        {showLocationDropdown && (
          <div className="absolute top-16 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocation(loc);
                  setShowLocationDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm"
              >
                {loc}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants, food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => setCurrentTab('search')}
            className="bg-transparent w-full text-sm outline-none"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-4 py-6 pb-2">
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Services</h2>
        <div className="grid grid-cols-4 gap-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => {
                  if (service.label === 'Food Delivery') {
                    setSelectedService(1);
                  } else {
                    setSelectedService(service.id);
                  }
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className={`${service.color} p-3 rounded-lg`}>
                  <Icon size={24} className={service.textColor} />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">{service.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Near You */}
      <div className="px-4 py-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">Featured Near You</h2>
          <button className="text-xs text-blue-600 font-semibold">See all →</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {RESTAURANTS.filter((r) => r.featured).map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => {
                setSelectedRestaurant(restaurant.id);
                setSelectedService(1);
              }}
              className="snap-start flex-shrink-0 w-40 bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="text-3xl mb-2">{restaurant.image}</div>
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{restaurant.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{restaurant.cuisine.join(', ')}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-900">
                  ⭐ {restaurant.rating} ({restaurant.reviews})
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">{restaurant.deliveryTime} min • {restaurant.deliveryFee}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Flash Deals */}
      <div className="px-4 py-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={18} className="text-orange-500" />
          <h2 className="text-sm font-bold text-gray-900">Flash Deals</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {FLASH_DEALS.map((deal) => (
            <button
              key={deal.id}
              className="snap-start flex-shrink-0 w-48 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">{deal.discount}</span>
                <span className="text-xs font-semibold text-orange-600">{deal.ends}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-2">{deal.merchant}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-orange-600">${deal.now.toFixed(2)}</span>
                <span className="text-xs text-gray-600 line-through">${deal.original.toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Restaurants */}
      <div className="px-4 py-4 flex-1 overflow-y-auto">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Popular Right Now</h2>
        <div className="space-y-3">
          {RESTAURANTS.slice(0, 8).map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => {
                setSelectedRestaurant(restaurant.id);
                setSelectedService(1);
              }}
              className="w-full bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex gap-3">
                <div className="text-4xl flex-shrink-0">{restaurant.image}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{restaurant.name}</h3>
                  <p className="text-xs text-gray-600 mb-1">{restaurant.cuisine.join(', ')}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">⭐ {restaurant.rating}</span>
                    <span className="text-xs text-gray-600">{restaurant.deliveryTime} min</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Food Delivery - Restaurant List
  const renderRestaurantList = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-40">
        <button
          onClick={() => setSelectedService(null)}
          className="text-blue-600 text-sm font-semibold mb-3"
        >
          ← Back to Services
        </button>
        <h1 className="text-xl font-bold text-gray-900">Food Delivery</h1>
        <p className="text-xs text-gray-600">Restaurant list & filters</p>
      </div>

      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['All', 'Rating', 'Delivery Time', 'Price'].map((filter) => (
            <button key={filter} className="px-3 py-2 bg-gray-100 text-gray-800 text-xs rounded-full whitespace-nowrap hover:bg-gray-200">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {RESTAURANTS.map((restaurant) => (
          <button
            key={restaurant.id}
            onClick={() => setSelectedRestaurant(restaurant.id)}
            className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex gap-4">
              <div className="text-4xl flex-shrink-0">{restaurant.image}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{restaurant.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{restaurant.description}</p>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold">⭐ {restaurant.rating} ({restaurant.reviews})</span>
                  <span className="text-gray-600">{restaurant.price}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={14} />
                  {restaurant.deliveryTime} min • {restaurant.deliveryFee}
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Restaurant Detail
  const renderRestaurantDetail = () => {
    const restaurant = RESTAURANTS.find((r) => r.id === selectedRestaurant);
    if (!restaurant) return null;

    const menuItems = MENU_ITEMS[selectedRestaurant] || [];

    return (
      <div className="flex flex-col h-full bg-white">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-40 flex items-center justify-between">
          <button onClick={() => setSelectedRestaurant(null)} className="text-blue-600 text-sm font-semibold">
            ← Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">{restaurant.name}</h1>
          <div className="w-8" />
        </div>

        <div className="bg-gradient-to-b from-blue-50 to-white px-4 py-4 border-b border-gray-200">
          <div className="text-5xl mb-3">{restaurant.image}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{restaurant.name}</h2>
          <p className="text-sm text-gray-600 mb-3">{restaurant.description}</p>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold">⭐ {restaurant.rating} ({restaurant.reviews} reviews)</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              {restaurant.deliveryTime} min
            </div>
            <div className="flex items-center gap-1">
              <DollarSign size={16} />
              {restaurant.deliveryFee}
            </div>
            <div className="flex items-center gap-1">
              Min order: ${restaurant.minOrder}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Menu</h3>
          {menuItems.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{item.image}</span>
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                </div>
                <p className="text-sm font-semibold text-gray-900">${item.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => addToCart(item, selectedRestaurant)}
                className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          ))}
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="m-4 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            View Cart ({cartItems.length})
          </button>
        )}
      </div>
    );
  };

  // Cart drawer
  const renderCart = () => {
    const restaurant = RESTAURANTS.find((r) => r.id === selectedRestaurant);
    if (!restaurant) return null;

    const restaurantCartItems = cartItems.filter((i) => i.restaurantId === selectedRestaurant);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
        <div className="w-full bg-white rounded-t-2xl flex flex-col max-h-[80vh]">
          <div className="sticky top-0 border-b border-gray-200 p-4 flex items-center justify-between bg-white rounded-t-2xl">
            <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
            <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-900">{restaurant.name}</p>
            </div>

            {restaurantCartItems.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No items in cart</p>
            ) : (
              <div className="space-y-3">
                {restaurantCartItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                      <p className="text-sm text-gray-600">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, selectedRestaurant, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100"
                      >
                        <Minus size={16} className="text-gray-600" />
                      </button>
                      <span className="px-2 text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, selectedRestaurant, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100"
                      >
                        <Plus size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id, selectedRestaurant)}
                        className="p-1 hover:bg-red-50 text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 space-y-2 bg-gray-50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee:</span>
              <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee:</span>
              <span className="font-semibold">${serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
              <span className="text-gray-600">Est. Total:</span>
              <span className="text-lg font-bold text-blue-600">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                setShowCart(false);
                setShowCheckout(true);
              }}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Checkout
  const renderCheckout = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
            <button onClick={() => setShowCheckout(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee (15%):</span>
                  <span className="font-semibold">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (13% HST):</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-blue-600">
                  <span>Total:</span>
                  <span className="text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Delivery Address</label>
                <input
                  type="text"
                  defaultValue="123 King Street West, Toronto"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Special Instructions</label>
                <textarea
                  placeholder="Leave at door, ring doorbell, etc."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Payment Method</label>
                <div className="border border-gray-300 rounded-lg p-3 text-sm bg-gray-50">
                  💳 Visa ending in 4242
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handlePlaceOrder}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Order confirmation
  const renderOrderConfirmation = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
          <div className="mb-4 flex justify-center">
            <CheckCircle size={80} className="text-green-500 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">Your order has been placed successfully. Estimated delivery: 30-40 minutes</p>
          <p className="text-sm text-gray-500">Order ID: #ORD{Math.floor(Math.random() * 100000)}</p>
        </div>
      </div>
    );
  };

  // Search screen
  const renderSearch = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-40">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 mb-3">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants, food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="bg-transparent w-full text-sm outline-none"
          />
        </div>
      </div>

      {!searchQuery ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => handleSearch(search)}
                  className="px-3 py-2 bg-gray-100 text-gray-800 text-sm rounded-full hover:bg-gray-200"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Trending Searches</h3>
            <div className="space-y-2">
              {trendingSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => handleSearch(search)}
                  className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
                >
                  🔥 {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <p className="text-sm text-gray-600 mb-4">Search results for "{searchQuery}"</p>
          {RESTAURANTS.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisine.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))).map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => {
                setSelectedRestaurant(restaurant.id);
                setSelectedService(1);
              }}
              className="w-full text-left p-3 border border-gray-200 rounded-lg mb-2 hover:shadow-md"
            >
              <div className="flex gap-3 items-center">
                <span className="text-3xl">{restaurant.image}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{restaurant.name}</h4>
                  <p className="text-xs text-gray-600">{restaurant.cuisine.join(', ')}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 px-4 py-3 grid grid-cols-2 gap-3">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
            >
              <Icon size={18} className={service.textColor} />
              {service.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Orders screen
  const renderOrders = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-40">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        <p className="text-xs text-gray-600">Track and manage your deliveries</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Active Orders</h2>
        <div className="space-y-3 mb-6">
          {activeOrders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{order.merchant}</h3>
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                  <Navigation size={14} />
                  {order.status}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${order.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{order.progress}% complete</span>
                <span className="font-semibold text-gray-900">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-sm font-bold text-gray-900 mb-3">Order History</h2>
        <div className="space-y-2">
          {[
            { name: 'Sushi Masaki', date: 'Apr 10, 3:30 PM', total: 68.50 },
            { name: 'Pai Northern Thai', date: 'Apr 8, 7:00 PM', total: 52.45 },
            { name: 'Terroni Pizzeria', date: 'Apr 5, 6:15 PM', total: 45.99 },
          ].map((order, idx) => (
            <button
              key={idx}
              className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-gray-900 text-sm">{order.name}</p>
                <p className="text-xs text-gray-600">{order.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">${order.total.toFixed(2)}</span>
                <button className="text-blue-600 text-xs font-semibold">Re-order</button>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Deals screen
  const renderDeals = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-40">
        <h1 className="text-xl font-bold text-gray-900">Deals & Promos</h1>
        <p className="text-xs text-gray-600">Save big on food and services</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} className="text-orange-500" />
            <h2 className="text-sm font-bold text-gray-900">Flash Deals</h2>
          </div>
          <div className="space-y-3">
            {FLASH_DEALS.map((deal) => (
              <button
                key={deal.id}
                className="w-full bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 text-left border border-orange-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded">{deal.discount}</span>
                  <span className="text-xs font-semibold text-orange-600">{deal.ends}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{deal.merchant}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-orange-600">${deal.now.toFixed(2)}</span>
                  <span className="text-sm text-gray-600 line-through">${deal.original.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3">Group Buying Deals</h2>
          <div className="space-y-3">
            {[
              { title: 'Spa Package Retreat', discount: '60%', original: 299, now: 119, sold: 87 },
              { title: 'Cinema Ticket Bundle', discount: '45%', original: 80, now: 44, sold: 234 },
              { title: 'Hotel Weekend Getaway', discount: '50%', original: 599, now: 299, sold: 12 },
            ].map((deal, idx) => (
              <button
                key={idx}
                className="w-full bg-gray-50 rounded-lg p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">{deal.discount}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg font-bold text-blue-600">${deal.now}</span>
                  <span className="text-sm text-gray-600 line-through">${deal.original}</span>
                </div>
                <div className="text-xs text-gray-600">{deal.sold} people bought</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Profile screen
  const renderProfile = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-600 to-blue-50">
      <div className="bg-blue-600 text-white px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
            JD
          </div>
          <div>
            <h1 className="text-xl font-bold">James Davidson</h1>
            <p className="text-blue-100">james.davidson@email.com</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold">LocalNow+ Premium</h3>
            <p className="text-sm text-blue-100">Unlimited free delivery</p>
          </div>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50">
            Upgrade
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <button className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 flex items-center justify-between">
            <span className="font-semibold text-gray-900">💳 Wallet & Payments</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 flex items-center justify-between">
            <span className="font-semibold text-gray-900">📍 Saved Addresses</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 flex items-center justify-between">
            <span className="font-semibold text-gray-900">❤️ Favorites</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
            <span className="font-semibold text-gray-900">⚙️ Settings & Privacy</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <button className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 flex items-center justify-between">
            <span className="font-semibold text-gray-900">📞 Contact Support</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600 font-semibold">
            Logout
          </button>
        </div>

        <p className="text-xs text-gray-600 text-center mt-4">LocalNow v1.0 • Built for Canada</p>
      </div>
    </div>
  );

  // ========== MAIN RENDER ==========

  return (
    <div className="h-screen bg-white flex flex-col font-sans overflow-hidden">
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {orderConfirmed && renderOrderConfirmation()}
        {showCheckout && renderCheckout()}
        {showCart && renderCart()}

        {selectedService === 1 && !selectedRestaurant && renderRestaurantList()}
        {selectedRestaurant && renderRestaurantDetail()}

        {currentTab === 'home' && !selectedService && renderHome()}
        {currentTab === 'search' && renderSearch()}
        {currentTab === 'orders' && renderOrders()}
        {currentTab === 'deals' && renderDeals()}
        {currentTab === 'profile' && renderProfile()}
      </div>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 bg-white sticky bottom-0">
        <div className="flex items-center justify-around">
          <button
            onClick={() => {
              setCurrentTab('home');
              setSelectedService(null);
              setSelectedRestaurant(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-4 text-xs font-semibold transition-colors ${
              currentTab === 'home' && !selectedService ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Home size={24} className="mb-1" />
            Home
          </button>
          <button
            onClick={() => {
              setCurrentTab('search');
              setSelectedService(null);
              setSelectedRestaurant(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-4 text-xs font-semibold transition-colors ${
              currentTab === 'search' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Search size={24} className="mb-1" />
            Search
          </button>
          <button
            onClick={() => {
              setCurrentTab('orders');
              setSelectedService(null);
              setSelectedRestaurant(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-4 text-xs font-semibold transition-colors relative ${
              currentTab === 'orders' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <ShoppingCart size={24} className="mb-1" />
            Orders
            {activeOrders.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeOrders.length}</span>}
          </button>
          <button
            onClick={() => {
              setCurrentTab('deals');
              setSelectedService(null);
              setSelectedRestaurant(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-4 text-xs font-semibold transition-colors ${
              currentTab === 'deals' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Zap size={24} className="mb-1" />
            Deals
          </button>
          <button
            onClick={() => {
              setCurrentTab('profile');
              setSelectedService(null);
              setSelectedRestaurant(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-4 text-xs font-semibold transition-colors ${
              currentTab === 'profile' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <User size={24} className="mb-1" />
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}
