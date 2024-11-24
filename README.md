# Bitespeed Backend Task: Identity Reconciliation

## Introduction

This project implements a backend service for the **Bitespeed Identity Reconciliation** task. The service is designed to consolidate customer identity data across multiple orders placed on an e-commerce platform. It resolves customer identity discrepancies by linking orders with matching contact information (email or phone number) and ensures that the oldest contact entry is marked as the "primary" record, with newer entries being linked as "secondary."

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Schema](#database-schema)
- [API Endpoint](#api-endpoint)
- [Setup Instructions](#setup-instructions)
- [How It Works](#how-it-works)
- [Examples](#examples)

---

## Problem Statement

Dr. Emmett Brown, using different emails and phone numbers for his purchases, posed a challenge for FluxKart.com in identifying loyal customers. **Bitespeed** needed a backend service to consolidate identity data and provide personalized experiences for such scenarios. This project solves the challenge by linking contact records based on shared email or phone information.

---

## Tech Stack

- **Node.js**: Backend runtime
- **TypeScript**: Strongly-typed JavaScript for better maintainability
- **Express.js**: Web framework for building REST APIs
- **Prisma**: ORM for database operations
- **MySQL**: Relational database for storing contact data
- **Postman**: For API testing and debugging

---

## Features

1. **Identify and Link Contacts**:
   - Automatically links contact entries based on shared phone numbers or email addresses.
   - Maintains the oldest contact as the primary entry, while linking newer entries as secondary.
   
2. **Dynamic Identity Resolution**:
   - Handles cases where primary contacts need to be updated dynamically based on new requests.

3. **Error-Resilient**:
   - Ensures data consistency and prevents duplication.

4. **REST API**:
   - A single `/identify` endpoint to handle all identity reconciliation requests.

---

## Database Schema

### `Contact` Table

| Column Name       | Data Type       | Description                              |
|-------------------|-----------------|------------------------------------------|
| `id`              | `Int`          | Unique identifier for the contact        |
| `phoneNumber`     | `String` (nullable) | Customer's phone number                |
| `email`           | `String` (nullable) | Customer's email                       |
| `linkedId`        | `Int` (nullable) | ID of the primary contact               |
| `linkPrecedence`  | `Enum`         | `primary` or `secondary`                |
| `createdAt`       | `DateTime`     | Record creation timestamp                |
| `updatedAt`       | `DateTime`     | Last updated timestamp                   |
| `deletedAt`       | `DateTime` (nullable) | Soft delete timestamp                  |

---

## API Endpoint

### **POST /identify**

#### Request Body

```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```
### Response Body 
```json
{
   "contact": {
      "primaryContactId": number,
      "emails": ["string"],
      "phoneNumbers": ["string"],
      "secondaryContactIds": [number]
   }
}
```
