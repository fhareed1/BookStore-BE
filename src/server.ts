import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes";
import bookRouter from "./routes/bookStoreRoutes";
import authMiddleware from "./middleware/authMiddleware";
import dotenv from "dotenv";

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

// IMPORTANT: Apply CORS middleware first
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Then apply the JSON middleware
app.use(express.json());

// Then set up your routes
app.use("/auth", authRouter);
app.use("/books", authMiddleware, bookRouter);

// Add a test route to verify CORS is working
app.get("/test-cors", (req, res) => {
  res.json({ message: "CORS is working!" });
});

app.listen(PORT, () => {
  console.log(`App is listening on ${PORT}`);
});
