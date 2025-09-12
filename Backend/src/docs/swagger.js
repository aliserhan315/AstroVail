import swaggerJSDoc from "swagger-jsdoc";

const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.APP_URL || `http://localhost:${PORT}`;

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "AstroVail API",
      version: "1.0.0",
      description: "API documentation for AstroVail backend",
    },
    servers: [
      { url: `${BASE_URL}/api`, description: isProd ? "Production" : "Local" },
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
        Star: {
          type: "object",
          properties: {
            _id: { type: "string" },
            baseName: { type: "string" },
            displayName: { type: "string", nullable: true },
            magnitude: { type: "number", nullable: true },
            constellation: { type: "string", nullable: true },
            owner: {
              type: "object",
              nullable: true,
              properties: { name: { type: "string", nullable: true } },
            },
          },
        },
        Event: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            startsAt: { type: "string", format: "date-time" },
            endsAt: { type: "string", format: "date-time" },
            location: { type: "string", nullable: true },
            description: { type: "string", nullable: true },
          },
        },
        Error: {
          type: "object",
          properties: { message: { type: "string" } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    "./src/routes/**/*.js",
    "./src/modules/**/*.routes.js",
    "./src/modules/**/*.controller.js",
  ],
});

