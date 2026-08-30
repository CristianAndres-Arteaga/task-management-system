# Task Management System (TMS)

[![Backend CI](https://github.com/CristianAndres-Arteaga/task-management-system/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/CristianAndres-Arteaga/task-management-system/actions/workflows/backend-ci.yml)
[![Backend Deploy](https://github.com/CristianAndres-Arteaga/task-management-system/actions/workflows/backend-deploy.yml/badge.svg)](https://github.com/CristianAndres-Arteaga/task-management-system/actions/workflows/backend-deploy.yml)
[![Frontend CI](https://github.com/CristianAndres-Arteaga/task-management-system/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/CristianAndres-Arteaga/task-management-system/actions/workflows/frontend-ci.yml)
[![Frontend Deploy](https://github.com/CristianAndres-Arteaga/task-management-system/actions/workflows/frontend-deploy.yml/badge.svg)](https://github.com/CristianAndres-Arteaga/task-management-system/actions/workflows/frontend-deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack, serverless task management app built on AWS to practice production-grade cloud engineering patterns: least-privilege IAM, OIDC-based CI/CD, single-table DynamoDB design, and end-to-end observability — all kept within AWS's free tier.

**Live demo:** https://d1n5bx4uzfv4qq.cloudfront.net
**Repo:** https://github.com/CristianAndres-Arteaga/task-management-system

_[Versión en español](README.es.md)_

---

## Architecture

![Architecture Diagram](docs/architecture-diagram.svg)

Three independent flows share the same backend: registration (Cognito → PostConfirmation Lambda → DynamoDB), login (Cognito, token issuance only), and authenticated CRUD (HTTP API → Cognito JWT Authorizer → one Lambda per operation → DynamoDB). A separate observability path streams Lambda logs to CloudWatch and routes alarm breaches through SNS to email.

## Tech Stack

**Backend**
- AWS SAM (Infrastructure as Code)
- AWS Lambda — Node.js/TypeScript, one function per CRUD operation, x86_64
- Amazon API Gateway — HTTP API with a Cognito JWT Authorizer
- Amazon DynamoDB — single-table design, on-demand capacity
- Amazon Cognito — User Pools, SRP authentication
- Amazon CloudWatch — Logs, Alarms, Dashboard
- Amazon SNS — email alerting
- GitHub Actions — CI/CD via OIDC federation (no stored AWS credentials)

**Frontend**
- React 18 + TypeScript, Vite
- Tailwind CSS v4
- Axios
- @dnd-kit/core — Kanban drag & drop
- Amazon S3 (private) + Amazon CloudFront (OAC) — static hosting

## Features

- Email/password authentication with Cognito (register, confirm, login, logout)
- Kanban board — three columns (Pendiente / En progreso / Completada) matching TaskStatus, drag-and-drop between columns
- Inline task creation (Trello-style, directly in the Pendiente column)
- Inline edit/delete with a custom confirmation dialog
- Strict per-user data isolation — every backend operation scopes to the caller's Cognito sub claim, never a client-supplied ID

| Login | Kanban Board |
|---|---|
| ![Login](docs/screenshots/login.png) | ![Kanban Board](docs/screenshots/kanban-board.png) |

## Getting Started

### Prerequisites

- Node.js 20+
- AWS CLI configured with credentials
- AWS SAM CLI
- An AWS account

### Backend

```bash
cd backend/tms-backend
sam build
sam deploy --guided
```

`sam deploy --guided` will prompt for the `AlertEmail` parameter (see Environment Variables) and save your choices to `samconfig.toml`.

### Frontend

```bash
cd tms-frontend
npm install
```

Create a `.env` file (see Environment Variables below), then:

```bash
npm run dev
```

## Environment Variables

**Frontend (`tms-frontend/.env`)**

- `VITE_API_URL` — HTTP API Gateway invoke URL, including the `/prod` stage
- `VITE_COGNITO_USER_POOL_ID` — Cognito User Pool ID
- `VITE_COGNITO_USER_POOL_CLIENT_ID` — Cognito App Client ID

These are non-secret identifiers — they end up in the browser bundle regardless, so they're safe to hardcode in CI as well.

**Backend (SAM parameter)**

- `AlertEmail` — email address that receives CloudWatch alarm notifications via SNS

## CI/CD

Four GitHub Actions workflows, all under `.github/workflows/`:

- **backend-ci.yml** — on PRs touching `backend/tms-backend/**`: runs each Lambda's unit tests (DynamoDB mocked via `aws-sdk-client-mock`, no AWS credentials needed), then `sam validate --lint && sam build`.
- **backend-deploy.yml** — on push to `main` (+ manual trigger): assumes an IAM role via OIDC and runs `sam build && sam deploy`.
- **frontend-ci.yml** — on PRs touching `tms-frontend/**`: `npm ci && npm run lint && npm run build`.
- **frontend-deploy.yml** — on push to `main` (+ manual trigger): builds the SPA, syncs it to S3, and invalidates the CloudFront cache.

Authentication uses OIDC federation, not long-lived access keys. GitHub Actions exchanges a short-lived OIDC token for temporary AWS credentials via `AssumeRoleWithWebIdentity`, scoped to this repository's `main` branch — there are no AWS secrets stored in GitHub at all.

## Architecture Decisions

- **HTTP API over REST API** — Cheaper, and has a native Cognito JWT Authorizer, so no custom Lambda authorizer is needed.
- **Single-table DynamoDB, no GSI** — `PK=USER#<sub>`, `SK=PROFILE|TASK#<id>` covers every access pattern by partition key alone at this scale; a GSI would be premature.
- **One Lambda per operation** — Smaller blast radius per function, least-privilege IAM scoped individually, independent scaling and monitoring. No Lambda-lith.
- **OIDC federation for CI/CD** — Removes long-lived AWS credentials from GitHub entirely, rather than just scoping them down.
- **Least-privilege IAM boundary** — A scoped deploy policy handles routine changes; anything outside that scope (including editing the deploy policy itself) requires assuming a separate, deliberately-harder-to-reach admin role.
- **CloudFront + private S3 (OAC)** — The bucket is never public; all traffic is forced through CloudFront's HTTPS edge.
- **No MFA on Cognito** — Accepted trade-off at portfolio scale, documented rather than an oversight.
- **No custom domain / no WAF** — Cost-avoidance: both carry a small recurring cost outside the always-free tier.

## Costs

The entire stack runs within AWS's free tier (Lambda, DynamoDB on-demand, CloudFront, CloudWatch alarms, SNS, and S3 at this traffic level all fall under the 12-month or Always Free tiers) — $0/month to run and demo. At production scale, the main cost driver would shift to Cognito's per-MAU billing above 50,000 monthly active users, which scales with actual usage rather than being idle/wasted cost.

## Known Limitations / Roadmap

- No custom domain (serves from the default CloudFront domain)
- No WAF in front of CloudFront
- No MFA on Cognito
- Single AWS region, no multi-region/DR
- No automated frontend tests (backend Lambdas have unit test coverage; frontend does not yet)
- Single fixed API stage (prod) — no separate staging environment

## License

MIT — see [LICENSE](LICENSE).
