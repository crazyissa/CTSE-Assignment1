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

## API Endpoints & Contract (OpenAPI)

### Auth Service (5001)
- `POST /api/auth/register` - Register new user (customer/restaurant/delivery/admin)
- `POST /api/auth/login` - Login for any user role
- `GET /api/auth/users` - Get all users (admin only)
- `DELETE /api/auth/users/:id` - Delete user (admin only)
- `GET /api/auth/drivers` - Get all delivery drivers (admin/customer)

### Restaurant Service (5000)
- `GET /api/restaurants` - Get all restaurants (authenticated)
- `GET /api/restaurants/:restaurantId/menu` - Get menu items for a restaurant
- `POST /api/restaurants` - Create new restaurant (restaurant role, with image upload)
- `PUT /api/restaurants/:restaurantId` - Update restaurant (restaurant role, with image)
- `DELETE /api/restaurants/:restaurantId` - Delete restaurant (restaurant role)
- `POST /api/restaurants/:restaurantId/menu` - Add menu item (restaurant role, with image)
- `PUT /api/restaurants/:restaurantId/menu/:itemId` - Update menu item (restaurant role, with image)
- `DELETE /api/restaurants/:restaurantId/menu/:itemId` - Delete menu item (restaurant role)
- `PUT /api/restaurants/:restaurantId/availability` - Set restaurant availability (restaurant role)
- `GET /api/restaurants/my` - Get my restaurants (restaurant role)
- `GET /api/restaurants/search?query=...` - Search restaurants (authenticated)
- `GET /api/restaurants/:restaurantId/orders` - Get orders for restaurant (restaurant role)
- `PUT /api/restaurants/orders/:orderId/status` - Update order status (restaurant role)
- `PUT /api/restaurants/verify/:id` - Verify restaurant (admin only)
- `GET /api/restaurants/admin/all` - Get all restaurants (admin only)

### Order Service (5005)
- `POST /api/orders` - Place a new order (authenticated)
- `GET /api/orders/my-orders` - Get user's orders (authenticated)
- `GET /api/orders/:orderId` - Get order details by ID (authenticated)
- `PUT /api/orders/:orderId/status` - Update order status (authenticated)
- `PUT /api/orders/:orderId/edit` - Edit order (authenticated)
- `GET /api/orders/:orderId/track` - Get order tracking info (authenticated)
- `PUT /api/orders/:orderId/location` - Update order location (authenticated)
- `GET /api/orders/restaurant/:restaurantId` - Get orders by restaurant (authenticated)
- `DELETE /api/orders/:orderId` - Delete order (authenticated)

### Payment Service (5004)
- `POST /api/payments/test-checkout` - Test checkout endpoint
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/admin/transactions` - Get all transactions (admin)
- `GET /api/payments/admin/transactions/filter` - Get filtered transactions (admin)

### Delivery Service (5006)
- `POST /api/deliveries/checkout` - Create delivery for order (customer role)
- `PUT /api/deliveries/:id/status` - Update delivery status (delivery role)
- `GET /api/deliveries/assigned` - Get assigned delivery for driver (delivery role)
- `GET /api/deliveries/my` - Get all deliveries for driver (delivery role)
- `GET /api/deliveries/:id` - Get delivery by ID (admin/customer/delivery role)

### Admin Service (5050)
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/verify/:userId` - Verify user/restaurant (admin only)
- `DELETE /api/admin/user/:userId` - Delete user (admin only)
- `PUT /api/admin/verify-restaurant/:id` - Verify restaurant (admin only)
- `GET /api/admin/restaurants` - Get all restaurants (admin only)
- `GET /api/admin/payments/transactions` - Get all payment transactions (admin only)
- `GET /api/admin/payments/transactions/filter` - Get filtered transactions (admin only)

## Frontend API config

See [tailwind-react-frontend/src/services/api.js](tailwind-react-frontend/src/services/api.js):
- Restaurant: `http://localhost:5000/api`
- Auth: `http://localhost:5001/api/auth`
- Order: `http://localhost:5005/api/orders`
- Delivery: `http://localhost:5006/api`
- Admin: `http://localhost:5050/api/admin`

## Docker & Container Configuration

### Dockerfile Structure

Each backend service includes a `DockerFile` using Node.js Alpine Linux for minimal image size:

**Example (auth_service/DockerFile):**
```dockerfile
FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["npm","start","dev"]
```

**Key Features:**
- Alpine Linux base for lightweight images (~150MB vs ~900MB with full Node.js)
- Multi-line package installation for dependency management
- Port exposure matching service defaults
- Development-focused startup (npm start dev)

### Docker Compose Configuration

**File:** `backend/docker-compose.yml`

**Services Defined:**
- `restaurant-service` (Port 5000)
- `order-service` (Port 5005)
- `payment-service` (Port 5004)
- `delivery-service` (Port 5006)
- `auth-service` (Port 5001)
- `admin-service` (Port 5050)

**Features:**
- Automatic builds from individual service Dockerfiles
- Environment variable injection (PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN)
- Volume mounting for restaurant uploads (`./restaurant_service/public/uploads:/app/public/uploads`)
- Container naming convention: `ds-assignment-<service-name>`

**Environment Configuration Example (from compose):**
```yaml
environment:
  - PORT=5000
  - MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
  - JWT_SECRET=yourSuperSecretKey
  - JWT_EXPIRES_IN=1h
```

**Note:** MongoDB Atlas connection URIs are used; replace with your own credentials before production deployment.

## Kubernetes Deployment Configuration

Each service includes a Kubernetes deployment manifest (`*-deployment.yaml`):

### Deployment Structure Example (auth-deployment.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-deployment
  labels:
    app: auth
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
        - name: auth
          image: vikz642/auth_repo:v7
          ports:
            - containerPort: 5001
          env:
            - name: PORT
              value: "5001"
            - name: MONGO_URI
              value: mongodb+srv://sm:mihi@cluster0.aslaq.mongodb.net/Finace_Tracker
            - name: JWT_SECRET
              value: yourSuperSecretKey
            - name: JWT_EXPIRES_IN
              value: 1h
```

### Deployment Files

| Service | Deployment File | Image | Port |
|---------|-----------------|-------|------|
| Auth | `auth-deployment.yaml` | `vikz642/auth_repo:v7` | 5001 |
| Order | `order-deployment.yaml` | `vikz642/ds_assignment:v2` | 5005 |
| Restaurant | `restaurant-deployment.yaml` | - | 5000 |
| Payment | `payment-deployment.yaml` | - | 5004 |
| Delivery | `delivery-deployment.yaml` | - | 5006 |
| Admin | `admin-deployment.yaml` | - | 5050 |

**Deployment Process:**
1. Each YAML file defines a single-replica deployment
2. Services use pre-built Docker images from Docker Hub
3. Environment variables are defined inline for configuration
4. Container ports are exposed for service communication

**To Deploy to Kubernetes:**
```bash
# Apply all deployments
kubectl apply -f backend/auth_service/auth-deployment.yaml
kubectl apply -f backend/order_service/order-deployment.yaml
kubectl apply -f backend/restaurant_service/restaurant-deployment.yaml
kubectl apply -f backend/payment_service/payment-deployment.yaml
kubectl apply -f backend/delivery_service/delivery-deployment.yaml
kubectl apply -f backend/admin_service/admin-deployment.yaml

# Verify deployments
kubectl get deployments
kubectl get pods
```

## CI/CD Pipeline Configuration

### Current Setup
This project uses **Docker & Docker Compose** for containerization and can be integrated with CI/CD platforms. No dedicated CI/CD workflow files (GitHub Actions, GitLab CI, etc.) are currently present.

### Recommended CI/CD Pipeline

#### Option 1: GitHub Actions
Create `.github/workflows/docker-build.yml`:
```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth_service, restaurant_service, order_service, payment_service, delivery_service, admin_service]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          cd backend/${{ matrix.service }}
          docker build -t myregistry/${{ matrix.service }}:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          docker push myregistry/${{ matrix.service }}:${{ github.sha }}
      
      - name: Run tests (optional)
        run: |
          cd backend/${{ matrix.service }}
          npm test
```

#### Option 2: Docker Compose for Local Testing
```bash
# Test all services locally with Docker Compose
cd backend
docker-compose build
docker-compose up --abort-on-container-exit
```

### Container Registry Configuration

**For Kubernetes Deployments:**
- Update image references in `*-deployment.yaml` files
- Example: `image: myregistry/auth_repo:latest`
- Current images use: `vikz642/auth_repo:v7`, `vikz642/ds_assignment:v2`

**Registry Options:**
- Docker Hub: `dockerhub_username/image_name:tag`
- Azure Container Registry: `myregistry.azurecr.io/image_name:tag`
- GitHub Container Registry: `ghcr.io/username/image_name:tag`

### Build & Deploy Workflow

**Local Testing:**
```bash
# Build all containers
docker-compose -f backend/docker-compose.yml build

# Run all services
docker-compose -f backend/docker-compose.yml up -d

# View logs
docker-compose -f backend/docker-compose.yml logs -f
```

**Kubernetes Deployment:**
```bash
# Build and push images (per service)
cd backend/auth_service
docker build -t your-registry/auth_repo:v1 .
docker push your-registry/auth_repo:v1

# Update deployment YAML with new image
kubectl set image deployment/auth-deployment auth=your-registry/auth_repo:v1

# Apply updated deployments
kubectl apply -f *-deployment.yaml
```

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

