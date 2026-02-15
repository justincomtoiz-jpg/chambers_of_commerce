# Chamber of Commerce Dashboard (FiveM NUI)

## Overview

React + Vite frontend, Node + TypeScript + Express backend, TypeORM with MariaDB. Designed to be used as a FiveM NUI.

## Prerequisites

- Node 18+ and npm
- Docker (for MariaDB) or a MariaDB instance on the VM
- FiveM server to host the NUI resource

## Quick start (local dev)

1. Start MariaDB (Docker)

2. Backend

- The server will run on port 3001 by default.
- It will run the seed script to populate streets.

3. Frontend

- For production build:
  ```
  npm run build
  ```
  Copy `frontend/dist` into `fivem-resource/html/` for the FiveM resource.

4. FiveM resource

- Place `fivem-resource` folder into your server resources.
- Ensure `fxmanifest.lua` is present and `html` contains the built frontend.
- Start resource in server.cfg:
  ```
  ensure coc-dashboard
  ```

## Notes

- The backend uses header-based demo auth. Replace `authMiddleware` with your real auth integration.
- All actions create `Log` entries. Extend controllers for Formal Review, Board, Commissioner, Inspections, Businesses, Events, PD Requests, Delinquency, and Logs pages.
- Use TypeORM migrations to manage schema changes. A sample migration is included.

## Next steps

- I can generate the full file tree as downloadable archive, or push this scaffold into a Git repo for you.
- I can implement the remaining routes, frontend pages, and full role-based UI for all tabs on request.
