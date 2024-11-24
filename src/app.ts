import express, { Application } from "express";
import dotenv from 'dotenv';
import cors from "cors";
import routes from "../src/routes";
dotenv.config();
const app : Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api", routes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});