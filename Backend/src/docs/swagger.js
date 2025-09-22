const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.APP_URL || `http://localhost:${PORT}`;

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "AstroVail API",
    version: "1.0.0",
    description: "API documentation for AstroVail backend - A platform for digital star ownership and astronomy events",
    contact: {
      name: "AstroVail API Support",
      email: "support@astrovail.com"
    }
  },
  servers: [
    { url: `${BASE_URL}/api`, description: (isProd ? "Production" : "Local") + " API base" },
    { url: `${BASE_URL}`, description: (isProd ? "Production" : "Local") + " root (webhooks, etc.)" },
  ],
  tags: [
    { name: "Auth", description: "Authentication and session management" },
    { name: "Stars", description: "Public and owned stars management" },
    { name: "Events", description: "Astronomy events and reminders" },
    { name: "Notifications", description: "User notifications system" },
    { name: "Checkout", description: "Checkout and order processing" },
    { name: "Cart", description: "Shopping cart management" },
    { name: "User", description: "Current user profile management" },
    { name: "Overlay", description: "Astrometry overlay processing" },
    { name: "Ownership", description: "On-chain ownership utilities" },
    { name: "Certificates", description: "Certificate generation & actions" },
    { name: "AI", description: "AI-powered helpers and content generation" },
    { name: "Webhooks", description: "Inbound webhooks from external services" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token for authentication. Include 'Bearer ' prefix."
      },
    },
    schemas: {
      Success: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
          data: { type: "object", description: "Response data varies by endpoint" },
        },
        required: ["success"]
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "An error occurred" },
          details: { type: "object", nullable: true, description: "Additional error details" },
        },
        required: ["success", "message"]
      },
      Star: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Unique star identifier" },
          catalogId: { type: "string", description: "Catalog reference ID" },
          baseName: { type: "string", description: "Original catalog name" },
          displayName: { type: "string", nullable: true, description: "Custom display name" },
          story: { type: "string", nullable: true, maxLength: 5000, description: "Personal story or dedication" },
          ra: { type: "number", nullable: true, description: "Right ascension coordinate" },
          dec: { type: "number", nullable: true, description: "Declination coordinate" },
          magnitude: { type: "number", nullable: true, description: "Brightness magnitude" },
          constellation: { type: "string", nullable: true, description: "Constellation name" },
          nakedEye: { type: "boolean", nullable: true, description: "Visible to naked eye" },
          binocular: { type: "boolean", nullable: true, description: "Visible with binoculars" },
          owner: { type: "string", nullable: true, description: "Owner user ID" },
          pendingOwnerEmail: { type: "string", nullable: true, description: "Email of pending gift recipient" },
          isGifted: { type: "boolean", description: "Whether this star was gifted" },
          certificateStyle: { type: "string", enum: ["classic", "modern", "cosmic"], description: "Certificate design style" },
          createdAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true },
        },
        required: ["_id", "certificateStyle"]
      },
      CreateStarRequest: {
        type: "object",
        properties: {
          baseName: { type: "string", description: "Required if displayName not provided" },
          displayName: { type: "string", description: "Required if baseName not provided" },
          ra: { type: "number", description: "Right ascension" },
          dec: { type: "number", description: "Declination" },
          magnitude: { type: "number", description: "Brightness magnitude" },
          constellation: { type: "string", description: "Constellation name" },
          certificateStyle: { type: "string", enum: ["classic", "modern", "cosmic"], default: "classic" },
          catalogId: { type: "string", description: "Catalog reference" },
          nakedEye: { type: "boolean", description: "Visible to naked eye" },
          binocular: { type: "boolean", description: "Visible with binoculars" },
          isGifted: { type: "boolean", description: "Is this a gift" },
          recipientEmail: { type: "string", format: "email", description: "Gift recipient email" }
        }
      },
      UpdateStarRequest: {
        type: "object",
        properties: {
          displayName: { type: "string", maxLength: 120, description: "Custom display name" },
          story: { type: "string", maxLength: 5000, description: "Personal story or dedication" },
          certificateStyle: { type: "string", enum: ["classic", "modern", "cosmic"], description: "Certificate style" }
        }
      },
      Event: {
        type: "object",
        properties: {
          _id: { type: "string" },
          source: { type: "string", description: "Event source system" },
          externalId: { type: "string", description: "External system ID" },
          title: { type: "string", description: "Event title" },
          description: { type: "string", nullable: true, description: "Event description" },
          startTime: { type: "string", format: "date-time", description: "Event start time" },
          endTime: { type: "string", format: "date-time", nullable: true, description: "Event end time" },
          createdAt: { type: "string", format: "date-time", nullable: true },
        },
        required: ["_id", "source", "title", "startTime"]
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          email: { type: "string", format: "email" },
          firstName: { type: "string", nullable: true },
          lastName: { type: "string", nullable: true },
          displayName: { type: "string", nullable: true },
          avatarUrl: { type: "string", nullable: true, format: "uri" },
          tz: { type: "string", nullable: true, description: "IANA timezone" },
          location: {
            type: "object",
            nullable: true,
            properties: {
              lat: { type: "number", description: "Latitude" },
              lon: { type: "number", description: "Longitude" },
              accuracy: { type: "number", description: "Location accuracy in meters" },
              updatedAt: { type: "string", format: "date-time" }
            }
          },
          createdAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true },
        },
        required: ["_id", "email"]
      },
      UpdateUserRequest: {
        type: "object",
        properties: {
          firstName: { type: "string", maxLength: 50 },
          lastName: { type: "string", maxLength: 50 },
          displayName: { type: "string", maxLength: 100 },
          tz: { type: "string", description: "IANA timezone" },
          location: {
            type: "object",
            properties: {
              lat: { type: "number", minimum: -90, maximum: 90 },
              lon: { type: "number", minimum: -180, maximum: 180 },
              accuracy: { type: "number", minimum: 0 }
            }
          }
        }
      },
      AuthPayload: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          accessToken: { type: "string", description: "JWT access token (15min expiry)" },
          refreshToken: { type: "string", description: "Refresh token (30 days expiry)" },
        },
        required: ["user", "accessToken", "refreshToken"]
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6, description: "Minimum 6 characters" },
          displayName: { type: "string", description: "Display name" },
          firstName: { type: "string", description: "First name" },
          lastName: { type: "string", description: "Last name" },
          tz: { type: "string", description: "IANA timezone" },
          location: {
            type: "object",
            properties: {
              lat: { type: "number", minimum: -90, maximum: 90 },
              lon: { type: "number", minimum: -180, maximum: 180 },
              accuracy: { type: "number", minimum: 0 }
            }
          }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
          tz: { type: "string", description: "IANA timezone" }
        }
      },
      Notification: {
        type: "object",
        properties: {
          _id: { type: "string" },
          type: { type: "string", enum: ["event", "star"] },
          title: { type: "string" },
          body: { type: "string" },
          day: { type: "string", description: "Date in YYYY-MM-DD format" },
          readAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time", nullable: true },
          event: { $ref: "#/components/schemas/Event", nullable: true },
          star: { $ref: "#/components/schemas/Star", nullable: true }
        },
        required: ["_id", "type", "title", "body"]
      },
      CartItem: {
        type: "object",
        properties: {
          starId: { type: "string", description: "Reference to star" },
          qty: { type: "integer", minimum: 1, default: 1 },
          priceCents: { type: "integer", minimum: 0, description: "Price in cents" },
          recipientEmail: { type: "string", format: "email", nullable: true, description: "Gift recipient" },
          message: { type: "string", nullable: true, description: "Gift message" },
          certificateStyle: { type: "string", enum: ["classic", "modern", "cosmic"], default: "classic" },
        },
        required: ["starId", "qty", "priceCents", "certificateStyle"]
      },
      Cart: {
        type: "object",
        properties: {
          _id: { type: "string" },
          items: { type: "array", items: { $ref: "#/components/schemas/CartItem" } },
          createdAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true },
        },
        required: ["_id", "items"]
      },
      AddToCartRequest: {
        type: "object",
        required: ["starId"],
        properties: {
          starId: { type: "string", description: "Star ID to add to cart" },
          qty: { type: "integer", minimum: 1, default: 1 },
          recipientEmail: { type: "string", format: "email", description: "Gift recipient email" },
          message: { type: "string", description: "Personal message for gift" },
          certificateStyle: { type: "string", enum: ["classic", "modern", "cosmic"], default: "classic" }
        }
      },
      CheckoutRequest: {
        type: "object",
        properties: {
          paymentMethodId: { type: "string", description: "Stripe payment method ID" },
          billingAddress: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email" },
              line1: { type: "string" },
              line2: { type: "string", nullable: true },
              city: { type: "string" },
              state: { type: "string" },
              postal_code: { type: "string" },
              country: { type: "string" }
            },
            required: ["name", "email", "line1", "city", "country"]
          }
        }
      },
      Order: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userId: { type: "string" },
          items: { type: "array", items: { $ref: "#/components/schemas/CartItem" } },
          totalCents: { type: "integer" },
          status: { type: "string", enum: ["pending", "completed", "failed"] },
          paymentIntentId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      OverlayJson: {
        type: "object",
        properties: {
          solved: { type: "boolean", description: "Whether astrometry solution was found" },
          image: {
            type: "object",
            properties: { 
              width: { type: "integer" }, 
              height: { type: "integer" } 
            },
            description: "Image dimensions"
          },
          inFrame: { type: "boolean", description: "Whether target star is in frame" },
          center: {
            type: "object",
            properties: { 
              ra: { type: "number", description: "Right ascension of image center" }, 
              dec: { type: "number", description: "Declination of image center" } 
            },
            description: "Image center coordinates"
          },
          markers: { type: "array", items: { type: "object" }, description: "Star markers in image" },
          guidance: { type: "object", description: "Guidance information for finding target" },
          ai: { type: "object", nullable: true, description: "AI-generated insights" },
        },
        required: ["solved"]
      },
      OwnershipRecord: {
        type: "object",
        properties: {
          tokenId: { type: "string", description: "Blockchain token ID" },
          starId: { type: "string", description: "Associated star ID" },
          owner: { type: "string", description: "Owner wallet address or email" },
        },
        required: ["tokenId", "starId", "owner"]
      },
      AICertificateMessagePayload: {
        type: "object",
        required: ["style"],
        properties: {
          recipientName: { type: "string", description: "Name of certificate recipient" },
          buyerName: { type: "string", description: "Name of person buying/gifting" },
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
            description: "Star information for personalization"
          },
          style: { type: "string", enum: ["classic", "modern", "cosmic"], description: "Certificate style" },
          tone: { type: "string", enum: ["short","friendly","romantic","fun","formal","inspirational"], description: "Message tone" },
          occasion: { type: "string", description: "Special occasion or reason for gift" },
          length: { type: "string", enum: ["short","medium","long"], default: "short", description: "Message length preference" },
          language: { type: "string", enum: ["en","ar"], default: "en", description: "Message language" },
          eventDate: { type: "string", description: "Important date related to the gift" },
          userNotes: { type: "string", maxLength: 400, description: "Additional notes from user" },
          includeAstronomyFacts: { type: "boolean", default: false, description: "Include astronomy facts" },
          includeConstellationMyth: { type: "boolean", default: false, description: "Include constellation mythology" },
          maxChars: { type: "integer", minimum: 50, maximum: 2000, default: 280, description: "Maximum character limit" },
          count: { type: "integer", minimum: 1, maximum: 5, default: 1, description: "Number of message variations" },
        }
      },
      PaginatedStarsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "OK" },
          data: {
            type: "object",
            properties: {
              items: { type: "array", items: { $ref: "#/components/schemas/Star" } },
              page: { type: "integer", description: "Current page number" },
              limit: { type: "integer", description: "Items per page" },
              total: { type: "integer", description: "Total number of items" },
              totalPages: { type: "integer", description: "Total number of pages" }
            }
          }
        }
      },
      PaginatedEventsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "OK" },
          data: {
            type: "object",
            properties: {
              items: { type: "array", items: { $ref: "#/components/schemas/Event" } },
              page: { type: "integer", description: "Current page number" },
              limit: { type: "integer", description: "Items per page" },
              total: { type: "integer", description: "Total number of items" },
              totalPages: { type: "integer", description: "Total number of pages" }
            }
          }
        }
      },
      PaginatedNotificationsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "OK" },
          data: {
            type: "object",
            properties: {
              items: { type: "array", items: { $ref: "#/components/schemas/Notification" } },
              page: { type: "integer", description: "Current page number" },
              limit: { type: "integer", description: "Items per page" },
              total: { type: "integer", description: "Total number of items" },
              totalPages: { type: "integer", description: "Total number of pages" }
            }
          }
        }
      }
    },
  },
  
  security: [{ bearerAuth: [] }],
  paths: {
    // Auth endpoints
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Create a new user account with email and password",
        security: [], 
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              examples: {
                basic: {
                  summary: "Basic registration",
                  value: {
                    email: "user@example.com",
                    password: "securepassword123",
                    displayName: "John Doe"
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { 
            description: "User successfully registered",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AuthPayload" }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: { 
            description: "Email already in use or validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        description: "Authenticate user with email and password",
        security: [],
        requestBody: {
          required: true,
          content: { 
            "application/json": { 
              schema: { $ref: "#/components/schemas/LoginRequest" },
              examples: {
                basic: {
                  summary: "Basic login",
                  value: {
                    email: "user@example.com",
                    password: "securepassword123"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { 
            description: "Login successful",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AuthPayload" }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { 
            description: "Invalid credentials",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        description: "Get a new access token using refresh token",
        security: [],
        requestBody: {
          required: true,
          content: { 
            "application/json": { 
              schema: { 
                type: "object", 
                required: ["refreshToken"], 
                properties: { 
                  refreshToken: { type: "string", description: "Valid refresh token" } 
                } 
              }
            }
          }
        },
        responses: {
          200: { 
            description: "Token refreshed successfully",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AuthPayload" }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { 
            description: "Invalid or expired refresh token",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user",
        description: "Invalidate refresh token and logout user",
        security: [], 
        requestBody: { 
          required: true, 
          content: { 
            "application/json": { 
              schema: { 
                type: "object", 
                required: ["refreshToken"], 
                properties: { 
                  refreshToken: { type: "string", description: "Refresh token to invalidate" } 
                } 
              }
            }
          }
        },
        responses: { 
          200: { 
            description: "Successfully logged out",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } }
          }
        },
      },
    },

    // Stars endpoints
    "/stars": {
      get: {
        tags: ["Stars"],
        summary: "List available stars",
        description: "Get a paginated list of stars available for purchase or browse all stars",
        security: [],
        parameters: [
          { 
            in: "query", 
            name: "q", 
            schema: { type: "string" }, 
            description: "Search query for star names or constellations" 
          },
          { 
            in: "query", 
            name: "page", 
            schema: { type: "integer", minimum: 1, default: 1 }, 
            description: "Page number for pagination" 
          },
          { 
            in: "query", 
            name: "limit", 
            schema: { type: "integer", minimum: 1, maximum: 100, default: 25 }, 
            description: "Number of items per page" 
          },
          { 
            in: "query", 
            name: "constellation", 
            schema: { type: "string" }, 
            description: "Filter by constellation name" 
          },
          { 
            in: "query", 
            name: "magnitudeMax", 
            schema: { type: "number" }, 
            description: "Maximum brightness magnitude (lower = brighter)" 
          },
          { 
            in: "query", 
            name: "nakedEye", 
            schema: { type: "boolean" }, 
            description: "Filter stars visible to naked eye" 
          },
          { 
            in: "query", 
            name: "binocular", 
            schema: { type: "boolean" }, 
            description: "Filter stars visible with binoculars" 
          },
          { 
            in: "query", 
            name: "sort", 
            schema: { type: "string", enum: ["recent"] }, 
            description: "Sort order" 
          },
        ],
        responses: { 
          200: { 
            description: "Successfully retrieved stars",
            content: { 
              "application/json": { 
                schema: { $ref: "#/components/schemas/PaginatedStarsResponse" }
              }
            }
          }
        },
      },
      post: {
        tags: ["Stars"],
        summary: "Create a new star",
        description: "Create a star for yourself or as a gift for someone else",
        security: [{ bearerAuth: [] }],
        requestBody: { 
          required: true, 
          content: { 
            "application/json": { 
              schema: { $ref: "#/components/schemas/CreateStarRequest" },
              examples: {
                personal: {
                  summary: "Personal star",
                  value: {
                    displayName: "My Lucky Star",
                    baseName: "HD 12345",
                    ra: 45.5,
                    dec: 12.3,
                    magnitude: 4.2,
                    constellation: "Orion",
                    certificateStyle: "modern"
                  }
                },
                gift: {
                  summary: "Gift star",
                  value: {
                    displayName: "Sarah's Star",
                    recipientEmail: "sarah@example.com",
                    certificateStyle: "cosmic",
                    isGifted: true
                  }
                }
              }
            }
          }
        },
        responses: { 
          201: { 
            description: "Star created successfully",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Star" }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        },
      },
    },
    "/stars/me/stars": { 
      get: { 
        tags: ["Stars"], 
        security: [{ bearerAuth: [] }], 
        summary: "List my owned stars", 
        description: "Get all stars owned by the authenticated user",
        parameters: [
          { 
            in: "query", 
            name: "q", 
            schema: { type: "string" }, 
            description: "Search within owned stars" 
          },
          { 
            in: "query", 
            name: "page", 
            schema: { type: "integer", minimum: 1, default: 1 } 
          },
          { 
            in: "query", 
            name: "limit", 
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } 
          }
        ],
        responses: { 
          200: { 
            description: "Successfully retrieved owned stars",
            content: { 
              "application/json": { 
                schema: { $ref: "#/components/schemas/PaginatedStarsResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },
    "/stars/by-catalog/{catalogId}": { 
      get: { 
        tags: ["Stars"], 
        summary: "Get star by catalog ID", 
        description: "Retrieve a star using its catalog identifier",
        security: [], 
        parameters: [
          { 
            in: "path", 
            name: "catalogId", 
            required: true, 
            schema: { type: "string" },
            description: "Catalog identifier for the star"
          }
        ], 
        responses: { 
          200: { 
            description: "Star found",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Star" }
                      }
                    }
                  ]
                }
              }
            }
          }, 
          404: { 
            description: "Star not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },
    "/stars/{id}": {
      get: {
        tags: ["Stars"],
        summary: "Get star by ID",
        description: "Retrieve a specific star by its ID",
        security: [],
        parameters: [
          { 
            in: "path", 
            name: "id", 
            required: true, 
            schema: { type: "string" },
            description: "Star ID"
          }
        ],
        responses: {
          200: {
            description: "Star found",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Star" }
                      }
                    }
                  ]
                }
              }
            }
          },
          404: {
            description: "Star not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      },
      put: {
        tags: ["Stars"],
        summary: "Update star",
        description: "Update star details (only if you own it)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { 
            in: "path", 
            name: "id", 
            required: true, 
            schema: { type: "string" },
            description: "Star ID"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateStarRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Star updated successfully",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Star" }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          403: {
            description: "Not owner of this star",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Star not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },

    // Events endpoints
    "/events": {
      get: {
        tags: ["Events"],
        summary: "List astronomy events",
        description: "Get a paginated list of upcoming astronomy events",
        security: [],
        parameters: [
          { 
            in: "query", 
            name: "page", 
            schema: { type: "integer", minimum: 1, default: 1 } 
          },
          { 
            in: "query", 
            name: "limit", 
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } 
          },
          { 
            in: "query", 
            name: "upcoming", 
            schema: { type: "boolean", default: true }, 
            description: "Filter for upcoming events only" 
          },
          {
            in: "query",
            name: "source",
            schema: { type: "string" },
            description: "Filter by event source"
          }
        ],
        responses: {
          200: {
            description: "Successfully retrieved events",
            content: { 
              "application/json": { 
                schema: { $ref: "#/components/schemas/PaginatedEventsResponse" }
              }
            }
          }
        }
      }
    },
    "/events/{id}": {
      get: {
        tags: ["Events"],
        summary: "Get event by ID",
        description: "Retrieve a specific astronomy event",
        security: [],
        parameters: [
          { 
            in: "path", 
            name: "id", 
            required: true, 
            schema: { type: "string" },
            description: "Event ID"
          }
        ],
        responses: {
          200: {
            description: "Event found",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Event" }
                      }
                    }
                  ]
                }
              }
            }
          },
          404: {
            description: "Event not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },

    // User endpoints
    "/user/me": {
      get: {
        tags: ["User"],
        summary: "Get current user profile",
        description: "Retrieve the authenticated user's profile information",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User profile retrieved",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/User" }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      },
      put: {
        tags: ["User"],
        summary: "Update user profile",
        description: "Update the authenticated user's profile information",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Profile updated successfully",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/User" }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },

    // Notifications endpoints
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get user notifications",
        description: "Retrieve paginated list of user notifications",
        security: [{ bearerAuth: [] }],
        parameters: [
          { 
            in: "query", 
            name: "page", 
            schema: { type: "integer", minimum: 1, default: 1 } 
          },
          { 
            in: "query", 
            name: "limit", 
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } 
          },
          {
            in: "query",
            name: "unread",
            schema: { type: "boolean" },
            description: "Filter for unread notifications only"
          }
        ],
        responses: {
          200: {
            description: "Notifications retrieved successfully",
            content: { 
              "application/json": { 
                schema: { $ref: "#/components/schemas/PaginatedNotificationsResponse" }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },
    "/notifications/{id}/read": {
      post: {
        tags: ["Notifications"],
        summary: "Mark notification as read",
        description: "Mark a specific notification as read",
        security: [{ bearerAuth: [] }],
        parameters: [
          { 
            in: "path", 
            name: "id", 
            required: true, 
            schema: { type: "string" },
            description: "Notification ID"
          }
        ],
        responses: {
          200: {
            description: "Notification marked as read",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Notification not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },
    "/notifications/read-all": {
      post: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        description: "Mark all user notifications as read",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "All notifications marked as read",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },

    // Cart endpoints
    "/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get user cart",
        description: "Retrieve the user's shopping cart",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Cart retrieved successfully",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Cart" }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      },
      delete: {
        tags: ["Cart"],
        summary: "Clear cart",
        description: "Remove all items from the user's cart",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Cart cleared successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },
    "/cart/add": {
      post: {
        tags: ["Cart"],
        summary: "Add item to cart",
        description: "Add a star to the user's shopping cart",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddToCartRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Item added to cart successfully",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Cart" }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: "Validation error or star already owned",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },
    "/cart/remove/{starId}": {
      delete: {
        tags: ["Cart"],
        summary: "Remove item from cart",
        description: "Remove a specific star from the user's cart",
        security: [{ bearerAuth: [] }],
        parameters: [
          { 
            in: "path", 
            name: "starId", 
            required: true, 
            schema: { type: "string" },
            description: "Star ID to remove from cart"
          }
        ],
        responses: {
          200: {
            description: "Item removed from cart successfully",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Cart" }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Item not found in cart",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },

    // Checkout endpoints
    "/checkout/create-intent": {
      post: {
        tags: ["Checkout"],
        summary: "Create payment intent",
        description: "Create a Stripe payment intent for the user's cart",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Payment intent created successfully",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            clientSecret: { type: "string" },
                            paymentIntentId: { type: "string" },
                            amount: { type: "integer" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: "Empty cart or validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },
    "/checkout/confirm": {
      post: {
        tags: ["Checkout"],
        summary: "Confirm checkout",
        description: "Complete the checkout process and create order",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CheckoutRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Checkout completed successfully",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Order" }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: "Payment failed or validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },

    // Overlay endpoints
    "/overlay/process": {
      post: {
        tags: ["Overlay"],
        summary: "Process astrometry overlay",
        description: "Process an astronomical image to identify stars and create overlay data",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description: "Astronomical image file"
                  },
                  starId: {
                    type: "string",
                    description: "Target star ID for overlay"
                  }
                },
                required: ["image", "starId"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Overlay processed successfully",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/OverlayJson" }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: "Invalid image or processing error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },

    // Ownership endpoints
    "/ownership/verify": {
      post: {
        tags: ["Ownership"],
        summary: "Verify star ownership",
        description: "Verify ownership of a star on the blockchain",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["starId"],
                properties: {
                  starId: { type: "string", description: "Star ID to verify ownership" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Ownership verified",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/OwnershipRecord" }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Ownership record not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },

    // Certificates endpoints
    "/certificates/{starId}/generate": {
      post: {
        tags: ["Certificates"],
        summary: "Generate star certificate",
        description: "Generate a certificate for an owned star",
        security: [{ bearerAuth: [] }],
        parameters: [
          { 
            in: "path", 
            name: "starId", 
            required: true, 
            schema: { type: "string" },
            description: "Star ID to generate certificate for"
          }
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  format: { type: "string", enum: ["pdf", "png"], default: "pdf" },
                  style: { type: "string", enum: ["classic", "modern", "cosmic"] }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Certificate generated successfully",
            content: { 
              "application/pdf": {
                schema: {
                  type: "string",
                  format: "binary"
                }
              },
              "image/png": {
                schema: {
                  type: "string",
                  format: "binary"
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          403: {
            description: "Not owner of this star",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          404: {
            description: "Star not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },

    // AI endpoints
    "/ai/certificate-message": {
      post: {
        tags: ["AI"],
        summary: "Generate AI certificate message",
        description: "Generate personalized certificate messages using AI",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AICertificateMessagePayload" }
            }
          }
        },
        responses: {
          200: {
            description: "Message generated successfully",
            content: { 
              "application/json": { 
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              description: "Generated message variations"
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    },

    // Webhook endpoints (no auth required)
    "/webhooks/stripe": {
      post: {
        tags: ["Webhooks"],
        summary: "Stripe webhook handler",
        description: "Handle incoming Stripe webhooks for payment processing",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                description: "Stripe webhook payload"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Webhook processed successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } }
          },
          400: {
            description: "Invalid webhook payload",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
          }
        }
      }
    }
  }
};