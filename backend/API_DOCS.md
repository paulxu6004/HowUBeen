# Backend API Documentation for HowUBeen (Safety Pivot)

## Base URL
`http://localhost:5000/api`

## Authentication (`/auth`)

### Signup
- **POST** `/auth/signup`
- **Body**: `{ "name": "John Doe", "email": "john@example.com", "password": "secret" }`
- **Response**: `{ "id": 1, "name": "John Doe", "email": "john@example.com" }`

### Login
- **POST** `/auth/login`
- **Body**: `{ "email": "john@example.com", "password": "secret" }`
- **Response**: `{ "id": 1, "name": "John Doe", "email": "john@example.com" }`

## Emergency Contacts (`/contacts`)

### Add Contact
- **POST** `/contacts/:userId`
- **Body**: `{ "name": "Mom", "email": "mom@example.com" }`
- **Response**: `{ "id": 1, "user_id": "...", "name": "Mom", "email": "mom@example.com" }`

### Get Contacts
- **GET** `/contacts/:userId`
- **Response**: `[ { "id": 1, "name": "Mom", "email": "mom@example.com" } ]`

## Check-ins (`/checkins`)

### Submit Check-in
- **POST** `/checkins`
- **Body**: 
    ```json
    {
      "user_id": 1,
      "status": "good", // "good", "neutral", "bad"
      "voice_url": "...url...", // optional
      "text_note": "Feeling okay today." // optional
    }
    ```
- **Response**: Check-in object

### Get Today's Status
- **GET** `/checkins/:userId/today`
- **Response**: `{ "checked_in": true/false, "checkin": { ... } }`

## Periods/Goals (`/periods`)

### Create Period (Set Goals)
- **POST** `/periods`
- **Body**:
    ```json
    {
      "user_id": 1,
      "start_date": "2023-01-01",
      "end_date": "2023-12-31",
      "goal_1": "Exercise",
      "goal_2": "Study",
      "goal_3": "Social"
    }
    ```
