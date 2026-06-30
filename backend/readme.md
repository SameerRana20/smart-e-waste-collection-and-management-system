# Smart E‑Waste Backend

Node.js / Express backend API for the **Smart E‑Waste Collection and Management System**.

## Tech

- Node.js / Express
- MySQL
- JWT (access + refresh tokens)
- Cloudinary (image uploads)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

This project does **not** auto-create the database or run migrations. You need to manually create the MySQL database before starting the server:

```sql
CREATE DATABASE ewaste_management;
```

Then run any schema/table-creation SQL scripts found in the `database/` folder against this database (using MySQL Workbench, CLI, or any client of your choice).

### 3. Configure environment variables

Create a `.env` file and copy `.env.example` to `.env` and fill in your own values:



| Variable | Description |
|---|---|
| `PORT` | Port the server runs on |
| `CORS_ORIGIN` | Allowed origin(s) for CORS (use `*` for dev, restrict in production) |
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (e.g. `ewaste_management`) |
| `ACCESS_TOKEN_SECRET` | Secret used to sign JWT access tokens |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry (e.g. `8m`) |
| `REFRESH_TOKEN_SECRET` | Secret used to sign JWT refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry (e.g. `10d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_CLOUD_KEY` | Cloudinary API key |
| `CLOUDINARY_CLOUD_SECRET` | Cloudinary API secret |

> 
### 4. Run the server

```bash
npm run dev
```

## Creating an Admin Account

Admin accounts **cannot be created via signup** on the website — this is intentional, since only Users and Collectors can self-register. To create an admin, insert one directly into the database using SQL:

```sql
INSERT INTO users (name, email, password_hash) 
VALUES ("","","");
```

## API Reference

A Postman collection (`E waste API.postman_collection.json`) is available in the `frontend/` folder for testing all API endpoints.