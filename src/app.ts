import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import recipeRoutes from "./routes/recipieRoutes";
import searchRoutes from "./routes/searchRoutes"
import userRoute from "./routes/userRoute"
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import cors from "cors";
import helmet from "helmet"
import jwt from "jsonwebtoken"
import env from "./util/validateEnv"
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(helmet())


app.use("/api/user",userRoute);

app.use("/api/recipes", verficationToken, recipeRoutes);
app.use("/api/search", verficationToken, searchRoutes);

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});


function verficationToken(req: Request, res: Response, next: NextFunction){
const bearer = req.headers["authorization"];
const token = bearer && bearer.split(" ")[1];

if (!token) {
  return res.status(401).send("Unauthorized");
}
jwt.verify(token, env.ACCESS_SECRET_TOKEN, (error) =>{
  if(error) {
    return res.status(403).send("Forbidden");
  }
  next();
})
}


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
