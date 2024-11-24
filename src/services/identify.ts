import prisma from "../db/dbconfig";

interface Contact {
    id: number;
    email: string | null;
    phoneNumber: string | null;
    linkedId: number | null;
    linkedContacts?: Array<Contact>;
    createdAt: Date;
    updatedAt: Date;
}

interface ProcessedData {
    primaryContatctId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
}

export default class ContactService {
    email?: string;
    phoneNumber?: string;

    constructor(email: string, phoneNumber: string) {
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    async getDataByEmailOrPhoneNumber(): Promise<Contact[]> {
        return await prisma.contact.findMany({
            where: {
                OR : [
                    { email: this.email },
                    { phoneNumber: this.phoneNumber },
                ],
            },
        });
    }

    async createData(linkedId: number | null = null): Promise<Contact | null> {
        return await prisma.contact.create({
            data: {
                email: this.email,
                phoneNumber: this.phoneNumber,
                linkedId: linkedId,
                linkPrecedence: linkedId ? "secondary" : "primary",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    async getPrimaryDataDetails(primaryId: number): Promise<Contact | null> {
        return await prisma.contact.findUnique({
            where: { id: primaryId },
            include: { linkedContacts: true },
        });
    }

    checkData(matchedData: Contact[]): number[] {
        const parentIds = new Set<number>();
        matchedData.forEach(data => {
            if (!data.linkedId) {
                parentIds.add(data.id);
            } else {
                parentIds.add(data.linkedId);
            }
        });
        return [...parentIds];
    }

    async manageResponse(parentId: number): Promise<ProcessedData> {
        const data = await this.getPrimaryDataDetails(parentId);

        const emails = new Set<string>();
        const phoneNumbers = new Set<string>();
        const secondaryContactIds = new Set<number>();

        if (data?.email) emails.add(data.email);
        if (data?.phoneNumber) phoneNumbers.add(data.phoneNumber);

        data?.linkedContacts?.forEach(item => {
            secondaryContactIds.add(item.id);
            if (item.email) emails.add(item.email);
            if (item.phoneNumber) phoneNumbers.add(item.phoneNumber);
        });

        return {
            primaryContatctId: parentId,
            emails: [...emails],
            phoneNumbers: [...phoneNumbers],
            secondaryContactIds: [...secondaryContactIds],
        };
    }

    async processData(): Promise<ProcessedData> {
        const matchedData = await this.getDataByEmailOrPhoneNumber();

        // Case 1: Where Primary contact should be created
        if (matchedData.length === 0) {
            const newContact = await this.createData();
            return {
                primaryContatctId: newContact?.id || 0,
                emails: this.email ? [this.email] : [],
                phoneNumbers: this.phoneNumber ? [this.phoneNumber] : [],
                secondaryContactIds: [],
            };
        }

        // Case 2: Update because the data is matched from two trees.
        const parentIds = this.checkData(matchedData);
        if(parentIds.length === 2){
            let primaryDetails1 = await this.getPrimaryDataDetails(parentIds[0]);
            let primaryDetails2 = await this.getPrimaryDataDetails(parentIds[1]);

            
            if (primaryDetails1?.createdAt! > primaryDetails2?.createdAt!) {
                [primaryDetails1, primaryDetails2] = [primaryDetails2, primaryDetails1];
            }

            await prisma.contact.updateMany({
                where: {
                    linkedId: primaryDetails2?.id,
                },
                data: {
                    linkedId: primaryDetails1?.id,
                    updatedAt: new Date(),
                },
            });

            await prisma.contact.update({
                where: {
                    id: primaryDetails2?.id,
                },
                data: {
                    linkedId: primaryDetails1?.id,
                    updatedAt: new Date(),
                    linkPrecedence: "secondary",
                },
            });

            const parentId = parentIds[0];
            return await this.manageResponse(parentId);
        }

        // Case 3 : When data is already present in the tree.
        let isEmailMatched : Boolean = this.email ? false : true, isPhoneNumberMatched : Boolean = this.phoneNumber ? false : true;

        matchedData.forEach(data => {
            if(data.email == this.email) isEmailMatched = true;
            if(data.phoneNumber == this.phoneNumber) isPhoneNumberMatched = true;
        });

        const parentId = parentIds[0];
        if(isEmailMatched && isPhoneNumberMatched){
            return await this.manageResponse(parentId);
        }
        // Case 4 : When Secondary created if the data is unique and not already present in the tree.
        await this.createData(parentId);
        return await this.manageResponse(parentId);
    }
}
