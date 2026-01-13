# Database Setup Instructions

## Option 1: Using Docker (Recommended)

If you're using Docker Compose, run commands inside the Docker container:

### Start Docker containers first:
```bash
docker-compose up -d
```

### Run migrations and seeders inside the backend container:
```bash
docker-compose exec backend php artisan migrate:fresh --seed
```

### Or run individual commands:
```bash
# Enter the backend container
docker-compose exec backend bash

# Then run commands inside
php artisan migrate:fresh --seed
php artisan db:seed
```

## Option 2: Using Local MySQL

If you want to run commands directly on your machine (not in Docker):

### 1. Create/Update `.env` file in `backend/` directory:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=app_db
DB_USERNAME=carrental_user
DB_PASSWORD=carrental_pass
```

### 2. Make sure MySQL is running locally and create the database:

```sql
CREATE DATABASE app_db;
CREATE USER 'carrental_user'@'localhost' IDENTIFIED BY 'carrental_pass';
GRANT ALL PRIVILEGES ON app_db.* TO 'carrental_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Then run migrations:

```bash
cd backend
php artisan migrate:fresh --seed
```

## Quick Check

To verify your database connection:

```bash
# If using Docker:
docker-compose exec backend php artisan migrate:status

# If using local MySQL:
cd backend
php artisan migrate:status
```

## Default Login Credentials (After Seeding)

- **Admin**: admin@carrental.com / password123
- **Staff**: staff@carrental.com / password123  
- **Customer**: customer@carrental.com / password123
