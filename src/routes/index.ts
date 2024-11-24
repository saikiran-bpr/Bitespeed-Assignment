import express from "express";
import { postData } from "../controllers/identify";

const router = express.Router();

router.post("/identify", postData);

export default router;