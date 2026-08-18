import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api", // Path to your API routes directory
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Next.js Swagger API",
        version: "1.0.0",
        description: "API documentation for my Next.js application",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
