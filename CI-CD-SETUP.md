# CI/CD Pipeline Setup Guide

## 📋 Overview

This document describes the CI/CD pipeline architecture for the CTSE Food Delivery Microservices Platform. The pipeline implements **Continuous Integration** (testing, linting, building) and **Continuous Deployment** (automated releases to staging and production).

---

## 🏗️ Pipeline Architecture

### Services & Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Branch: main (Production)                   │   │
│  │  Push → CI Tests → Build → Deploy to Render (Prod) │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │      Branch: develop (Staging)                      │   │
│  │ Push → CI Tests → Build → Deploy to Render (Stage) │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Frontend (React)                            │   │
│  │  Push → Build → Deploy to Vercel                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Backend Services CI/CD Pipeline

### File Structure
```
.github/
├── workflows/
│   ├── frontend-ci.yml                    # Frontend pipeline
│   └── integration-tests.yml              # Integration tests
│
backend/
├── auth_service/.github/workflows/ci-cd.yml
├── restaurant_service/.github/workflows/ci-cd.yml
├── order_service/.github/workflows/ci-cd.yml
├── payment_service/.github/workflows/ci-cd.yml
├── delivery_service/.github/workflows/ci-cd.yml
├── admin_service/.github/workflows/ci-cd.yml
└── docker-compose.yml
```

### Pipeline Stages (Per Service)

#### **Stage 1: CI (Continuous Integration)**
```yaml
Jobs:
  ✓ Checkout code
  ✓ Install dependencies (npm install)
  ✓ Lint check (ESLint)
  ✓ Syntax validation (node -c)
  ✓ Security scan (e.g., payment service checks for secrets)
```

**Triggers:**
- Push to `main` or `develop` branch
- Pull requests to `main` or `develop`
- Only on file changes in the service directory

**Fails if:**
- Dependencies cannot be installed
- Syntax errors exist
- Lint warnings (configurable)
- Secrets are hardcoded in code

---

#### **Stage 2: Build (Docker)**
```yaml
Jobs:
  ✓ Build Docker image
  ✓ Verify image runs
  ✓ Push to registry (optional)
```

**Depends on:** Stage 1 (CI) ✅

---

#### **Stage 3: Deploy to Staging (Develop Branch)**
```yaml
Jobs:
  ✓ Trigger Render webhook for staging deployment
  ✓ Health check verification
```

**Conditions:**
- Only runs on `develop` branch
- Only on **push** (not pull requests)
- Requires Stage 2 (Build) ✅

**Environment:**
- Render staging URL: Defined in `RENDER_*_SERVICE_STAGING_WEBHOOK`

---

#### **Stage 4: Deploy to Production (Main Branch)**
```yaml
Jobs:
  ✓ Trigger Render webhook for production deployment
  ✓ Health check verification
  ✓ Smoke tests
```

**Conditions:**
- Only runs on `main` branch
- Only on **push**
- Requires Stage 2 (Build) ✅

**Environment:**
- Render production URL: Defined in `RENDER_*_SERVICE_PROD_WEBHOOK`

---

## 🌐 Frontend CI/CD Pipeline

### File: `.github/workflows/frontend-ci.yml`

**Stages:**
1. **CI:** Install → Lint → Test → Build
2. **Staging Deploy:** Push to Vercel staging environment
3. **Production Deploy:** Push to Vercel production environment

**Key Features:**
- Environment variables injected from GitHub Secrets
- Vercel CLI integration
- Auto-deploy on merge to `main` or `develop`

---

## 🧪 Integration Tests

### File: `.github/workflows/integration-tests.yml`

**Purpose:** Verify all microservices work together

**Steps:**
1. Spin up MongoDB
2. Start all services via Docker Compose
3. Test each service health endpoint
4. Run smoke tests (e.g., registration)
5. Cleanup

**Triggers:**
- Manual trigger (workflow_dispatch)
- Scheduled daily at 2 AM UTC
- On pull requests to `main`

---

## 🔐 GitHub Secrets Configuration

### Required Secrets Setup

**Go to:** Repository → Settings → Secrets and Variables → Actions

### Backend Secrets

```plaintext
# Auth Service
RENDER_AUTH_SERVICE_STAGING_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_AUTH_SERVICE_PROD_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_AUTH_SERVICE_URL=https://auth-service-staging.onrender.com

# Restaurant Service
RENDER_RESTAURANT_SERVICE_STAGING_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_RESTAURANT_SERVICE_PROD_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_RESTAURANT_SERVICE_URL=https://restaurant-service-staging.onrender.com

# Order Service
RENDER_ORDER_SERVICE_STAGING_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_ORDER_SERVICE_PROD_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_ORDER_SERVICE_URL=https://order-service-staging.onrender.com

# Payment Service
RENDER_PAYMENT_SERVICE_STAGING_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_PAYMENT_SERVICE_PROD_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_PAYMENT_SERVICE_URL=https://payment-service-staging.onrender.com

# Delivery Service
RENDER_DELIVERY_SERVICE_STAGING_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_DELIVERY_SERVICE_PROD_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_DELIVERY_SERVICE_URL=https://delivery-service-staging.onrender.com

# Admin Service
RENDER_ADMIN_SERVICE_STAGING_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_ADMIN_SERVICE_PROD_WEBHOOK=https://api.render.com/deploy/[webhook-id]
RENDER_ADMIN_SERVICE_URL=https://admin-service-staging.onrender.com
```

### Frontend Secrets

```plaintext
# Vercel
VERCEL_TOKEN=YOUR_VERCEL_TOKEN
VERCEL_ORG_ID=YOUR_ORG_ID
VERCEL_PROJECT_ID=YOUR_PROJECT_ID

# Environment Variables for Builds
VITE_API_BASE_URL=http://localhost:5080/api
VITE_AUTH_API_BASE_URL=http://localhost:5065/api
VITE_ORDER_API_BASE_URL=http://localhost:5005/api
VITE_PAYMENT_API_BASE_URL=http://localhost:5075/api
VITE_DELIVERY_API_BASE_URL=http://localhost:5070/api
VITE_ADMIN_API_BASE_URL=http://localhost:5060/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# URLs
FRONTEND_PROD_URL=https://your-frontend.vercel.app
```

---

## 📊 Pipeline Triggers

### Per-Service Pipelines

| Trigger | Main Branch | Develop Branch | Notes |
|---------|------------|----------------|-------|
| **Push** | ✅ CI → Build → Prod Deploy | ✅ CI → Build → Stage Deploy | Specific service files only |
| **Pull Request** | ✅ CI → Build | ✅ CI → Build | No auto-deploy |
| **Manual** | ❌ | ❌ | Use `workflow_dispatch` |

### Frontend Pipeline

| Trigger | Main Branch | Develop Branch |
|---------|------------|----------------|
| **Push** | ✅ Build → Prod Deploy | ✅ Build → Stage Deploy |
| **Pull Request** | ✅ Build test only | ✅ Build test only |

### Integration Tests

| Trigger | Frequency |
|---------|-----------|
| **Manual** | Any time (workflow_dispatch) |
| **Scheduled** | Daily at 2 AM UTC |
| **Pull Request** | On `main` branch PRs |

---

## 🚀 Deployment Flow Example

### Scenario: Deploy Order Service to Production

1. **Developer:** Push to `main` branch
   ```bash
   git push origin main
   ```

2. **GitHub Actions:** Triggered
   - **Step 1 - CI:** ✅ Tests pass
   - **Step 2 - Build:** ✅ Docker image builds successfully
   - **Step 3 - Deploy to Production:** ✅ Webhook sent to Render
   - **Step 4 - Health Check:** ✅ Service responds to `/health`

3. **Render:** Auto-deploys service
   - Pull latest code
   - Install dependencies
   - Build & run service

4. **Result:** ✅ Order Service running on production URL

---

## ⚠️ Common Issues & Solutions

### Issue: Deployment Fails with "No such secret key"

**Cause:** GitHub Secret not configured
**Solution:** 
```bash
# Add to GitHub Secrets
RENDER_ORDER_SERVICE_PROD_WEBHOOK=https://api.render.com/deploy/xxx
```

### Issue: Health Check Fails After Deploy

**Cause:** Service takes time to start
**Solution:** Pipeline includes 10-second delay before health check

```yaml
- name: Health Check
  run: |
    sleep 10
    curl -f ${{ secrets.RENDER_SERVICE_URL }}/health
```

### Issue: "Path not found" in workflow

**Cause:** Workflow path configuration incorrect
**Solution:** Ensure service paths match:
```yaml
paths:
  - 'backend/order_service/**'  # ✅ Correct
  - 'backend/orderservice/**'   # ❌ Wrong path
```

### Issue: Lint Fails, Blocking Deployment

**Solution:** CI/CD includes `|| true` to allow pipeline to continue:
```yaml
- name: Run Lint
  run: npm run lint || echo "No lint script defined"
```

---

## 📈 Monitoring & Logs

### View Workflow Status

1. Go to GitHub repository
2. Click **Actions** tab
3. Select workflow (e.g., "Order Service CI/CD")
4. Click recent run to view logs

### Debug Failed Steps

```bash
# Re-run failed job
# Click "Re-run jobs" button on GitHub Actions page
```

### Check Deployment Status

```bash
# Test service endpoint
curl https://order-service-prod.onrender.com/health

# View Render logs
# Go to Render Dashboard → Service → Logs
```

---

## 🔄 Best Practices

### 1. Branch Strategy

- **`main`:** Production-ready code
  - Protected branch
  - Requires PR review
  - Auto-deploys to production
  
- **`develop`:** Staging/integration
  - Feature branches merge here
  - Auto-deploys to staging
  - Integration tests run

### 2. Commit Messages

```bash
# Good
git commit -m "feat(order-service): add order filtering"
git commit -m "fix(payment): handle Stripe webhook errors"
git commit -m "refactor(auth): simplify JWT middleware"

# Bad
git commit -m "fix stuff"
git commit -m "updates"
```

### 3. Pull Request Process

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit
3. Push branch: `git push origin feature/new-feature`
4. Create Pull Request on GitHub
5. Wait for CI tests to pass ✅
6. Request review from team
7. Merge to `develop` (staging auto-deploy)
8. After testing, merge `develop` → `main` (prod auto-deploy)

### 4. Secret Management

✅ **DO:**
- Store secrets in GitHub Secrets
- Rotate secrets regularly
- Use environment-specific secrets

❌ **DON'T:**
- Commit `.env` files
- Push secret keys to Git
- Share webhook URLs publicly

---

## 📚 Advanced Configuration

### Add Code Coverage Check

```yaml
- name: Generate Coverage
  run: npm run coverage

- name: Check Coverage Threshold
  run: |
    COVERAGE=$(cat coverage/coverage.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "❌ Coverage too low: $COVERAGE%"
      exit 1
    fi
```

### Add Security Scanning

```yaml
- name: Scan for Vulnerabilities
  run: npm audit --audit-level=moderate

- name: OWASP Dependency Check
  uses: dependency-check/Dependency-Check_Action@main
```

### Add Performance Benchmarking

```yaml
- name: Performance Test
  run: npm run benchmark
  
- name: Compare Results
  run: |
    if [ $(cat benchmark.json | jq '.avg') > 500 ]; then
      echo "⚠️ Performance regression detected"
      exit 1
    fi
```

---

## 🎯 Quick Start Checklist

- [ ] Create `.github/workflows` directories in each service
- [ ] Copy CI/CD YAML files to each service
- [ ] Configure GitHub Secrets with Render webhooks
- [ ] Configure GitHub Secrets with Vercel tokens
- [ ] Test on `develop` branch first
- [ ] Monitor Actions tab for workflow runs
- [ ] Set up branch protection rules for `main`
- [ ] Document any custom deployment steps

---

## 📞 Support & Documentation

For more information:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
