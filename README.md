# Optimus Prime - E-commerce platform

A modern, responsive single-page React application built with Vite and Tailwind CSS. This is a placeholder application for a cloud computing project that will eventually connect to User, Inventory, and Payment microservices.

## 🚀 Features

### Application Sections

1. **Home Section**
   - Hero banner with gradient background
   - Welcome message and call-to-action button
   - Smooth scroll navigation

2. **Products Section** (Inventory Microservice)
   - Grid layout displaying 6 product cards
   - Each product includes:
     - Colorful gradient placeholder image with icon
     - Product name and description
     - Price display
     - "Add to Cart" button (placeholder)
   - Fully responsive design

3. **My Account Section** (User Microservice)
   - Login form with:
     - Email and password fields
     - "Remember me" checkbox
     - "Forgot password?" link
     - Login button
     - Sign-up link (placeholder)

4. **Cart & Payments Section** (Payments Microservice)
   - **Functional Cart Summary** with Redux state management:
     - Dynamic cart items display with quantity controls
     - Real-time subtotal, shipping, tax calculations
     - Total with all charges
     - Add/remove item functionality
     - Clear cart option
   - Payment form with:
     - Card number, expiry date, CVV fields
     - Cardholder name field
     - "Complete Purchase" button (shows total, disabled when cart is empty)
     - Secure payment badge

## 🛠️ Technologies

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React-Redux** - React bindings for Redux
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Build

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` folder.

## 📁 Project Structure

```
code/
├── src/
│   ├── components/       # Modular React components
│   │   ├── Header.jsx    # Navigation header component (with cart badge)
│   │   ├── Home.jsx      # Home/Hero section component
│   │   ├── Products.jsx  # Products section (Inventory Microservice)
│   │   ├── Account.jsx   # Account section (User Microservice)
│   │   ├── Cart.jsx      # Cart & Payments section (Payments Microservice)
│   │   ├── Footer.jsx    # Footer component
│   │   └── index.js      # Component exports
│   ├── store/            # Redux state management
│   │   ├── cartSlice.js  # Cart slice with reducers and actions
│   │   └── store.js      # Redux store configuration
│   ├── App.jsx           # Main application component
│   ├── index.css         # Tailwind CSS imports and global styles
│   └── main.jsx          # Application entry point
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── vite.config.js        # Vite configuration
```

## 🛒 Cart Functionality (Redux State Management)

The application uses **Redux Toolkit** for managing the shopping cart state:

### Features:
- **Add to Cart**: Click "Add to Cart" on any product to add it to your cart
- **Remove from Cart**: Use the minus button to decrease quantity or remove items
- **Quantity Control**: Increment/decrement item quantities with + and - buttons
- **Clear Cart**: Remove all items at once with the "Clear Cart" button
- **Cart Badge**: Real-time cart item count displayed in the header navigation
- **Dynamic Calculations**:
  - Subtotal based on all cart items
  - Shipping: FREE for orders over $200, otherwise $10
  - Tax: 8% of subtotal
  - Final total with all charges included
- **Disabled Checkout**: Purchase button is disabled when cart is empty

### Redux Store Structure:
```javascript
cart: {
  items: [],           // Array of cart items
  totalQuantity: 0,    // Total number of items
  totalAmount: 0       // Total price of all items
}
```

## 🎨 Design

- **Color Scheme**: Professional gray palette with blue accent (#2563EB)
- **Responsive Design**: Mobile-first approach
  - Mobile: Single column layout
  - Tablet: 2-column grid for products
  - Desktop: 3-column grid for products
- **Interactions**: Smooth transitions and hover effects throughout

## 🔮 Future Development

This placeholder application is designed to be connected to three microservices:

1. **User Microservice** - Handle authentication and user management
2. **Inventory Microservice** - Manage product catalog and inventory
3. **Payment Microservice** - Process payments and transactions

All forms and buttons are currently non-functional placeholders, ready to be integrated with backend APIs.

## 📝 License

This project is part of a cloud computing course project.
