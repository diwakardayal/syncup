import "dotenv/config";
import express, { Router } from "express";
import cookieParser from 'cookie-parser'
import routerIndex from "./routes/routerIndex"

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(Router());

app.use("/api", routerIndex);

app.get("/", (req, res) => {
  res.json({
    message: "server is running",
  });
});

app.listen(5000, () => {
  console.log("server running on http://localhost:5000");
});


