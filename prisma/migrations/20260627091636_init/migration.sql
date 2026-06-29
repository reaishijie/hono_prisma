-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'PRO', 'MAX');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('NORMAL', 'DISABLED', 'DELETED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "avatar" VARCHAR(255),
    "username" VARCHAR(30) NOT NULL,
    "nickname" VARCHAR(30),
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(15),
    "status" "UserStatus" NOT NULL DEFAULT 'NORMAL',
    "plan" "UserPlan" NOT NULL DEFAULT 'FREE',
    "balance" DECIMAL(12,2) DEFAULT 0,
    "plan_end_time" TIMESTAMP(6),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "profile" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30),
    "baseUrl" VARCHAR(255) NOT NULL,
    "key" VARCHAR(255) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" SERIAL NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "name" VARCHAR(30),
    "model_name" VARCHAR(30) NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "user_created_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "user_plan_time_idx" ON "users"("plan", "plan_end_time");

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
