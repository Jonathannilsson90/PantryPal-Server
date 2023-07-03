import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import recipeRoutes from "./routes/recipieRoutes";
import searchRoutes from "./routes/searchRoutes"
import userRoute from "./routes/userRoute"
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import cors from "cors";
import helmet from "helmet"
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(helmet())



app.use("/api/recipes", recipeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/user",userRoute);

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMessage = "An unknown error has occurred!";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
});

export default app;
