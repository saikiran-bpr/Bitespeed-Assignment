import express, { Application, Request, Response } from "express";
import dotenv from 'dotenv';
import cors from "cors";

dotenv.config();
const app : Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});