#!/bin/bash

# Setup script for NotaryNow application

echo "Setting up NotaryNow application..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Initialize the database
echo "Initializing the database..."
npx prisma migrate reset --force

# Seed the database
echo "Seeding the database with initial data..."
npx prisma db seed

echo "Setup complete! You can now run the application with 'npm run dev'"
echo ""
echo "Default login credentials:"
echo "Customer: jane.doe@example.com / customer123"
echo "Notary: john.smith@example.com / notary123"
echo "Admin: admin@notarynow.com / admin123"