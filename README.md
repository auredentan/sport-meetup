# SportMeetup

A web application to find and connect with people for sports activities in your area. Create, join, and manage sport events with ease.

## Features

- **User Authentication**: Secure login/signup via WorkOS AuthKit
- **Activity Browsing**: Search and filter activities by sport type, skill level, and location
- **Activity Creation**: Create your own sports activities with all details
- **Location Autocomplete**: OpenStreetMap Nominatim autocomplete for easy location selection
- **Map Display**: View activity locations on interactive Leaflet maps with OpenStreetMap tiles
- **Join Activities**: Join activities organized by others
- **Dashboard**: Manage your organized and joined activities
- **Participant Management**: See who's joining your activities
- **Recurring Activities**: Create and manage recurring sports activities

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Drizzle ORM
- **Authentication**: WorkOS
- **Maps**: Leaflet with OpenStreetMap (free, no API key required)
- **Geocoding**: OpenStreetMap Nominatim API (free, open-source)
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Clone the repository and navigate to the project folder:

```bash
cd sport-meetup
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your WorkOS credentials:

```env
# WorkOS Configuration
WORKOS_API_KEY=your_workos_api_key_here
WORKOS_CLIENT_ID=your_workos_client_id_here
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback
WORKOS_COOKIE_PASSWORD=your_32_char_cookie_password_here
```

Note: No API key needed for maps! The app uses OpenStreetMap which is free and open-source.

4. Set up the database:

```bash
pnpm db:push
```

5. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## WorkOS Setup

1. Create a WorkOS account at https://workos.com
2. Create a new project
3. Enable AuthKit in the project settings
4. Add `http://localhost:3000/api/auth/callback` as a redirect URI
5. Copy your API Key and Client ID to the `.env.local` file

## Maps & Geocoding

This app uses **free and open-source mapping solutions**:

- **Leaflet** - Interactive map library
- **OpenStreetMap** - Map tiles (no API key required)
- **Nominatim** - Geocoding and location search (free OpenStreetMap service)

No setup or API keys needed! Just install the dependencies and you're ready to go.

## Database Commands

- `pnpm db:push` - Push schema changes to database
- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio to browse data
- `pnpm db:seed` - Populate database with fake data for testing

## Testing

The project uses Playwright for end-to-end testing:

- `pnpm test` - Run all tests
- `pnpm test:ui` - Run tests in interactive UI mode
- `pnpm test:headed` - Run tests in headed mode (visible browser)
- `pnpm test:report` - View HTML test report

**Test Coverage**: 30+ tests covering:
- Homepage and navigation
- Activity filtering (including date range filtering)
- Location autocomplete
- Activity CRUD operations
- Join/leave functionality
- Maps display

See [tests/README.md](tests/README.md) for detailed test documentation.

### Seeding the Database

To populate your database with sample data for testing:

```bash
pnpm db:seed
```

This will create:
- 5 fake users
- 14+ activities across various sports and locations (Running, Cycling, Tennis, Basketball, Soccer, Yoga, etc.)
- Activities in famous locations worldwide (Central Park, Golden Gate Park, Hyde Park, etc.)
- Multiple participants per activity
- Mix of one-time and recurring activities

Test user emails (no password needed in development):
- sarah.johnson@example.com
- mike.chen@example.com
- emma.davis@example.com
- james.wilson@example.com
- olivia.brown@example.com

**Note:** Running the seed script will clear all existing data first.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── activities/         # Activity pages (list, detail, create)
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   └── page.tsx           # Homepage
├── components/            # Shared components
├── db/                    # Database schema and connection
└── lib/                   # Utility functions (auth, session)
```

## License

MIT
