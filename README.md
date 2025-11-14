# 🧾 Kube Credential

A **microservice-based credential issuance & verification system** built with **Node.js**, **React**, **Docker**, and **Kubernetes**.

---

## Built with:

Node.js + TypeScript

React + Vite

Docker + Kubernetes

SQLite

## 🏗️ Architecture

- **issuance-svc** (Node.js + TypeScript + Express)  
  → `POST /issue` — issues credential JSON
- **verification-svc** (Node.js + TypeScript + Express)  
  → `POST /verify` — verifies issued credential
- **web** (React + TypeScript + Vite)  
  → Frontend with `/issue` and `/verify` pages
- **Kubernetes** handles deployments, services, ingress
- Each service returns the handling worker/pod via the environment variable **`HOSTNAME`**

---

## 🧠 Assumptions

- Credential identity is derived from a **SHA-256 hash** of the JSON payload (stable unique ID).
- **SQLite** used for persistence (simple, lightweight, and file-based).
- Frontend connects to backend services via **environment-configured URLs**.

---

## 💻 Local Development (Without Docker)

### 1️⃣ Issuance Service

```bash
cd services/issuance-svc
npm ci
npm run dev
2️⃣ Verification Service
bash
Copy code
cd services/verification-svc
npm ci
npm run dev
3️⃣ Frontend
bash
Copy code
cd web
npm i
npm run dev
Optional: Create a .env in web/ to configure APIs.

ini
Copy code
VITE_ISSUANCE_URL=http://localhost:3000
VITE_VERIFICATION_URL=http://localhost:3001
⚡ Run All Three Services Together
Use this one-liner in the project root to start everything in parallel:

bash
Copy code
( cd services/verification-svc && npm run dev ) & \
( cd services/issuance-svc && REPLICATE_URL=http://localhost:3001 npm run dev ) & \
( cd web && VITE_ISSUANCE_URL=http://localhost:3000 VITE_VERIFICATION_URL=http://localhost:3001 npm run dev ) ; wait
🐳 Docker (Local Build & Run)
🧱 Issuance Service
bash
Copy code
cd services/issuance-svc
npm ci && npm run build
docker build -t issuance-svc:1.0.0 .
docker run --rm -p 3000:3000 issuance-svc:1.0.0
🧩 Verification Service
bash
Copy code
cd ../verification-svc
npm ci && npm run build
docker build -t verification-svc:1.0.0 .
docker run --rm -p 3001:3001 verification-svc:1.0.0
☸️ Kubernetes Deployment
Apply manifests
bash
Copy code
kubectl apply -f k8s/namespace.yaml
kubectl -n kube-credential apply -f k8s/issuance-deployment.yaml -f k8s/issuance-service.yaml
kubectl -n kube-credential apply -f k8s/verification-deployment.yaml -f k8s/verification-service.yaml
# optional ingress
kubectl -n kube-credential apply -f k8s/ingress.yaml
Port-forward for local testing
bash
Copy code
kubectl -n kube-credential port-forward svc/issuance-svc 8080:80
kubectl -n kube-credential port-forward svc/verification-svc 8081:80
Then update frontend .env:

ini
Copy code
VITE_ISSUANCE_URL=http://localhost:8080
VITE_VERIFICATION_URL=http://localhost:8081
🔗 API Endpoints
Issuance Service (POST /issue)
Body: credential JSON
Responses:

json
Copy code
{ "status": "issued", "credentialId": "...", "workerId": "...", "issuedAt": "...", "message": "credential issued by worker-1" }

{ "status": "already_issued", "credentialId": "..." }
Verification Service (POST /verify)
Body: credential JSON
Responses:

json
Copy code
{ "isValid": true, "credentialId": "...", "issuedAt": "...", "workerId": "..." }

{ "isValid": false, "credentialId": "...", "workerId": "..." }
🧪 Testing
Backend: Jest (test placeholders included)

Frontend: Vitest (template ready)

Run manually:

bash
Copy code
cd services/issuance-svc && npm test
cd ../verification-svc && npm test
cd ../../web && npm run test
🚀 Deployment Steps
Build & push images to your Docker registry:

bash
Copy code
docker tag issuance-svc:1.0.0 yourname/issuance-svc:1.0.0
docker tag verification-svc:1.0.0 yourname/verification-svc:1.0.0
docker push yourname/issuance-svc:1.0.0
docker push yourname/verification-svc:1.0.0
Update images in k8s/*.yaml files.

(Optional) Configure Ingress + DNS for hosted deployment.

Frontend Hosting Options:

AWS S3 + CloudFront

Netlify

Vercel

GitHub Pages (with API proxy)
```

## 🧱 Architecture Diagram

                           ┌────────────────────────────┐
                           │        Frontend (Web)      │
                           │ React + Vite + Nginx (8090)│
                           │  - Issue / Verify UI        │
                           └─────────────┬──────────────┘
                                         │
                                         │  REST API calls
                                         ▼
           ┌──────────────────────────┐           ┌──────────────────────────┐
           │   Issuance Service       │           │   Verification Service    │
           │  Node.js + Express (3000)│           │  Node.js + Express (3001) │
           │  POST /issue             │           │  POST /verify             │
           │  Generates credentialId  │           │  Validates credentialId   │
           │  Stores in SQLite DB     │           │  Checks its own DB        │
           └─────────────┬────────────┘           └─────────────┬────────────┘
                         │                                      │
                         │  replication (POST /replicate)       │
                         └──────────────────────────────────────┘

                       ┌───────────────────────────────────────────┐
                       │      SQLite Databases (per service)       │
                       │  Local persistence via mounted volumes    │
                       │  or PVCs inside Kubernetes pods           │
                       └───────────────────────────────────────────┘
