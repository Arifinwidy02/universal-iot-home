import express from "express";
import { router } from "./routes";
import { errorHandler } from "./middleware";

export const app = express();

app.use(express.json({ limit: "4kb" }));
app.use(router);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}.` });
});

app.use(errorHandler);
