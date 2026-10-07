# EcoLoop Testing Documentation

## Overview

EcoLoop is a full-stack application with a React 18 frontend and Spring Boot 3.3 backend. This document describes how to run all tests across the stack.

## Frontend Tests

### Unit Tests (Vitest + React Testing Library + MSW)

```bash
cd web-app-frontend
npm test              # Run all tests once
npm run test:ui       # Interactive UI mode
npm run test:coverage # Run with coverage report
```

- **Framework**: Vitest 2.x with happy-dom
- **Testing Library**: @testing-library/react v16, @testing-library/user-event v14
- **API Mocking**: MSW 2.x (Mock Service Worker) via `src/test/msw/handlers.ts`
- **Setup**: `src/test/setup.ts` (resets MSW handlers, cleans DOM, resets auth store after each test)

### Test Structure

| Location | Contents |
|----------|----------|
| `src/pages/*.test.tsx` | Page-level integration tests (MSW + RTL) |
| `src/components/ui/*.test.tsx` | Component unit tests |
| `src/test/msw/handlers.ts` | Mock API handlers for all endpoints |
| `src/test/msw/server.ts` | MSW server setup |
| `src/test/test-utils.tsx` | Test providers (QueryClient, MemoryRouter, Toast) |
| `src/test/setup.ts` | Global vitest setup/teardown |

### Test Pages Covered

- Login (7 tests)
- Partners (10 tests)
- PartnerDetail (9 tests)
- Pickups (9 tests)
- Audit (12 tests)
- Users (10 tests)
- Overview (8 tests)
- Health (11 tests)
- AppLayout (3 tests)
- AdminGuard (2 tests)

**Total: ~85+ frontend tests**

### Known Limitations

- **Select dropdowns**: Custom Select component (`src/components/ui/select.tsx`) does not reliably open in happy-dom. Filter/filter-by-status tests verify existence of data rather than full Select interaction.
- **Drawer close buttons**: `DrawerClose` with `asChild` pattern may not work in happy-dom. Tests use `Button onClick` approach for drawer close verification.

## Backend Tests (Maven)

```bash
cd eco-loop-backend-architecture
mvn test
```

Existing test classes:
- `EcoLoopApplicationTests` - Context loads
- `BackendWorkflowTests` - Classification stub, routing offer state machine
- `RoutingServiceTest` - Routing score calculation
- `ModularityTests` - Module boundary verification

## E2E Tests (Playwright)

```bash
cd web-app-frontend
npx playwright install --with-deps chromium
npx playwright test
npx playwright test --ui       # Interactive mode
npx playwright show-report    # View report
```

Requires both frontend (`npm run dev` on :5173) and backend (`mvn spring-boot:run` on :8090) running.

## CI/CD

- **`.github/workflows/frontend.yml`**: Frontend tests, typecheck, lint, build, E2E
- **`.github/workflows/backend.yml`**: Backend tests with PostgreSQL and Redis service containers

## Prerequisites for Local Testing

1. Docker Desktop running
2. Start services: `cd eco-loop-backend-architecture && docker compose up -d`
3. Start backend: `mvn spring-boot:run` (port 8090)
4. Start frontend: `npm run dev` (port 5173)
5. Verify: `curl http://localhost:8090/actuator/health`

## Test Data

### Frontend MSW Mocks
Test data defined in `src/test/msw/handlers.ts`:
- Users: 4 users (admin, household x2, partner)
- Partners: 3 partners (approved, pending, rejected)
- Pickups: 4 pickups (completed, pending, accepted, cancelled)
- Audit logs: 4 entries (user.activate, partner.approve, pickup.reassign, system.health_check)

### Backend
Test fixtures configured in application-test.properties (if present) or H2 in-memory database during `mvn test`.
