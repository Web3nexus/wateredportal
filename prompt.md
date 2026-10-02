MYWATER MEMBERSHIP PORTAL
MASTER DEVELOPMENT + UI/UX BUILD SPECIFICATION
================================================

Build a production-quality private membership portal for MYWATER.

This is NOT a marketing website.

It is a private digital membership, identity, verification and communication portal for MyWater members.

The existing MyWater WhatsApp/community operation already exists. This portal will become the structured digital membership system.

================================================
1. NON-NEGOTIABLE TECHNOLOGY ARCHITECTURE
================================================

Use a completely separated frontend/backend architecture.

FRONTEND:
- React
- Vite
- TypeScript if the existing project supports it
- React Router
- Tailwind CSS where appropriate
- Modern component architecture

BACKEND:
- Laravel
- Laravel API
- MySQL
- Laravel authentication
- Laravel validation
- Laravel authorization/policies
- Laravel queues/events where useful
- Laravel storage for member photographs and files

ARCHITECTURE:

frontend/
    React + Vite
        ↓ HTTPS / REST API
backend/
    Laravel
        ↓
    MySQL

IMPORTANT:

DO NOT USE NEXT.JS.

Do not introduce:
- Next.js
- App Router
- Next.js API routes
- Next.js server components
- Next.js middleware
- Next.js server actions
- next.config.js

Laravel is the backend.

React/Vite is the frontend.

The React frontend must NEVER connect directly to MySQL.


================================================
2. PROJECT STRUCTURE
================================================

The final source project must have a clean structure:

mywater-portal/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── api/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
├── backend/
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   ├── artisan
│   └── composer.json
│
└── README.md


================================================
3. DESIGN DIRECTION
================================================

The portal must feel like a real premium private organization platform.

DO NOT make it look like an AI-generated SaaS template.

Avoid:
- excessive gradients
- excessive glassmorphism
- giant rounded cards everywhere
- random floating blobs
- excessive shadows
- generic purple/blue AI gradients
- unnecessary animations
- oversized headings
- excessive icons
- "dashboard template" aesthetics
- meaningless statistics
- decorative UI that does not serve a purpose

The design should feel:

- institutional
- premium
- human
- discreet
- sophisticated
- trustworthy
- modern
- culturally respectful
- minimal
- intentional

Think of the quality level of a carefully designed private membership institution rather than a startup landing page.

The interface should feel designed by a professional product/design team.

Use strong typography, spacing, hierarchy and photography rather than visual effects to create quality.


================================================
4. DESIGN SYSTEM
================================================

Create a proper MyWater design system before building all screens.

Define:

- typography
- heading hierarchy
- body typography
- spacing system
- border radius
- shadows
- buttons
- inputs
- tables
- badges
- alerts
- modals
- navigation
- cards
- profile components
- QR components
- message components

Keep the design consistent throughout the entire application.

Do not randomly change styles between pages.


================================================
5. MOTION / INTERACTION
================================================

Use motion carefully.

The objective is not to show off animations.

Use subtle interaction where it improves usability.

Possible tools where appropriate:

- Framer Motion / Motion
- GSAP where genuinely useful
- Lenis or another smooth-scroll solution where appropriate
- Intersection Observer / ScrollReveal-style effects for subtle entrance animations
- Lucide icons or another consistent icon system

DO NOT animate everything.

Use:
- subtle page transitions
- smooth navigation
- controlled hover states
- subtle reveal animations
- gentle card/profile transitions
- loading states
- skeleton states
- meaningful micro-interactions

Animations should feel intentional and human.

Respect prefers-reduced-motion.


================================================
6. PORTAL ENTRY
================================================

The portal is:

portal.mywater.com

There is NO traditional marketing landing page.

The first screen should be extremely simple.

Example:

MYWATER

Private Membership Portal

[ LOG IN ]

[ JOIN MYWATER ]

The visual experience should immediately communicate:

private
exclusive
official
trusted
simple


================================================
7. JOIN MYWATER
================================================

Create a membership application flow.

The applicant should be able to submit the information required by MyWater.

Fields should include, where required:

- First name
- Last name
- Photograph
- Date of birth
- Place of birth
- Current location
- Phone number
- Email address
- Business / occupation
- Workplace
- Other required personal information
- Membership category/application category

Do not expose unnecessary fields.

The application should be divided into logical sections rather than one giant form.

Example:

PERSONAL INFORMATION
CONTACT INFORMATION
PROFESSIONAL INFORMATION
MEMBERSHIP INFORMATION
PHOTOGRAPH
CONSENT / CONFIRMATION

After submission:

Application submitted successfully.

The applicant should be informed that MyWater will contact them to complete the registration/approval process.

The applicant does NOT automatically become an active member unless approved.


================================================
8. APPLICATION MANAGEMENT
================================================

Laravel must store applications.

Application statuses:

- Pending
- Under Review
- Approved
- Rejected
- Contact Required
- Completed

Admin must be able to:

- view applications
- search applications
- filter applications
- open applicant profile
- review information
- approve
- reject
- request additional information
- convert approved applicant into member

Record timestamps and administrative actions.


================================================
9. MEMBERSHIP CATEGORIES
================================================

Initial membership categories:

1. Watered
2. Leopard's Court
3. Chokwe Initiates
4. Kemetic Court
5. Auset Court
6. The Reminder's Court
7. Hudorian Guard

Do NOT hard-code these throughout the React application.

Membership categories must be database-driven.

Laravel admin must be able to:

- create category
- edit category
- deactivate category
- assign category
- change member category

A member should have a clear membership status and category.


================================================
10. MEMBER ACCOUNT
================================================

Once approved, a member receives access to the portal.

Member dashboard should be simple.

Primary navigation:

- Overview
- Digital Card
- Profile
- Messages
- Settings

Do not overload the dashboard with unnecessary widgets.


================================================
11. DIGITAL MEMBERSHIP CARD
================================================

This is one of the most important features.

Create a premium digital membership card.

The card should contain:

- MyWater identity
- member photograph
- full name
- membership category
- member ID
- membership status
- QR code

The card should feel like a real digital identity card rather than a generic profile card.

Support responsive mobile presentation.

The member should be able to open their card quickly from the dashboard.


================================================
12. QR VERIFICATION
================================================

Every active member receives a unique QR code.

The QR code must NOT expose the entire private member database.

Scanning the QR should open a public verification page such as:

portal.mywater.com/verify/{secure-id}

Example:

MYWATER

MEMBER VERIFIED

[PHOTO]

FULL NAME

Membership:
Watered

Member ID:
MW-000123

Status:
ACTIVE

Only approved public verification information should be shown.

Do NOT expose by default:

- phone number
- date of birth
- home address
- private contact information
- private messages
- sensitive member information

Use a secure non-guessable identifier.


================================================
13. MEMBER PROFILE
================================================

Authenticated members should have a private profile containing:

- photograph
- full name
- date of birth
- place of birth
- current location
- business
- occupation
- workplace
- phone number
- email
- membership category
- member ID
- membership status

Allow members to request profile changes.

Sensitive changes may require admin approval.


================================================
14. MESSAGING SYSTEM
================================================

Every member has an inbox.

The inbox should feel like a professional private communication system.

Example:

Inbox

--------------------------------
Welcome to MyWater
MyWater Administration
Today

Membership Update
MyWater Administration
Yesterday

Important Notice
MyWater Administration
12 Sep
--------------------------------

Members can:

- read messages
- mark messages as read/unread
- archive messages
- search messages
- receive notifications for new messages


================================================
15. ADMIN MESSAGE TARGETING
================================================

Administrators must be able to send messages to:

A. Everyone

B. Membership category

- Watered
- Leopard's Court
- Chokwe Initiates
- Kemetic Court
- Auset Court
- The Reminder's Court
- Hudorian Guard

C. Individual members

D. Future extensible groups

The message composer should clearly show who will receive the message before sending.


================================================
16. ADMIN PORTAL
================================================

Create a separate authenticated admin interface.

Admin navigation:

Dashboard
Members
Applications
Membership Categories
Messages
Verification
Settings
Audit Log

Dashboard should show useful operational information only.

Examples:

Active Members
Pending Applications
New Members
Messages
Membership Distribution

Do not invent fake analytics.

Only show real database information.


================================================
17. MEMBER MANAGEMENT
================================================

Admin should be able to:

- search members
- filter by membership category
- filter by status
- view member
- edit member
- change category
- activate member
- suspend member
- deactivate member
- send message
- view membership history

Use proper authorization policies in Laravel.

Not every administrator should automatically have every permission.

Build the permission system so it can be extended later.


================================================
18. SECURITY
================================================

Treat this as a real membership database containing personal information.

Implement:

- HTTPS
- secure authentication
- Laravel authorization
- validation
- CSRF protection where applicable
- rate limiting
- secure password handling
- secure file upload validation
- MIME/type validation
- file size limits
- secure storage
- signed/temporary URLs where appropriate
- API authorization
- audit logging
- secure QR identifiers
- protection against IDOR
- protection against mass assignment
- input sanitization
- proper error handling

Never expose private member information through frontend source code.

Never trust membership/category/user IDs supplied by the client without authorization checks.


================================================
19. PRIVATE MESSAGING ENCRYPTION
================================================

The requirement is private communication.

Do not simply label normal server-side encrypted database messages as "end-to-end encrypted."

If true end-to-end encryption is implemented, design the cryptographic architecture properly.

Document:

- key generation
- key storage
- device/session handling
- encryption/decryption
- key recovery implications
- multi-device behavior
- message delivery
- attachment encryption

If true E2EE is not implemented in the MVP, clearly describe the system as encrypted in transit and encrypted at rest rather than falsely claiming E2EE.

Do not invent cryptography.

Use established cryptographic libraries/protocols where E2EE is required.


================================================
20. NOTIFICATIONS
================================================

Build the architecture so notifications can later support:

- in-portal notifications
- email
- push notifications
- WhatsApp integration if required later

Do not make WhatsApp a dependency for the core portal.

The portal must function independently.


================================================
21. MOBILE EXPERIENCE
================================================

The portal must be mobile-first.

Many members will access the digital card and QR code from their phones.

Prioritize:

- fast loading
- touch-friendly controls
- readable typography
- easy navigation
- digital card access
- QR visibility
- inbox usability

Desktop should also be fully supported.


================================================
22. ACCESSIBILITY
================================================

Implement proper:

- keyboard navigation
- focus states
- semantic HTML
- labels
- contrast
- screen reader support
- reduced motion
- accessible forms
- accessible error states


================================================
23. PERFORMANCE
================================================

Keep the application fast.

Avoid unnecessary libraries.

Use:

- lazy loading where appropriate
- optimized images
- pagination
- API pagination
- caching where appropriate
- efficient database queries
- eager loading where appropriate
- indexes for searchable database fields

Do not load the entire member database into React.


================================================
24. DATABASE DESIGN
================================================

Create proper Laravel migrations and relationships.

At minimum consider:

users
members
membership_categories
membership_applications
member_profiles
messages
message_recipients
notifications
audit_logs

Design relationships properly rather than putting everything into one giant members table.

Use foreign keys and indexes.

Do not duplicate information unnecessarily.


================================================
25. API DESIGN
================================================

Create a clean Laravel API.

Example structure:

POST   /api/auth/login
POST   /api/auth/logout
GET    /api/me

POST   /api/applications
GET    /api/member/profile
PATCH  /api/member/profile
GET    /api/member/card
GET    /api/member/messages
GET    /api/member/messages/{id}
PATCH  /api/member/messages/{id}/read

GET    /api/verify/{secureId}

Admin:

GET    /api/admin/members
GET    /api/admin/applications
POST   /api/admin/applications/{id}/approve
POST   /api/admin/applications/{id}/reject

GET    /api/admin/categories
POST   /api/admin/categories

POST   /api/admin/messages
GET    /api/admin/messages

Adapt these endpoints to the final Laravel architecture rather than blindly copying them.


================================================
26. REAL DATA ONLY
================================================

Do not populate production screens with fake statistics.

During development you may use seeders/demo data, but clearly separate:

DEVELOPMENT DATA

from

PRODUCTION DATA.


================================================
27. UX DETAILS THAT MAKE IT FEEL HUMAN
================================================

The application should not feel mechanically generated.

Pay attention to:

- realistic empty states
- useful loading states
- meaningful error messages
- thoughtful confirmation messages
- proper form validation
- sensible spacing
- natural copywriting
- appropriate button labels
- realistic navigation
- subtle interactions
- consistent terminology

Do not use generic text such as:

"Welcome to your amazing dashboard!"

Instead use professional, concise language.

Example:

"Welcome back."

"Your membership is active."

"You have 2 unread messages."


================================================
28. DO NOT OVERDESIGN
================================================

The application must be visually impressive through:

- typography
- layout
- photography
- spacing
- hierarchy
- interaction quality
- consistency

NOT through:

- excessive animations
- gradients everywhere
- excessive shadows
- huge cards
- excessive glass effects
- random decorative shapes
- unnecessary 3D elements

Use animation and visual effects only when they have a clear UX purpose.


================================================
29. DEVELOPMENT PROCESS
================================================

Do NOT immediately start writing hundreds of files.

First:

1. Audit the existing project.
2. Confirm the architecture.
3. Create the frontend/backend structure.
4. Define database schema.
5. Define API contracts.
6. Define authentication.
7. Define design system.
8. Build the core application.
9. Connect frontend to Laravel.
10. Test every workflow.
11. Perform security review.
12. Perform responsive/mobile review.
13. Perform visual polish.

Do not rebuild something that already works unless necessary.


================================================
30. REQUIRED CORE USER FLOWS
================================================

FLOW 1 — JOIN

Visitor
→ portal
→ Join MyWater
→ application form
→ submit
→ confirmation
→ admin receives application
→ review
→ approval/contact
→ member account created
→ member receives access


FLOW 2 — LOGIN

Member
→ portal
→ Login
→ authentication
→ member dashboard


FLOW 3 — DIGITAL CARD

Member
→ Digital Card
→ membership card
→ QR code
→ another phone scans
→ verification page


FLOW 4 — ADMIN MESSAGE

Admin
→ Messages
→ Create Message
→ Select Everyone / Category / Individual
→ Preview recipients
→ Send
→ recipients receive message in inbox


FLOW 5 — PROFILE

Member
→ Profile
→ view information
→ request changes
→ admin review if required


================================================
31. QUALITY STANDARD
================================================

Do not build this as a prototype that merely looks functional.

Build the foundation so that it can become a real production system.

The code must be:

- modular
- maintainable
- documented
- secure
- testable
- scalable
- logically organized

Do not put everything into App.tsx.

Do not put everything into one Laravel controller.

Use services, policies, requests, resources, models and components appropriately.


================================================
32. FINAL VERIFICATION
================================================

Before declaring the project complete, verify:

[ ] React + Vite frontend works
[ ] Laravel backend works
[ ] No Next.js exists
[ ] Frontend/backend are separated
[ ] Database migrations work
[ ] Authentication works
[ ] Join flow works
[ ] Application review works
[ ] Member creation works
[ ] Membership categories work
[ ] Digital card works
[ ] QR generation works
[ ] QR verification works
[ ] Profile works
[ ] Inbox works
[ ] Category messaging works
[ ] Individual messaging works
[ ] Global messaging works
[ ] Admin permissions work
[ ] Mobile layout works
[ ] Desktop layout works
[ ] Security checks pass
[ ] No private information leaks through QR verification
[ ] No secrets are exposed to React
[ ] API authorization is enforced
[ ] Production build succeeds
[ ] Laravel tests pass
[ ] Frontend tests pass where implemented

Finally provide:

1. Final architecture
2. Database schema
3. API endpoints
4. Frontend structure
5. Backend structure
6. Authentication method
7. Messaging architecture
8. QR verification architecture
9. Security measures
10. Remaining limitations
11. Development and production deployment instructions



The interface must look intentionally designed by a professional human product/design team. Avoid recognizable AI-template patterns and prioritize typography, spacing, hierarchy, restrained motion, real photography, meaningful interaction and consistent design decisions."

For the motion/scroll side, the agent can selectively use Motion/Framer Motion, GSAP, Lenis, Intersection Observer/ScrollReveal-style effects, but only where they improve the experience. That will give you the polished feel you're after without turning MyWater into an animation demo.
And I would keep the member portal itself much more restrained than the public-facing MyWater brand: the digital card, identity, QR verification and inbox should feel trustworthy and official rather than flashy.