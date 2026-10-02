---
name: api-mock
description: "Create API mocks and stubs: generate mock servers, fixture data, and test doubles from API specs or existing code."
source: community
allowed-tools: "*"
user-invocable: true
---

# API Mock Generator

Generate mock APIs, fixture data, and test doubles for development and testing.

## STEP 1: ANALYZE THE API

Parse $ARGUMENTS for:
- API specification (OpenAPI/Swagger, GraphQL schema, TypeScript types)
- Existing API code to mock
- Specific endpoints to mock
- Data requirements (realistic data, edge cases, error responses)

If no spec is provided, infer the API shape from:
- TypeScript types and interfaces
- Existing API route handlers
- Frontend fetch/API client code

## STEP 2: GENERATE MOCK DATA

Create realistic fixture data:

- Use appropriate fake data (names, emails, dates, UUIDs - not "test123")
- Cover the full range of valid values
- Include edge cases (empty arrays, null fields, max-length strings)
- Create related data with correct foreign key relationships
- Build factory functions for dynamic test data generation

## STEP 3: CREATE MOCK SERVER

Set up a mock server or mock layer:

### For Development
- Mock server (MSW, json-server, or custom Express)
- Interceptors for fetch/axios
- Configurable response delays for loading state testing
- Error simulation (500s, 404s, timeouts, network errors)

### For Testing
- In-memory mock implementations
- Request recording and assertion
- Configurable responses per test
- Reset between tests

## STEP 4: GENERATE ERROR SCENARIOS

Create mocks for error cases:
- 400 Bad Request (validation errors with field-level details)
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 429 Rate Limited (with retry-after header)
- 500 Internal Server Error
- Network timeout
- Malformed response

## STEP 5: OUTPUT

Provide:
- Mock server configuration or interceptor setup
- Fixture data files
- Factory functions for test data
- Instructions for switching between mock and real API
