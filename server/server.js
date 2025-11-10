import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import userRoutes from "./routes/user.route.js";
import projectRoutes from "./routes/project.route.js";
import notificationRoutes from './routes/notification.route.js';

const app = express();

// Trust proxy for correct secure cookies on Vercel
app.set('trust proxy', 1);

// CORS: allow your client origin + local dev
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());
app.use(cookieParser());
connectDB();

app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes);
app.use('/api/notifications', notificationRoutes);

// Optional: add a health route if you don't have one
app.get('/', (req, res) => res.status(200).send('OK'));

const port = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}
export default app;