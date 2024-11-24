import { Request, Response } from "express";
import ContactService from "../services/identify";

export const postData = async (req : Request, res : Response) => {
    const { email, phoneNumber } = req.body;
    if(!email && !phoneNumber)
        res.status(400).json({
            message : "Please provide email or password"
        })
    try{
        const contact = new ContactService(email, phoneNumber);
        const data = await contact.processData();
        res.status(200).json(data);
    } catch(e){
        res.status(500).json({
            message : "Internal Server Error"
        });
    }
}