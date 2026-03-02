import dotenv from "dotenv";
dotenv.config();

import app from "./app.controller.js";
import connectionDB from "./DB/connectionDB.js";

if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Server running on port 3000");
    connectionDB();
  });
}

export default app;