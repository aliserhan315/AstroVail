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
<img src="./readme/blockChain.png" alt="Blockchain Overview"/>

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
<img src="./readme/features.jpg" alt="Feature Diagram"/>

<br><br>

<!-- Demo -->
<img src="./readme/title5.svg"/>

### User Screens (Mobile)
| [Home](Frontend/app/index.tsx) | [Events](Frontend/app/(tabs)/events/index.tsx) | [Notifications](Frontend/app/(tabs)/notifications/index.tsx) |
| --- | --- | --- |
| ![Home](./readme/demo/home.jpg) | ![Events](./readme/demo/Events.jpg) | ![Notifications](./readme/demo/Notification.jpg) |

| [Overlay](Frontend/app/(tabs)/overlay/overlay.tsx) | [Star Details](Frontend/app/(tabs)/star/[starId].tsx) | [Gift](Frontend/app/(tabs)/gift/index.tsx) |
| --- | --- | --- |
| ![Overlay](./readme/demo/Overlay.jpg) | ![Star Details](./readme/demo/Star.mp4) | ![Gift](./readme/demo/Gift.mp4) |

| [AI Gift](Frontend/components/gift/GiftAIQuickModal/GiftAIQuickModal.tsx) | [Checkout](Frontend/app/checkout/index.tsx) | [Profile](Frontend/app/(tabs)/profile/index.tsx) |
| --- | --- | --- |
| ![AI Gift](./readme/demo/Aigift.mp4) | ![Checkout](./readme/demo/buying.mp4) | ![Profile](./readme/demo/Profile.mp4) |

| [Login](Frontend/app/(auth)/login.tsx) | [Register](Frontend/app/(auth)/register.tsx) | [Sky Finder](Frontend/app/(tabs)/overlay/finder.tsx) |
| --- | --- | --- |
| ![Login](./readme/demo/Sign.jpg) | ![Register](./readme/demo/Register.jpg) | ![Sky Finder](./readme/demo/skyfinder.mp4) |

## Alternative with Clickable Video Links

| [Star Details](Frontend/app/(tabs)/star/[starId].tsx) | [Gift](Frontend/app/(tabs)/gift/index.tsx) | [Profile](Frontend/app/(tabs)/profile/index.tsx) |
| --- | --- | --- |
| [▶️ **Watch Star Details Demo**](./readme/demo/Star.mp4) | [▶️ **Watch Gift Demo**](./readme/demo/Gift.mp4) | [▶️ **Watch Profile Demo**](./readme/demo/Profile.mp4) |

| [AI Gift](Frontend/components/gift/GiftAIQuickModal/GiftAIQuickModal.tsx) | [Checkout](Frontend/app/checkout/index.tsx) | [Sky Finder](Frontend/app/(tabs)/overlay/finder.tsx) |
| --- | --- | --- |
| [▶️ **Watch AI Gift Demo**](./readme/demo/Aigift.mp4) | [▶️ **Watch Checkout Demo**](./readme/demo/buying.mp4) | [▶️ **Watch Sky Finder Demo**](./readme/demo/skyfinder.mp4) |
<br>

### Pages (from the app)
- Onboarding: `Frontend/app/onboarding/index.tsx`
- Auth: `Frontend/app/(auth)/login.tsx`, `Frontend/app/(auth)/register.tsx`
- Tabs Root: `Frontend/app/(tabs)/index.tsx`
- Home/Explore: `Frontend/app/index.tsx`, `Frontend/app/(tabs)/explore/index.tsx`
- Stars: `Frontend/app/(tabs)/Stars/index.tsx`
- Star Details: `Frontend/app/(tabs)/star/[starId].tsx`
- Gift: `Frontend/app/(tabs)/gift/index.tsx`
- Events: `Frontend/app/(tabs)/events/index.tsx`
- Notifications: `Frontend/app/(tabs)/notifications/index.tsx`
- Overlay (Finder + Overlay): `Frontend/app/(tabs)/overlay/finder.tsx`, `Frontend/app/(tabs)/overlay/overlay.tsx`
- Profile: `Frontend/app/(tabs)/profile/index.tsx`
- Checkout: `Frontend/app/checkout/index.tsx`

<br>

### Automation Workflow
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
- Unit and integration tests for core modules (see `Backend/tests`)

| Testing Overview |
| --- |
| ![Testing](./readme/Testing.png) |

<br><br>

<!-- Deployment -->
<img src="./readme/title7.svg"/>

### Deployment Map
| Deployment Diagram |
| --- |
| ![Deployment](./readme/diagram1.jpg) |

<br><br>
