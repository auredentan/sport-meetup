# Claude Development Guide - SportMeetup

This file contains important context and guidelines for AI assistants working on this project.

## Project Overview

SportMeetup is a web application for finding and organizing sports activities. Users can create activities, join existing ones, and manage their participation in various sports events.

**Tech Stack:**
- Next.js 16 (App Router)
- TypeScript
- SQLite with Drizzle ORM
- WorkOS for authentication
- Leaflet + OpenStreetMap for maps (free, no API key)
- Tailwind CSS for styling

## Architecture

### Database Schema

Located in `src/db/schema.ts`:

- **users**: User profiles from WorkOS
- **activities**: Sports activities with location coordinates
  - Supports recurring activities (daily, weekly, biweekly, monthly)
  - Stores `latitude` and `longitude` for map display
- **participants**: Join table linking users to activities

### Key Features

1. **Authentication**: WorkOS-based auth with session management
2. **Activity Management**: CRUD operations for activities
3. **Recurring Activities**: Support for repeating events
4. **Location Services**:
   - OpenStreetMap Nominatim for geocoding (free)
   - Leaflet for interactive maps (no API key needed)
5. **Participant Management**: Users can join/leave activities

## Important Patterns

### Location Handling

**DO:**
- Use `LocationAutocomplete` component for address input
- Store both address string AND coordinates (lat/lng)
- Use Nominatim API for geocoding (respect rate limits)

**DON'T:**
- Use Google Maps (project uses open-source alternatives)
- Forget to include coordinates when creating/updating activities

### Date/Time Formatting

For recurring activities:
- Store `date` as the first occurrence
- `recurrenceDay` stores day of week (0-6) for weekly patterns
- Use `getNextOccurrence()` from `@/lib/recurrence` to calculate next date

### API Routes

Pattern: `/api/activities/[id]/route.ts`
- GET: Fetch single activity
- PATCH: Update activity (organizer only)
- DELETE: Remove activity (organizer only)

Always check:
1. User authentication (`getSession()`)
2. Organizer permissions for modifications
3. Proper validation of required fields

### Client Components

**When to use "use client":**
- Interactive forms (CreateActivityForm, EditActivityForm)
- Components with state (LocationAutocomplete, MapView)
- Components using browser APIs

**Server Components (default):**
- Pages that fetch data
- Layout components
- Static content

## Common Tasks

### Adding a New Activity Field

1. Update schema in `src/db/schema.ts`
2. Run `pnpm db:push` to update database
3. Update CreateActivityForm component
4. Update EditActivityForm component
5. Update API routes (POST and PATCH)
6. Update activity detail page display

### Adding a New API Endpoint

1. Create file: `src/app/api/[resource]/route.ts`
2. Import necessary dependencies (db, session, schemas)
3. Always check authentication first
4. Use try-catch for error handling
5. Return proper HTTP status codes
6. Use `NextResponse.json()` for responses

### Debugging Tips

**Common Issues:**
- **Leaflet not rendering**: Check for "use client" directive
- **Location autocomplete not working**: Verify Nominatim API calls (check rate limits)
- **Dates showing incorrectly**: Use proper timezone handling
- **Authentication issues**: Check WorkOS environment variables

## Code Style Guidelines

### File Organization
```
src/
├── app/                    # Next.js pages and API routes
│   ├── activities/         # Activity-related pages
│   │   ├── [id]/          # Dynamic activity detail
│   │   │   ├── edit/      # Edit page
│   │   │   └── page.tsx   # Detail view
│   │   └── create/        # Create new activity
│   ├── api/               # API endpoints
│   └── dashboard/         # User dashboard
├── components/            # Reusable React components
├── db/                    # Database schema and config
└── lib/                   # Utility functions
```

### Naming Conventions
- Components: PascalCase (e.g., `CreateActivityForm`)
- Files: kebab-case for utils, PascalCase for components
- API routes: RESTful naming (`/api/activities/[id]`)
- Database columns: snake_case (e.g., `created_at`)

### Component Structure
```typescript
"use client"; // Only if needed

import { ... } from "..."; // External imports
import { ... } from "@/..."; // Internal imports

// Type definitions
interface Props {
  // ...
}

// Main component
export function ComponentName({ props }: Props) {
  // State
  const [state, setState] = useState();

  // Handlers
  function handleEvent() {
    // ...
  }

  // Render
  return (
    // JSX
  );
}
```

## Environment Variables

Required in `.env.local`:
```env
# WorkOS Authentication
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback
WORKOS_COOKIE_PASSWORD=
```

**Note:** No API keys needed for maps! OpenStreetMap is free.

## Testing

### Automated Testing with Playwright

The project uses Playwright for end-to-end testing. Tests are located in the `tests/` directory.

**Test Files:**
- `homepage.spec.ts` - Homepage and navigation tests
- `activities-filters.spec.ts` - Activity filtering tests (including date filtering)
- `location-autocomplete.spec.ts` - OpenStreetMap location autocomplete tests
- `activity-crud.spec.ts` - Activity CRUD operation tests
- `join-leave.spec.ts` - Join/leave functionality tests

**Running Tests:**
```bash
pnpm test              # Run all tests headless
pnpm test:ui           # Interactive UI mode
pnpm test:headed       # Run with visible browser
pnpm test:report       # View HTML report
```

**Test Coverage:**
- 30+ passing tests
- Date filtering functionality
- Location autocomplete
- Join/leave activity actions
- Homepage "Your Activities" section
- Map display
- Activity listing and details

**Note**: Some tests require authentication and will be skipped. To fully test protected routes, implement session mocking.

### Manual Testing Checklist

When adding new features:
- [ ] Test authentication flow
- [ ] Test as organizer and participant
- [ ] Test with and without permissions
- [ ] Test form validation
- [ ] Test error states
- [ ] Test responsive design (mobile/desktop)
- [ ] Verify database updates
- [ ] Check for proper redirects
- [ ] Run automated tests (`pnpm test`)
- [ ] Write new tests for new features

## Dependencies

### Core
- `next`: Web framework
- `react`, `react-dom`: UI library
- `drizzle-orm`: Database ORM
- `better-sqlite3`: SQLite driver

### Maps & Location
- `leaflet`: Map library
- `react-leaflet`: React bindings for Leaflet
- `@types/leaflet`: TypeScript types

### Authentication
- `@workos-inc/node`: WorkOS SDK

### Development
- `typescript`: Type checking
- `drizzle-kit`: Database migrations
- `tailwindcss`: Styling

## Known Limitations

1. **Nominatim Rate Limits**: Free tier has rate limits. Consider adding delays or caching for production.
2. **SQLite**: Good for development, consider PostgreSQL for production.
3. **Recurring Activities**: Instances are calculated dynamically, not stored separately.
4. **Time Zones**: Currently uses local time, may need UTC handling for global use.

## Future Improvements

Ideas for future development:
- [ ] Add activity categories/tags
- [ ] Implement search and filtering on activities page
- [ ] Add user profiles with stats
- [ ] Email notifications for joined activities
- [ ] Activity comments/discussion
- [ ] Image uploads for activities
- [ ] Weather integration
- [ ] Mobile app (React Native)
- [ ] Activity recommendations based on preferences

## Useful Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm build              # Build for production
pnpm start              # Start production server

# Database
pnpm db:push            # Push schema changes
pnpm db:generate        # Generate migrations
pnpm db:migrate         # Run migrations
pnpm db:studio          # Open Drizzle Studio
pnpm db:seed            # Populate with fake data (clears existing data)

# Testing
pnpm test               # Run Playwright tests
pnpm test:ui            # Run tests in interactive UI mode
pnpm test:headed        # Run tests with visible browser
pnpm test:report        # View HTML test report

# Linting
pnpm lint               # Run ESLint
```

### Database Seeding

The project includes a seed script (`scripts/seed.ts`) that populates the database with realistic test data:
- 5 fake users with names and emails
- 14+ activities across various sports
- Activities in famous locations worldwide with real coordinates
- Multiple participants per activity
- Mix of one-time and recurring activities

Run `pnpm db:seed` to populate the database for testing. This is useful for:
- Testing features without manually creating data
- Demonstrating the app to stakeholders
- Development and debugging
- Testing edge cases (full activities, recurring events, etc.)

## Getting Help

When stuck:
1. Check this file first
2. Review similar existing components
3. Check Next.js 16 App Router documentation
4. Review Drizzle ORM documentation
5. Check WorkOS AuthKit documentation
6. Review Leaflet/React-Leaflet documentation

## Key Files to Reference

- `src/db/schema.ts` - Database schema
- `src/lib/session.ts` - Authentication helper
- `src/lib/recurrence.ts` - Recurring activity logic
- `src/components/LocationAutocomplete.tsx` - Location search
- `src/components/MapView.tsx` - Map display
- `src/app/activities/create/CreateActivityForm.tsx` - Example form

## Security Considerations

- Always validate user input on server side
- Check organizer permissions before allowing edits/deletes
- Sanitize user-generated content
- Use WorkOS for secure authentication
- Never expose sensitive data in client components
- Rate limit API endpoints in production
- Validate coordinates are within reasonable bounds

## Performance Tips

- Use server components by default
- Only use client components when necessary
- Implement pagination for activity lists
- Cache geocoding results when possible
- Optimize images if adding upload feature
- Use Next.js Image component for images
- Consider database indexing for frequent queries

---

**Last Updated:** 2025-11-30
**Project Version:** 0.1.0
