const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.APP_URL || `http://localhost:${PORT}`;

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "AstroVail API",
    version: "1.0.0",
    description: "API documentation for AstroVail backend",
  },
  servers: [
    { url: `${BASE_URL}/api`, description: (isProd ? "Production" : "Local") + " API base" },
    { url: `${BASE_URL}`, description: (isProd ? "Production" : "Local") + " root (webhooks, etc.)" },
  ],
  tags: [
    { name: "Auth", description: "Authentication and session" },
    { name: "Stars", description: "Public and owned stars" },
    { name: "Events", description: "Astronomy events and reminders" },
    { name: "Notifications", description: "User notifications" },
    { name: "Checkout", description: "Checkout and orders" },
    { name: "Cart", description: "Shopping cart" },
    { name: "User", description: "Current user profile" },
    { name: "Overlay", description: "Astrometry overlay processing" },
    { name: "Ownership", description: "On-chain ownership utilities" },
    { name: "Certificates", description: "Certificate generation & actions" },
    { name: "AI", description: "AI helpers" },
    { name: "Webhooks", description: "Inbound webhooks" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "OK" },
            data: { type: "object" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            details: { type: "object", nullable: true },
          },
        },
        Star: {
          type: "object",
          properties: {
            _id: { type: "string" },
            catalogId: { type: "string" },
            baseName: { type: "string" },
            displayName: { type: "string", nullable: true },
            story: { type: "string", nullable: true },
            ra: { type: "number", nullable: true },
            dec: { type: "number", nullable: true },
            magnitude: { type: "number", nullable: true },
            constellation: { type: "string", nullable: true },
            nakedEye: { type: "boolean", nullable: true },
            binocular: { type: "boolean", nullable: true },
            owner: { type: "string", nullable: true },
            certificateStyle: { type: "string", enum: ["classic", "modern", "cosmic"] },
            createdAt: { type: "string", format: "date-time", nullable: true },
            updatedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        Event: {
          type: "object",
          properties: {
            _id: { type: "string" },
            source: { type: "string" },
            externalId: { type: "string" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            startTime: { type: "string", format: "date-time" },
            endTime: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            email: { type: "string", format: "email" },
            firstName: { type: "string", nullable: true },
            lastName: { type: "string", nullable: true },
            displayName: { type: "string", nullable: true },
            avatarUrl: { type: "string", nullable: true },
            tz: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time", nullable: true },
            updatedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        AuthPayload: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/User" },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            _id: { type: "string" },
            type: { type: "string", enum: ["event", "star"] },
            title: { type: "string" },
            body: { type: "string" },
            day: { type: "string" },
            readAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            starId: { type: "string" },
            qty: { type: "integer" },
            priceCents: { type: "integer" },
            recipientEmail: { type: "string", nullable: true },
            message: { type: "string", nullable: true },
            certificateStyle: { type: "string", enum: ["classic", "modern", "cosmic"] },
          },
        },
        Cart: {
          type: "object",
          properties: {
            _id: { type: "string" },
            items: { type: "array", items: { $ref: "#/components/schemas/CartItem" } },
            createdAt: { type: "string", format: "date-time", nullable: true },
            updatedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        OverlayJson: {
          type: "object",
          properties: {
            solved: { type: "boolean" },
            image: {
              type: "object",
              properties: { width: { type: "integer" }, height: { type: "integer" } },
            },
            inFrame: { type: "boolean" },
            center: {
              type: "object",
              properties: { ra: { type: "number" }, dec: { type: "number" } },
            },
            markers: { type: "array", items: { type: "object" } },
            guidance: { type: "object" },
            ai: { type: "object", nullable: true },
          },
        },
        OwnershipRecord: {
          type: "object",
          properties: {
            tokenId: { type: "string" },
            starId: { type: "string" },
            owner: { type: "string" },
          },
        },
        AICertificateMessagePayload: {
          type: "object",
          properties: {
            recipientName: { type: "string" },
            buyerName: { type: "string" },
            star: {
              type: "object",
              properties: {
                baseName: { type: "string", nullable: true },
                displayName: { type: "string", nullable: true },
                constellation: { type: "string", nullable: true },
                ra: { type: "number", nullable: true },
                dec: { type: "number", nullable: true },
                magnitude: { type: "number", nullable: true },
              },
            },
            style: { type: "string", enum: ["classic", "modern", "cosmic"] },
            tone: { type: "string", enum: ["short","friendly","romantic","fun","formal","inspirational"] },
            occasion: { type: "string" },
            length: { type: "string", enum: ["short","medium","long"] },
            language: { type: "string", enum: ["en","ar"] },
            eventDate: { type: "string" },
            userNotes: { type: "string" },
            includeAstronomyFacts: { type: "boolean" },
            includeConstellationMyth: { type: "boolean" },
            maxChars: { type: "integer" },
            count: { type: "integer" },
          },
          required: ["style"],
        },
      },
    },
  
  security: [{ bearerAuth: [] }],
  paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                    displayName: { type: "string" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    tz: { type: "string" },
                    location: {
                      type: "object",
                      properties: { lat: { type: "number" }, lon: { type: "number" }, accuracy: { type: "number" } },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Registered", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
            400: { description: "Email already in use", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string" }, tz: { type: "string" } } } } },
          },
          responses: {
            200: { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
            401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string" } } } } },
          },
          responses: {
            200: { description: "Refreshed", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
            401: { description: "Invalid refresh token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string" } } } } } },
          responses: { 200: { description: "Logged out", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
        },
      },

      // Stars
      "/stars": {
        get: {
          tags: ["Stars"],
          summary: "List available stars",
          parameters: [
            { in: "query", name: "q", schema: { type: "string" } },
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "limit", schema: { type: "integer" } },
            { in: "query", name: "constellation", schema: { type: "string" } },
            { in: "query", name: "magnitudeMax", schema: { type: "number" } },
            { in: "query", name: "nakedEye", schema: { type: "boolean" } },
            { in: "query", name: "binocular", schema: { type: "boolean" } },
            { in: "query", name: "sort", schema: { type: "string", enum: ["recent"] } },
          ],
          responses: { 200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
        },
        post: {
          tags: ["Stars"],
          summary: "Create star (gift or self)",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Star" } } } },
          responses: { 201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } },
        },
      },
      "/stars/me/stars": { get: { tags: ["Stars"], security: [{ bearerAuth: [] }], summary: "List my stars", responses: { 200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } } } },
      "/stars/by-catalog/{catalogId}": { get: { tags: ["Stars"], summary: "Get star by catalog id", parameters: [{ in: "path", name: "catalogId", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } }, 404: { description: "Not found" } } } },
      "/stars/{id}": {
        get: { tags: ["Stars"], summary: "Get star", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } }, 404: { description: "Not found" } } },
        patch: { tags: ["Stars"], security: [{ bearerAuth: [] }], summary: "Update star", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } }, 403: { description: "Forbidden" }, 404: { description: "Not found" } } },
        delete: { tags: ["Stars"], security: [{ bearerAuth: [] }], summary: "Delete star", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" }, 404: { description: "Not found" } } },
      },


      "/events": { get: { tags: ["Events"], summary: "List events", parameters: [{ in: "query", name: "from", schema: { type: "string" } }, { in: "query", name: "to", schema: { type: "string" } }, { in: "query", name: "q", schema: { type: "string" } }, { in: "query", name: "limit", schema: { type: "integer" } }, { in: "query", name: "includeNEO", schema: { type: "boolean" } }], responses: { 200: { description: "OK" } } } },
      "/events/{id}": { get: { tags: ["Events"], summary: "Get event", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" }, 404: { description: "Not found" } } } },
      "/events/{id}/remind": { post: { tags: ["Events"], security: [{ bearerAuth: [] }], summary: "Set reminders for event", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } } },

   
      "/notifications": { get: { tags: ["Notifications"], security: [{ bearerAuth: [] }], summary: "List notifications", responses: { 200: { description: "OK" } } } },
      "/notifications/{id}/read": { post: { tags: ["Notifications"], security: [{ bearerAuth: [] }], summary: "Mark notification read", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } } },

      "/checkout/create": { post: { tags: ["Checkout"], security: [{ bearerAuth: [] }], summary: "Create checkout", responses: { 200: { description: "OK" } } } },
      "/checkout/finalize": { post: { tags: ["Checkout"], security: [{ bearerAuth: [] }], summary: "Finalize order (test-only)", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { orderId: { type: "string" } } } } } }, responses: { 200: { description: "OK" } } } },

      "/cart": { get: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Get my cart", responses: { 200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } } } },
      "/cart/items": { post: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Add to cart", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["starId"], properties: { starId: { type: "string" }, qty: { type: "integer", default: 1 }, recipientEmail: { type: "string" }, message: { type: "string" }, certificateStyle: { type: "string", enum: ["classic","modern","cosmic"] } } } } } }, responses: { 200: { description: "OK" } } } },
      "/cart/items/{starId}": {
        patch: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Update cart item", parameters: [{ in: "path", name: "starId", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "OK" } } },
        delete: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Remove from cart", parameters: [{ in: "path", name: "starId", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
      },

      
      "/me": { get: { tags: ["User"], security: [{ bearerAuth: [] }], summary: "Get current user", responses: { 200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } } } } },
      "/me/profile": { patch: { tags: ["User"], security: [{ bearerAuth: [] }], summary: "Update profile", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "OK" } } } },
      "/me/device": { patch: { tags: ["User"], security: [{ bearerAuth: [] }], summary: "Update device", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "OK" } } } },

      "/overlay/overlay": {
        post: {
          tags: ["Overlay"],
          summary: "Solve image and guide to target star",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["image", "userStarId"],
                  properties: {
                    image: { type: "string", format: "binary" },
                    userStarId: { type: "string" },
                    format: { type: "string", enum: ["json", "png"], default: "json" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Overlay result (JSON or PNG)", content: { "application/json": { schema: { $ref: "#/components/schemas/OverlayJson" } }, "image/png": { schema: { type: "string", format: "binary" } } } },
          },
        },
      },

      "/ownership/mint": { post: { tags: ["Ownership"], summary: "Mint token to email", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string", format: "email" }, starId: { type: "string" }, orderId: { type: "string" } } } } } }, responses: { 200: { description: "OK" } } } },
      "/ownership/stars": { get: { tags: ["Ownership"], summary: "List stars by email", parameters: [{ in: "query", name: "email", required: true, schema: { type: "string", format: "email" } }], responses: { 200: { description: "OK" } } } },
      "/ownership/owner": { get: { tags: ["Ownership"], summary: "Get contract owner", responses: { 200: { description: "OK" } } } },
      "/ownership/ownerOf": { get: { tags: ["Ownership"], summary: "Get token owner", parameters: [{ in: "query", name: "tokenId", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } } },
      "/ownership/currentTokenId": { get: { tags: ["Ownership"], summary: "Get current token id", responses: { 200: { description: "OK" } } } },

      "/certificates/create": { post: { tags: ["Certificates"], summary: "Create certificate checkout", responses: { 200: { description: "OK" } } } },
      "/certificates/finalize": { post: { tags: ["Certificates"], summary: "Finalize certificate order (test)", responses: { 200: { description: "OK" } } } },

      "/ai/certificate-message": { post: { tags: ["AI"], summary: "Generate certificate message", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AICertificateMessagePayload" } } } }, responses: { 200: { description: "OK" }, 400: { description: "Bad request" }, 503: { description: "AI not configured" } } } },

      "/webhooks/stripe": {
        post: {
          tags: ["Webhooks"],
          summary: "Stripe webhook",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
          responses: { 200: { description: "Received" }, 400: { description: "Invalid signature" }, 500: { description: "Handler error" } },
        },
      },
  },
};
