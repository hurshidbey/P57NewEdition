# Server Tests

This directory contains tests for the P57 server application.

## Running Tests

First, install dependencies:
```bash
npm install
```

Then run tests:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- `api/` - API endpoint tests
  - `health.test.ts` - Health check endpoint tests
  
- `middleware/` - Middleware tests
  - `rate-limit.test.ts` - Rate limiting configuration tests
  
- `utils/` - Utility function tests
  - `logger.test.ts` - Logger sanitization tests

## Writing Tests

1. Create test files with `.test.ts` extension
2. Use `describe` blocks to group related tests
3. Use `it` blocks for individual test cases
4. Mock external dependencies using `vi.mock()`
5. Test both success and error scenarios

## Important Notes

- The tests use Vitest as the test runner
- Supertest is needed for integration tests (install with `npm install`)
- Tests should not make actual API calls or database connections
- Sensitive data should never be logged in tests

## Pre-Launch Checklist

Before launching, ensure:
- [ ] All tests pass
- [ ] No console.log statements in production code
- [ ] Rate limits are properly configured
- [ ] Session security is enabled
- [ ] Payment callbacks are verified