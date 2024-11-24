import { Request, Response } from "express";
import ContactService from "../services/identify";

export const postData = async (req: Request, res: Response): Promise<any> => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({
            message: "Please provide email or phone number",
        });
    }

    try {
        const contact = new ContactService(email, phoneNumber);
        const data = await contact.processData();
        return res.status(200).json(data);
    } catch (e) {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
