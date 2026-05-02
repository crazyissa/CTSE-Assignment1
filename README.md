# CTSE-Assignment1

## Contributors
- IT22262790 - Munasinghe MVB
- IT22195302 - Jayaratne PGIM
- IT22370846 - Gunawardane SD
- IT22367808 - Abeyratne SMMRK

## Overview

CTSE-Assignment1 is a microservices-based food delivery ecosystem built as a university assignment. It splits backend responsibilities into dedicated services for restaurants, orders, payments, delivery, authentication, and admin operations, with a Tailwind + React frontend.

Goals:
- Demonstrate microservices architecture in Node.js and Express
- Implement client authentication (JWT)
- Handle real-time delivery status updates (Socket.io)
- Support restaurant management, checkout, payments, order tracking, and admin controls

## Architecture

Service breakdown (backend):

| Service | Purpose | Default Port |
|---|---|---|
| `auth_service` | Authentication, registration, login, JWT | 5001 |
| `restaurant_service` | Restaurant catalogue, menu & search | 5000 |
| `order_service` | Create/manage orders, status updates | 5005 |
| `payment_service` | Stripe payment flow, transaction logging | 5004 |
| `delivery_service` | Delivery tracking, route updates, websocket | 5006 |
| `admin_service` | Admin control panel: verification + reports | 5050 |
| `tailwind-react-frontend` | React UI for customers, drivers, restaurants | 5173 |

## Tech stack

- Node.js, Express, MongoDB (Atlas), Mongoose
- JWT auth, bcrypt password hashing
- Socket.io for delivery updates
- React, Tailwind CSS, Vite
- Docker + docker-compose (optional), Kubernetes YAML assets (optional)

## Ports (default)

- Restaurant service: `5000`
- Auth service: `5001`
- Payment service: `5004`
- Order service: `5005`
- Delivery service: `5006`
- Admin service: `5050`
- Frontend: `5173` (Vite default)

## Prerequisites

- Node >= 18
- npm >= 8
- Docker + Docker Compose (if you want containerized local launch)
- Internet access for MongoDB Atlas or local MongoDB URI

## Environment variables

Each backend service accepts the following (via `.env` or compose env):

- `PORT` (number)
- `MONGO_URI` (Mongo Atlas/URL)
- `JWT_SECRET` (string)
- `JWT_EXPIRES_IN` (ex: `1h`)

Example (`auth_service/.env`):

```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pass>@cluster1/.../your-db
JWT_SECRET=yourSuperSecretKey
JWT_EXPIRES_IN=1h
```

## Install and run backend services (local)

From repo root:

1. `cd backend/auth_service && npm install`
2. `cd ../restaurant_service && npm install`
3. `cd ../order_service && npm install`
4. `cd ../payment_service && npm install`
5. `cd ../delivery_service && npm install`
6. `cd ../admin_service && npm install`

Run each service

- `npm run dev` or `npm start` in each service folder.

Example:

```bash
cd backend/restaurant_service
npm run dev
```

## Start all with Docker Compose

```bash
cd backend
docker compose up --build
```

This uses the `backend/docker-compose.yml` configuration and binds ports:
- 5000 restaurant
- 5001 auth
- 5004 payment
- 5005 order
- 5006 delivery
- 5050 admin

## Install and run frontend

```bash
cd tailwind-react-frontend
npm install
npm run dev
```

Open http://localhost:5173

## API endpoints (high-level)

`auth_service`:
- `POST /api/auth/register`
- `POST /api/auth/login`

`restaurant_service`:
- `GET /api/restaurants`
- `POST /api/restaurants` (restaurant + menu CRUD)
- `GET /api/restaurants/search?query=...`

`order_service`:
- `POST /api/orders`
- `GET /api/orders/my-orders`
- `PUT /api/orders/:id/status`
- `DELETE /api/orders/:id`

`payment_service`:
- `POST /api/payments/charge` (Stripe-style)

`delivery_service`:
- `POST /api/deliveries/checkout`
- `GET /api/deliveries/:deliveryId`

`admin_service`:
- `GET /api/admin/restaurants`
- `PUT /api/admin/verify-restaurant/:id`
- `GET /api/admin/payments/transactions`

## Frontend API config

See `tailwind-react-frontend/src/services/api.js`:
- Restaurant: `https://restaurant-service-new.onrender.com/api`
- Auth: `http://localhost:5001/api/auth`
- Order: `http://localhost:5005/api/orders`
- Delivery: `https://delivery-service-new.onrender.com/api`
- Admin: `http://localhost:5050/api/admin`

## Real-time updates

- `delivery_service` uses Socket.io server; frontend subscribes to updates via `socket.io-client`.

## Testing and developer flow

- Ensure MongoDB Atlas URI is correct and open.
- Start auth first, then restaurant and others, then frontend.
- Use Postman or browser for APIs and React UI for full flows.

## Notes

- The provided MongoDB connection in `docker-compose.yml` is Atlas; adjust to your own credentials before production.
- Consider `npm audit` and lockfile consistency across services.

## Helpful commands summary

- Backends: `npm run dev` (both in all backend folders)
- Frontend: `npm run dev`
- Docker Compose: `docker compose up --build`

## Contribution

1. Fork repo
2. Create branch `feature/<name>`
3. Add tests in each service (currently none provided)
4. Submit PR

