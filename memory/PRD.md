# Best Western Imperio - Luxury Hotel Website PRD

## Problem Statement
Premium luxury hotel website for "Best Western Imperio, Hisar" with dark + gold theme, modern UI, and interactive features.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Database**: MongoDB (contacts collection)

## User Personas
- Hotel guests looking to book rooms
- Event organizers seeking banquet info
- Business travelers checking amenities

## Core Requirements (Static)
1. Hero section with parallax effect and booking bar
2. About hotel section
3. Rooms section with modal details
4. 2D Floor plan booking UI (cinema-seat style)
5. Amenities grid
6. Masonry gallery with lightbox
7. Testimonial slider
8. Location with Google Map
9. Contact form with MongoDB storage
10. Mobile responsive with sticky booking button

## What's Been Implemented (Feb 2026)
- Full single-page marketing site with all 10 sections
- Dark (#0A0A0A) + Gold (#D4AF37) theme
- Glassmorphism navbar with scroll effect
- Full-screen hero with slow zoom background
- Floating booking bar (Calendar + Select pickers)
- About section with icon highlights
- Room cards with detail modals (image slider)
- Interactive floor plan with 3 floors, color-coded rooms
- Amenities grid with hover glow effects
- Masonry gallery with lightbox dialog
- Auto-scrolling testimonial carousel
- Location section with dark-themed Google Map
- Contact form (name, email, phone, message) -> MongoDB
- Mobile responsive + sticky booking CTA
- Backend: GET /api/rooms, GET /api/floors, POST /api/contact

## Backlog
### P0 (Critical)
- None remaining

### P1 (Important)
- User-provided images integration (user to supply)
- Real booking system with payment
- Email notifications on contact form submit
- Admin panel for room management

### P2 (Nice to have)
- Room availability calendar integration
- Multi-language support
- SEO meta tags and structured data
- Performance optimization (image CDN, lazy loading improvements)

## Next Tasks
- Await user-provided images
- Implement real booking flow if needed
- Add admin dashboard for hotel management
