# User API Documentation

## Register User
Register a new user.

**URL:** `/api/user/register`

**Method:** `POST`

**Request Body:**
- `name` (string, required): User's name.
- `email` (string, required): User's email.
- `password` (string, required): User's password.

**Response:**
- `200 OK`: Registration successful.
- `400 Bad Request`: Validation errors.

## Login
Log in as an existing user.

**URL:** `/api/user/login`

**Method:** `POST`

**Request Body:**
- `email` (string, required): User's email.
- `password` (string, required): User's password.

**Response:**
- `200 OK`: Login successful. Returns a JWT token.
- `401 Unauthorized`: Invalid email or incorrect password.
- `500 Internal Server Error`: JWT secret key not available.

## Get User Profile
Retrieve user profile data.

**URL:** `/api/user/profile`

**Method:** `GET`

**Request Header:**
- `Authorization` (string, required): User's JWT token.

**Response:**
- `200 OK`: User profile data.
- `400 Bad Request`: User header is missing.
- `401 Unauthorized`: User data not found.

## Logout User
Log out the user.

**URL:** `/api/user/logout`

**Method:** `POST`

**Response:**
- `200 OK`: Logout successful.

## Send Email Verification
Send an email verification code.

**URL:** `/api/user/sendEmail-verify`

**Method:** `POST`

**Request Body:**
- `email` (string, required): User's email.

**Response:**
- `200 OK`: Verification email sent.
- `400 Bad Request`: Validation errors.
- `400 Bad Request`: Email doesn't exist.

## Verify Email
Verify the user's email with a code.

**URL:** `/api/user/verify-email?verifyCode={code}`

**Method:** `POST`

**Request Parameters:**
- `verifyCode` (string, required): Verification code.

**Response:**
- `200 OK`: Email verified successfully.
- `400 Bad Request`: Data hasn't been sent properly.
- `200 OK`: Token time has expired or is invalid.

## Forget Password
Initiate the password reset process.

**URL:** `/api/user/forget-password`

**Method:** `POST`

**Request Body:**
- `email` (string, required): User's email.

**Response:**
- `200 OK`: Reset email sent.
- `400 Bad Request`: Validation errors.
- `400 Bad Request`: Email doesn't exist.

## Reset Password
Reset the user's password.

**URL:** `/api/user/reset-password?token={token}`

**Method:** `POST`

**Request Parameters:**
- `token` (string, required): Reset token.

**Request Body:**
- `password` (string, required): New password.

**Response:**
- `200 OK`: Password reset successful.
- `400 Bad Request`: Data hasn't been sent properly.
- `200 OK`: Token time has expired or is invalid.

**Note:** Make sure to include the required headers, request bodies, and response codes as mentioned in the documentation.
