<img src="./readme/title1.svg"/>

<br><br>

<!-- Project Overview -->
<img src="./readme/title2.svg"/>

> AstroVail is a mobile-first astronomy platform to discover, claim, and gift real stars.
> It blends on-chain ownership, an AI-assisted experience, and a live sky finder overlay.
> Users can verify ownership on blockchain, generate certificates, and locate stars in the night sky.

**Users can:**
- Explore stars by constellation, brightness, or coordinates
- Claim verifiable ownership on-chain and generate certificates
- Create AI-powered stories and personalized gifts
- Use the Live Finder overlay to locate stars in real time
- Get event alerts (meteor showers, eclipses, ISS passes)

<br><br>

<!-- System Design -->
<img src="./readme/title3.svg"/>

### System Design Diagram
<img src="./readme/SystemDesign.png" alt="System Design"/>

### Tech Stack
<img src="./readme/Techstack.png" alt="Tech Stack"/>

### On-Chain Ownership
<img src="./readme/blockChain.png" alt="Blockchain Overview" width="720"/>

#### On-Chain Claim & Verify Flow
```mermaid
flowchart LR
  U[User selects star] --> A[App: create claim]
  A --> B[Backend: validate + sign]
  B --> C[(Smart Contract: mint/transfer)]
  C --> D[Tx receipt + tokenId]
  D --> E[Backend: persist + notify]
  E --> F[n8n: email certificate]
  C --> G[Explorer: on-chain verification]
```

#### Blockchain Screens
| Items (Marketplace/Ownership) | Contract View / Code |
| --- | --- |
| <img src="./readme/ChainItems.png" width="420" alt="Chain Items"/> | <img src="./readme/ChainCode.png" width="420" alt="Chain Code"/> |

<br><br>

<!-- Project Highlights -->
<img src="./readme/title4.svg"/>

### The Journey of the Sexy Features
- Live Sky Finder Overlay: camera + GPS + compass to guide you to your star.
- On‑Chain Star Ownership: mint, claim, and transfer with verifiable proofs.
- AI Star Storyteller: personalized lore for gifts and certificates.
- Event & Notification Center: timely cosmic events and reminders.
- Seamless Gift Flow & Checkout: purchase, personalize, preview certificate.

### Feature Diagram
<img src="./readme/features.jpg" alt="Feature Diagram" width="720"/>

### AI Agents

```mermaid
flowchart LR
  Photo[Sky photo + GPS + compass] --> Match[Star map match]
  Match -->|yes| Confirm[On target]
  Match -->|no| Guide[Directional nudge overlay]
```

```mermaid
flowchart LR
  I[Inputs: recipient + tone + star] --> T[Tone selection]
  T --> EN[Compose English]
  EN --> AR[Translate/adapt Arabic]
  AR --> O[Final bilingual message]
```

Agent 1 — Sky Check (Are you looking at your star?)
- Inputs: a live sky photo, location, device orientation, and your star’s coordinates.
- Steps: align your phone to the sky → compare star map to your camera view.
- Decisions: if the view matches your star’s position, it confirms alignment; otherwise it guides you closer.
- Outputs: a clear “You’re on target!” or “Adjust this way” prompt, plus a subtle overlay to nudge you in the right direction.

Agent 2 — Gift Message Writer (English + Arabic)
- Inputs: recipient name, occasion, your star details (name/date/constellation), and optional tone (romantic, friendly, playful).
- Steps: craft a short, warm note in English → generate the same sentiment in Arabic.
- Decisions: adapt tone and length to keep it sweet and readable for gifting.
- Outputs: a ready‑to‑use bilingual message for the gift card/certificate.


<br><br>

<!-- Demo -->
<img src="./readme/title5.svg"/>

### User Screens (Mobile)

| [Home](Frontend/app/index.tsx) | [Events](Frontend/app/(tabs)/events/index.tsx) | [Notifications](Frontend/app/(tabs)/notifications/index.tsx) |
| --- | --- | --- |
| <img src="./readme/demo/home.jpg" width="280" alt="Home"/> | <img src="./readme/demo/Events.jpg" width="280" alt="Events"/> | <img src="./readme/demo/Notification.jpg" width="280" alt="Notifications"/> |

| [Overlay](Frontend/app/(tabs)/overlay/overlay.tsx) | [Star Details](Frontend/app/(tabs)/star/[starId].tsx) (Image) | View Certificate (GIF) |
| --- | --- | --- |
| <img src="./readme/demo/Overlay.jpg" width="280" alt="Overlay"/> | <img src="./readme/demo/Stardetails.jpg" width="280" alt="Star Details"/> | <img src="./readme/demo/ViewCertificate.gif" width="280" alt="View Certificate"/> |

| [Gift](Frontend/app/(tabs)/gift/index.tsx) (GIF) | [Checkout](Frontend/app/checkout/index.tsx) (GIF) | [Profile](Frontend/app/(tabs)/profile/index.tsx) (GIF) |
| --- | --- | --- |
| <img src="./readme/demo/Aigift.gif" width="280" alt="Gift"/> | <img src="./readme/demo/buying.gif" width="280" alt="Checkout (HD)"/> | <img src="./readme/demo/Profile.gif" width="280" alt="Profile"/> |

| [Login](Frontend/app/(auth)/login.tsx) | [Register](Frontend/app/(auth)/register.tsx) | [Sky Finder](Frontend/app/(tabs)/overlay/finder.tsx) (GIF) |
| --- | --- | --- |
| <img src="./readme/demo/Sign.jpg" width="280" alt="Login"/> | <img src="./readme/demo/Register.jpg" width="280" alt="Register"/> | <img src="./readme/demo/skyfinder.gif" width="280" alt="Sky Finder"/> |

<br>

<!-- Pages section removed per request -->

<br>

### n8n Automations
- Sends purchased star certificates via email (templated message + PDF/image attachment).
- Backs up data weekly (database + assets) and stores snapshots with retention.
| n8n Workflow |
| --- |
| ![n8n](./readme/n8n.png) |

### Swagger
| Swagger UI | API Docs |
| --- | --- |
| ![Swagger UI](./readme/Swagger.png) | ![Swagger Docs](./readme/swagger2.png) |

<br><br>

<!-- Development & Testing -->
<img src="./readme/title6.svg"/>

### Services
- Stars, Events, Notifications, Certificates, Ownership, Checkout, AI, Overlay
- Express + MongoDB backend with JWT auth
- On-chain integration via smart contracts and service wrappers

| Services Overview |
| --- |
| ![Services](./readme/Service.png) |

### Testing
- Unit and integration tests for core modules (see `Backend/tests`).
- Two snapshots below to reflect recent coverage updates.

| Test View 1 | Test View 2 |
| --- | --- |
| ![Testing snip it](./readme/Testing.png) | ![Testing results](./readme/testing2.png) |

### Linear (Project Tracking)
- High‑level planning and task tracking for features and sprints.
- Clear ticket flows help coordinate frontend, backend, and ops work.

| Linear Board |
| --- |
| ![Linear](./readme/Linear.png) |

<br><br>

<!-- Deployment -->
<img src="./readme/title7.svg"/>

### Deployment Map
| Deployment Diagram |
| --- |
| ![Deployment](./readme/diagram1.jpg) |

#### Checkout Flow (Process)
```mermaid
flowchart LR
  U[User selects gift] --> G[Customize gift]
  G --> Ck[Checkout]
  Ck --> Pay[Payment]
  Pay --> Ok{Success?}
  Ok -- yes --> Cert[Generate certificate]
  Cert --> Email[n8n: email + receipt]
  Ok -- no --> Help[Retry / support]
```

<br><br>
