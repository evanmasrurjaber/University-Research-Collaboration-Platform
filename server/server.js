import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import userRoutes from "./routes/user.route.js";
import projectRoutes from "./routes/project.route.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: 'http://localhost:5173', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']

}));
app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes);

app.get('/', (req, res) => res.send('API working'))

app.listen(port, () => console.log(`Server is running on port ${port}`));