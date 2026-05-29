# Security Specification - Chercher Secondary School Admin Portal

## Data Invariants
1. A Student must always belong to a valid Grade.
2. A Subject must always belong to a valid Grade.
3. A Result must always be linked to a valid Student and Subject.
4. Only authenticated Admins can perform any write or read operations.
5. Teacher IDs must be unique (handled at application level, ideally rules would check exists but we use custom IDs).

## The "Dirty Dozen" Payloads (Targeting PERMISSION_DENIED)
1. Unauthenticated user trying to read any collection.
2. Authenticated non-admin user trying to read `results`.
3. Admin trying to create a `Result` with a missing `studentId`.
4. User trying to delete a `Grade` without being an admin.
5. User trying to update their own `role` to `admin` in the `admins` collection.
6. User trying to write a `Result` with a `semester1` score > 100.
7. User trying to create a `Student` with an ID that doesn't follow the `ST####` format.
8. User trying to update `createdAt` of a `Teacher`.
9. User trying to inject a 2MB string into `Student.name`.
10. User trying to list all `admins` without being an admin.
11. User trying to create a `Subject` with a 10KB `passkey`.
12. User trying to batch creation of 100 students in one request (if batching is used, though we'll focus on individual writes for simplicity in rules).

## Test Runner (firestore.rules.test.ts)
```typescript
// This is a conceptual test runner for the rules
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

// ... test setup ...
```
