# Task Manager API

A simple REST API for managing a to-do list, built with Node.js and Express.
Tasks are stored in memory (seeded from `task.json` on startup) and support
filtering, sorting, and priority levels.

## Overview

Each task has the following shape:

```json
{
  "id": 1,
  "title": "Set up environment",
  "description": "Install Node.js, npm, and git",
  "completed": true,
  "priority": "medium",
  "createdAt": "2026-06-10T12:00:00.000Z"
}
```

- `priority` must be one of `low`, `medium`, `high`. If omitted on create, it defaults to `medium`.
- `createdAt` is set automatically and is used for sorting.

## Setup Instructions

### Prerequisites

- Node.js >= 18

### Install dependencies

```bash
npm install
```

### Run the server

```bash
node app.js
```

The server starts on `http://localhost:3000`.

### Run the tests

```bash
npm test
```

## API Endpoints

### `GET /tasks`

Returns all tasks. Supports optional query parameters:

| Query param | Values         | Description                                  |
| ----------- | -------------- | --------------------------------------------- |
| `completed` | `true`/`false` | Filter tasks by completion status              |
| `sort`      | `asc`/`desc`   | Sort tasks by `createdAt`                      |

**Responses**

- `200 OK` – array of tasks
- `400 Bad Request` – invalid `completed` or `sort` value

```bash
curl http://localhost:3000/tasks
curl "http://localhost:3000/tasks?completed=true"
curl "http://localhost:3000/tasks?sort=desc"
```

### `GET /tasks/priority/:level`

Returns all tasks matching the given priority level (`low`, `medium`, or `high`).

**Responses**

- `200 OK` – array of tasks
- `400 Bad Request` – invalid priority level

```bash
curl http://localhost:3000/tasks/priority/high
```

### `GET /tasks/:id`

Returns a single task by its numeric `id`.

**Responses**

- `200 OK` – task object
- `404 Not Found` – no task with that id

```bash
curl http://localhost:3000/tasks/1
```

### `POST /tasks`

Creates a new task.

**Body**

| Field         | Type    | Required | Notes                                  |
| ------------- | ------- | -------- | --------------------------------------- |
| `title`       | string  | yes      | Non-empty                                |
| `description` | string  | yes      | Non-empty                                |
| `completed`   | boolean | yes      |                                           |
| `priority`    | string  | no       | One of `low`, `medium`, `high` (default `medium`) |

**Responses**

- `201 Created` – the created task, including `id` and `createdAt`
- `400 Bad Request` – missing/invalid fields

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","description":"New Task Description","completed":false,"priority":"high"}'
```

### `PUT /tasks/:id`

Updates an existing task. Same body rules as `POST`.

**Responses**

- `200 OK` – the updated task
- `400 Bad Request` – missing/invalid fields
- `404 Not Found` – no task with that id

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","description":"Updated Task Description","completed":true}'
```

### `DELETE /tasks/:id`

Deletes a task by its numeric `id`.

**Responses**

- `200 OK` – the deleted task
- `404 Not Found` – no task with that id

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

## Testing the API

### Automated tests

The test suite (`test/server.test.js`) uses `tap` and `supertest` to exercise
every endpoint, including success and error cases.

```bash
npm test
```

### Manual testing

With the server running (`node app.js`), use `curl`, [Postman](https://www.postman.com/),
or any HTTP client to call the endpoints documented above.
