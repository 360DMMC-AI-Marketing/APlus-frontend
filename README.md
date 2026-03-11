# APlusMedDepot - B2B Medical Supply Marketplace

A modern React-based marketplace connecting healthcare providers with medical supply vendors.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS + DaisyUI
- **State Management:** Zustand
- **Routing:** React Router v6
- **Icons:** Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable components
├── pages/           # Page components
│   ├── admin/       # Admin dashboard
│   ├── vendor/      # Vendor portal
│   └── ...          # Public pages
├── store/           # Zustand state management
├── utils/           # Utility functions
└── assets/          # Static assets
```

## Features

- Multi-role authentication (Customer, Vendor, Admin)
- Product catalog with advanced filtering
- Shopping cart and checkout
- Vendor management and analytics
- Admin compliance dashboard
- Payment processing (Stripe, PayPal, Net 30)
- FDA compliance tracking

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_KEY=your_stripe_key
VITE_PAYPAL_CLIENT_ID=your_paypal_id
```

## License

Proprietary - All rights reserved

## Contact

support@aplusmeddepot.com
