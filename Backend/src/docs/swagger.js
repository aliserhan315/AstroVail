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
      }
    },
  },
  
  security: [{ bearerAuth: [] }],
  paths: {
    // AUTH ROUTES
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Create a new user account with email and password",
        security: [], // Public endpoint
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
        security: [], // Public endpoint
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
        security: [], // Uses refresh token in body instead
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
        security: [], // Uses refresh token in body
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

    // STARS ROUTES
    "/stars": {
      get: {
        tags: ["Stars"],
        summary: "List available stars",
        description: "Get a paginated list of stars available for purchase or browse all stars",
        security: [], // Public endpoint
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
        security: [], // Public endpoint
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
    }
  }
};