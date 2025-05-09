# NotaryNow - Online Notary Services Platform

NotaryNow is a web application that connects customers with professional notaries. It allows customers to search for notaries, book appointments, and manage their notarization needs. Notaries can manage their profiles, services, and appointments through a dedicated dashboard.

## Features

- **User Authentication** - Secure login and registration system with role-based access
- **Notary Search** - Find notaries by location, service, and availability
- **Appointment Booking** - Schedule notary appointments with real-time availability
- **Dashboard Management** - Separate dashboards for customers, notaries, and administrators
- **Reviews System** - Leave and view reviews for notaries
- **Service Management** - Notaries can add, update, and remove their offered services

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm 9+ installed

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/notarynow.git
cd notarynow
```

2. Run the setup script to install dependencies and initialize the database:

```bash
chmod +x setup.sh
./setup.sh
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Default Login Credentials

The setup script seeds the database with the following default accounts:

- **Customer**: jane.doe@example.com / customer123
- **Notary**: john.smith@example.com / notary123
- **Admin**: admin@notarynow.com / admin123

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/app/api` - API routes
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and database clients
- `/src/providers` - React context providers
- `/prisma` - Database schema and migrations

## Development

### Database Management

- View the database schema: `npx prisma studio`
- Reset the database: `npx prisma migrate reset`
- Apply migrations: `npx prisma migrate dev`

### API Endpoints

- Authentication: `/api/auth/[...nextauth]`, `/api/auth/register`
- Notaries: `/api/notaries`, `/api/notaries/profile`, `/api/notaries/services/[id]`
- Appointments: `/api/appointments`, `/api/appointments/[id]`
- Services: `/api/services`
- Certifications: `/api/certifications`
- Reviews: `/api/reviews`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
