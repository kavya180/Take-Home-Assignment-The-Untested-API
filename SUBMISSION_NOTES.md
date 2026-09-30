# Submission Notes

## What I would test next
- More combinations of status filtering, pagination, and invalid query parameters.
- Boundary cases around due dates and completion timestamps.
- Validation of date formats more strictly than JavaScript's permissive `Date.parse` behavior.
- Repeated updates and interactions between assignment, completion, deletion, and update operations.

## What surprised me
- Pagination used a zero-based offset calculation even though the public API examples use page numbers starting at 1.
- Status filtering used substring matching instead of exact status matching.
- Completing a task changed its priority to `medium`, which is unrelated to completion state.

## Questions I would ask before shipping
- Should `status` filtering and pagination be composable when both query parameters are provided?
- Should a task be allowed to be reassigned, or is assignment intentionally immutable?
- Should the API reject dates that are parseable by JavaScript but are not strict ISO 8601 values?
- Should `PUT` be a true full replacement or continue behaving as a partial update?

## Test and Coverage Results

- Test suites: 3 passed
- Tests: 28 passed
- Statement coverage: 96.85%
- Branch coverage: 94.38%
- Function coverage: 93.33%
- Line coverage: 96.52%
