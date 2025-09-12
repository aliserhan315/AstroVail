import express from "express";
import routes from "./routes/index.routes.js";
const app = express();
app.use(express.json());
app.use(routes);
export { app };
