# 🟤 Cocoa – Chat-Based B2B Procurement Platform

**Cocoa** is a real-time, chat-based procurement marketplace that transforms how businesses connect, collaborate, and close deals. It simplifies the traditionally slow and fragmented B2B procurement process by enabling direct communication between verified vendors and buyers.

## 🌟 Why Cocoa?

Traditional B2B procurement is broken. Long RFP cycles, endless email chains, and fragmented communication lead to missed opportunities and delayed deals. Cocoa fixes this by bringing procurement into the modern age with instant, secure, chat-based interactions.

## 🚀 Key Features

### 🔗 **Instant Chat-Based Procurement**
Skip the long RFP cycles. Connect with suppliers or clients instantly via real-time chat for faster decision-making and deal closure.

### 🛍️ **Verified Vendors & Buyers**
All users go through a comprehensive verification process to ensure trust, credibility, and security in every transaction.

### 🧾 **Smart Invoicing & Payment Terms**
Generate, manage, and share professional invoices with customizable payment terms and due dates. Streamline your billing process.

### 📅 **Integrated Calendars & Booking**
Schedule demos, consultations, and order follow-ups seamlessly from your dashboard. Never miss an important meeting again.

### 🗃️ **Service & Product Catalogue**
Buyers can browse through categorized vendor offerings with detailed listings, making discovery effortless.

### 👥 **Role-Based Dashboards**
Distinct, tailored dashboards for buyers, vendors, and admins with role-specific views and controls.

### 🛡️ **Admin Controls**
Comprehensive admin panel to verify accounts, manage content, monitor platform activity, and maintain platform integrity.

## 🛠️ Tech Stack

- **Frontend**: React.js, TypeScript, TailwindCSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth with role-based access control
- **Cloud Storage**: Firebase Storage
- **Real-time Features**: Firebase real-time database
- **Build Tool**: Vite

## 📂 Project Structure

```
cocoa-v3/
├── assets/                    # Static assets (images, icons, logos)
├── components/                # Reusable UI components
│   ├── forms/                 # Form components
│   ├── layout/                # Layout components (headers, sidebars)
│   └── ui/                    # Basic UI elements (buttons, modals)
├── pages/                     # Route-specific page components
│   ├── Invoice/               # Invoice management pages
│   ├── Calendar/              # Calendar and booking pages
│   ├── Dashboard/             # Dashboard pages by role
│   └── Auth/                  # Login, signup, verification pages
├── routes/                    # React Router configuration
│   └── ProtectedRoute.tsx     # Role-based route protection
├── utils/                     # Utility functions and configurations
│   ├── firebase.ts            # Firebase configuration
│   ├── auth.ts                # Authentication helpers
│   └── constants.ts           # App-wide constants
├── types/                     # TypeScript type definitions
├── App.tsx                    # Root application component
├── main.tsx                   # Application entry point
└── index.css                  # Global styles (Tailwind base)
```

## 👥 User Roles

### Buyers
- Browse vendor catalogs
- Initiate chat conversations
- Manage purchase orders
- Schedule vendor meetings

### Vendors
- Showcase products/services
- Respond to buyer inquiries
- Generate and send invoices
- Manage bookings and demos

### Admins
- Verify user accounts
- Monitor platform activity
- Manage content and listings
- Handle disputes and support

**Made with ❤️ by the Cocoa Team**

*Transforming B2B procurement, one chat at a time.*
