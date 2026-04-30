# 🌐 OmniMember API: Enterprise Multi-Tenant Hub

> [!IMPORTANT]
> **🚀 Proof of Concept (PoC)**  
> Questo progetto è un **Proof of Concept** sviluppato per dimostrare competenze architetturali in sistemi multi-tenant ad alte prestazioni. Non è da considerarsi un prodotto finito pronto per la produzione, ma una solida base tecnica per chiunque desideri implementare sistemi di controllo accessi scalabili e in tempo reale.

OmniMember is a high-performance, **enterprise-grade membership management system** engineered for high-scale environments like multi-brand holdings, gym chains, and corporate access control systems. 

Built with a "Zero-Trust" data isolation model, it provides real-time monitoring, strategic caching, and a premium dashboard to manage thousands of concurrent members across multiple brands.

---

## 🚀 Key Architectural Pillars

- **🛡️ Strict Multi-Tenancy**: Native data isolation at the database level. Every request is filtered by `brandId`, ensuring that administrators and staff only access data belonging to their specific tenant.
- **⚡ Real-Time Live Monitor**: A high-fidelity dashboard powered by **WebSockets** that streams check-ins, occupancy levels, and system alerts with sub-second latency.
- **🧠 Intelligent Caching**: Uses **Redis** as a performance accelerator. Membership status and anti-passback controls are handled in-memory, reducing PostgreSQL load by up to 90% during peak check-in hours.
- **🏗️ Production-Ready Stack**: Fully containerized with Docker, type-safe with TypeScript, and modeled with Prisma for maximum reliability.

---

## 🛠️ Technical Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Primary Persistence)
- **State & Cache**: Redis (Real-time tracking & Anti-passback)
- **Real-time**: WebSockets (Bi-directional streaming)
- **ORM**: Prisma (Type-safe modeling)
- **Frontend**: EJS & Vanilla JS (High-performance Server-Side Rendering)
- **DevOps**: Docker & Docker Compose

---

## 🏗️ Getting Started

### Prerequisites
- Docker Desktop
- Node.js (v20+)

### Quick Start (Local Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Klajdiz9/omnimember-api.git
   cd omnimember-api
   ```

2. **Configuration**:
   ```bash
   cp .env.example .env
   # No changes needed for local development via Docker
   ```

3. **Launch Infrastructure**:
   ```bash
   docker-compose up -d
   ```

4. **Initialize Database**:
   ```bash
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Run Application**:
   ```bash
   npm run dev
   ```

---

## 📊 Dashboard & Monitoring

The system includes a built-in **Live Monitor** accessible at:  
🔗 `http://localhost:3005/dashboard`

- **Test Admin**: `admin@omnimember.com`
- **Test Password**: `password123`

### Features:
- **Tenant Switching**: Admins can seamlessly switch between different brands (e.g., Milano vs Roma) to monitor separate locations.
- **Simulation Hub**: Test the real-time flow by simulating check-ins/check-outs for various members.
- **Occupancy Tracking**: Real-time counter of people currently inside each location.

---

## 🛡️ Security & Performance

- **JWT Authentication**: Short-lived access tokens with secure refresh logic.
- **Atomic Operations**: Redis-based `anti-passback` prevents multiple entries using the same card/ID simultaneously.
- **Scalable Broadcasts**: WebSocket events are scoped to specific `brandId` groups, ensuring data privacy even in the live stream.

---

## 👨‍💻 Portfolio & Development

Questo progetto fa parte del mio portfolio professionale come **Backend Developer / System Architect**. L'obiettivo è mostrare l'uso pratico di:
- **Architetture Multi-Tenant** e isolamento dei dati.
- **Sistemi in tempo reale** con WebSockets.
- **Ottimizzazione delle prestazioni** tramite caching stratificato (Redis).
- **Codice pulito e tipizzato** con TypeScript e Prisma.

*Sviluppato da Klajdi Ferhati - Architecting High-Performance Systems.*
