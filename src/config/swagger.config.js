import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  },
  apis: [path.join(__dirname, "../modules/**/*.js")],
};