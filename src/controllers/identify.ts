import { Request, Response } from "express";
import ContactService from "../services/identify";
import { z } from "zod";

const contactSchema = z.object({
    email: z.string().email({ message: "Please provide a valid email" }).optional(),
    phoneNumber: z.string().regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }).optional()
});

export const postData = async (req: Request, res: Response): Promise<any> => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({
            message: "Please provide email or phone number",
        });
    }

    const valid = contactSchema.safeParse(req.body);
    if (!valid.success) {
        return res.status(400).json({
            message: "Validation Error",
            errors: valid.error.errors,
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
