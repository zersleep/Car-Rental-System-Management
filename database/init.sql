CREATE DATABASE IF NOT EXISTS app_db;
USE app_db;

-- =========================
-- USERS (LOGIN & ROLES)
-- =========================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Staff', 'Customer') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- CUSTOMERS (PROFILE DATA)
-- =========================
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================
-- VEHICLES
-- =========================
CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  status ENUM('Available','Reserved','Rented','Maintenance','Retired')
    DEFAULT 'Available',
  rental_price DECIMAL(10,2) NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- BOOKINGS (RESERVATIONS)
-- =========================
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10,2),
  status ENUM('Pending','Confirmed','Cancelled','Expired')
    DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB;

-- =========================
-- RENTALS (ACTIVE USAGE)
-- =========================
CREATE TABLE rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  checkout_time TIMESTAMP NULL,
  return_time TIMESTAMP NULL,
  odometer_out INT,
  odometer_in INT,
  fuel_out INT,
  fuel_in INT,
  status ENUM('Active','Returned') DEFAULT 'Active',

  FOREIGN KEY (booking_id) REFERENCES bookings(id)
) ENGINE=InnoDB;

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rental_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('Cash','Card'),
  status ENUM('Paid','Unpaid') DEFAULT 'Paid',
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (rental_id) REFERENCES rentals(id)
) ENGINE=InnoDB;

-- =========================
-- DAMAGES
-- =========================
CREATE TABLE damages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rental_id INT NOT NULL,
  description TEXT,
  cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (rental_id) REFERENCES rentals(id)
) ENGINE=InnoDB;

-- =========================
-- MAINTENANCE RECORDS
-- =========================
CREATE TABLE maintenance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  description TEXT,
  cost DECIMAL(10,2) NOT NULL,
  service_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB;