# Best Western Imperio - Luxury Hotel Website + Admin Panel PRD

## Problem Statement
Premium luxury hotel website + admin panel for "Best Western Imperio, Hisar"

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI + MongoDB + JWT Auth (httpOnly cookies)
- **Database**: MongoDB (users, rooms, bookings, customers, contacts, settings)

## What's Been Implemented (Feb 2026)

### Public Website (/)
- Hero with hotel exterior image + parallax
- Floating booking bar (Calendar/Select pickers)
- About section, Rooms with modals, 2D Floor plan booking
- Amenities grid, Masonry gallery with categories, Testimonials
- Location map, Contact form (MongoDB), Mobile responsive

### Admin Panel (/admin)
- JWT auth with admin login (admin@bwimperio.com / bwimperio)
- Dashboard with analytics cards + booking trends chart
- Room Management (CRUD, table/grid views, filters, search)
- Floor Layout Control (visual editor, real-time status updates)
- Booking Management (CRUD, customer tracking)
- Settings (hotel details management)
- 30 rooms seeded across 3 floors
- Changes sync between admin and public site

## Backlog
### P1 (Important)
- Customer management module
- Image upload (currently URL-based)
- Email notifications on bookings
- Reports export (CSV/PDF)
- Role management (Super Admin / Staff)

### P2 (Nice to have)
- Dark/light mode toggle for admin
- Real payment integration
- Seasonal pricing
- Occupancy rate analytics
