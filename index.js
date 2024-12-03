import express from 'express';
import dotenv from 'dotenv';
import DbConnection from './config/Database.js';
import AdminRouter from './routes/Admin.js';
import TeacherRouter from './routes/Teacher.js';
import StudentRouter from './routes/Student.js';
import cors from "cors"
dotenv.config();
DbConnection();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/Admin', AdminRouter);
app.use('/api/v1/Teacher', TeacherRouter);
app.use('/api/v1/Student', StudentRouter);
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
