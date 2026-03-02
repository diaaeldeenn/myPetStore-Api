const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MyPetStore API",
      version: "1.0.0",
      description: "Authentication and User APIs Documentation",
    },
    servers: [
      {
        url: process.env.NODE_ENV === "production"
          ? "https://my-pet-store-api.vercel.app"
          : "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/modules/**/*.js"],
};