import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import userRoutes from "./routes/user.route.js";
import projectRoutes from "./routes/project.route.js";
import notificationRoutes from './routes/notification.route.js';

const app = express();
const port = process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(cookieParser());
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => res.send('API working'))

if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}
export default app;