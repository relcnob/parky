-- CreateEnum
CREATE TYPE "Sizes" AS ENUM ('xsmall', 'small', 'medium', 'large', 'xlarge');

-- CreateEnum
CREATE TYPE "bookingTypes" AS ENUM ('hourly', 'monthly');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(255),
    "isDriver" BOOLEAN,
    "isOwner" BOOLEAN,
    "balance" INTEGER DEFAULT 0,
    "licensePlate" VARCHAR(255),
    "vehicleModel" VARCHAR(255),
    "vehicleSize" "Sizes",
    "rating" REAL DEFAULT 5.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileReview" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "issuedFromParkingId" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingReview" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "parkingId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinOrder" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingSpot" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "imageURL" TEXT,
    "price" INTEGER NOT NULL,
    "rating" REAL DEFAULT 5.0,
    "availableStart" TIMESTAMP(3) NOT NULL,
    "availableEnd" TIMESTAMP(3) NOT NULL,
    "features" JSONB,
    "description" TEXT NOT NULL,
    "dimensions" "Sizes" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "parkingId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "type" "bookingTypes",
    "status" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_id_key" ON "Profile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE INDEX "Profile_id_idx" ON "Profile"("id");

-- CreateIndex
CREATE INDEX "ProfileReview_id_profileId_idx" ON "ProfileReview"("id", "profileId");

-- CreateIndex
CREATE INDEX "ParkingReview_id_profileId_parkingId_idx" ON "ParkingReview"("id", "profileId", "parkingId");

-- CreateIndex
CREATE INDEX "CoinOrder_profileId_id_idx" ON "CoinOrder"("profileId", "id");

-- CreateIndex
CREATE INDEX "ParkingSpot_profileId_id_idx" ON "ParkingSpot"("profileId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");

-- CreateIndex
CREATE INDEX "Booking_parkingId_profileId_idx" ON "Booking"("parkingId", "profileId");
