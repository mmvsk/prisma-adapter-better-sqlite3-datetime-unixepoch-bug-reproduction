# `@prisma/adapter-better-sqlite3` DateTime Bug with `unixepoch-ms` format

Minimal reproduction of a bug in `@prisma/adapter-better-sqlite3` where DateTime fields return `Invalid Date` when using `timestampFormat: "unixepoch-ms"`.

## Bug Description

When using the `@prisma/adapter-better-sqlite3` adapter with `timestampFormat: "unixepoch-ms"`, all DateTime fields return `Invalid Date`:

- `create()` returns `Invalid Date` for DateTime fields
- `findMany()`, `findFirst()`, etc. return `Invalid Date`
- `aggregate()` with `_min`/`_max` returns `Invalid Date`

The same operations work correctly with the default `timestampFormat: "iso8601"`.

## Environment

- Node.js: v24.0.0+
- Prisma: 7.1.0
- @prisma/adapter-better-sqlite3: 7.1.0

## Steps to Reproduce

1. Clone this repository
2. Install dependencies and run test:
   ```bash
   npm install
   npm test
   ```

## Expected Behavior

Both tests should pass, returning valid Date objects for DateTime fields.

## Actual Behavior

- **Test 1 (iso8601)**: PASSES - all DateTime operations return valid Date objects
- **Test 2 (unixepoch-ms)**: FAILS - all DateTime operations return `Invalid Date`

### Example Output

```
@prisma/adapter-better-sqlite3 DateTime Bug Reproduction

Test 1: DateTime with iso8601 format
  Created event: { id: 1, name: 'test', createdAt: 2025-12-09T06:48:53.492Z }
  Aggregate result: { _min: { createdAt: 2025-12-09T06:48:53.492Z }, _max: { createdAt: 2025-12-09T06:48:53.492Z } }
  _min.createdAt is valid Date: true
  PASS

Test 2: DateTime with unixepoch-ms format
  Created event: { id: 1, name: 'test', createdAt: Invalid Date }
  Aggregate result: { _min: { createdAt: Invalid Date }, _max: { createdAt: Invalid Date } }
  _min.createdAt is valid Date: false
  FAIL - Expected valid Date, got: Invalid Date
```

## Related Issue

https://github.com/prisma/prisma/issues/XXXXX
