# Bug Report

## 1. Pagination skips the first page

- **Location:** `task-api/src/services/taskService.js`, `getPaginated`.
- **Expected:** Page 1 with a limit of 2 should return the first two tasks.
- **Actual:** The offset was calculated as `page * limit`, so page 1 started at index 2. With three tasks, page 1 returned Task Three and page 2 returned an empty result.
- **How discovered:** I created three tasks and manually tested `GET /tasks?page=1&limit=2` and `GET /tasks?page=2&limit=2` against the original API. The behavior was then covered by the pagination tests.
- **Fix:** Use `(page - 1) * limit` for one-based API page numbers.

## 2. Status filtering can return unintended statuses

- **Location:** `task-api/src/services/taskService.js`, `getByStatus`.
- **Expected:** A status filter should match the requested status exactly.
- **Actual:** `includes()` performs a substring match, so requesting `status=progress` returned a task whose status was `in_progress`.
- **How discovered:** I created an `in_progress` task and manually tested `GET /tasks?status=progress` against the original API. The behavior was then covered by the status-filtering tests.
- **Fix:** Compare with `===` instead of `includes()`.

## 3. Completing a task unexpectedly changes its priority

- **Location:** `task-api/src/services/taskService.js`, `completeTask`.
- **Expected:** Completing a task should change its completion state while preserving unrelated task fields such as priority.
- **Actual:** The implementation always changed priority to `medium`. A high-priority task became medium priority after completion.
- **How discovered:** I created a high-priority task and manually tested `PATCH /tasks/:id/complete` against the original API. The behavior was then covered by the completion tests.
- **Fix:** Remove the unrelated priority mutation.

## Additional observation

The API currently prioritizes `status` when both `status` and pagination query parameters are supplied. Before shipping, I would clarify whether combined filtering and pagination are intended to be supported and, if so, implement them together.
