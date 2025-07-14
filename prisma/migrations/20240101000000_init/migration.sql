-- CreateEnum
CREATE TYPE "ticket_status" AS ENUM ('OPEN', 'CLOSED', 'PENDING', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ticket_priority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbots" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "primary_color" VARCHAR(50) NOT NULL DEFAULT '#14b8a6',
    "text_color" VARCHAR(50) NOT NULL DEFAULT '#ffffff',
    "background_color" VARCHAR(50) NOT NULL DEFAULT '#f3f4f6',
    "chat_icon" TEXT NOT NULL DEFAULT '💬',
    "position" VARCHAR(50) NOT NULL DEFAULT 'bottom-right',
    "margin_x" INTEGER NOT NULL DEFAULT 20,
    "margin_y" INTEGER NOT NULL DEFAULT 20,
    "deepseek_api_key" TEXT,
    "welcome_message" TEXT NOT NULL DEFAULT 'سلام! چطور می‌توانم به شما کمک کنم؟',
    "navigation_message" TEXT NOT NULL DEFAULT 'چه چیزی شما را به اینجا آورده است؟',
    "knowledge_base_text" TEXT,
    "knowledge_base_url" TEXT,
    "store_url" TEXT,
    "ai_url" TEXT,
    "stats_multiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "enable_product_suggestions" BOOLEAN NOT NULL DEFAULT true,
    "enable_next_suggestions" BOOLEAN NOT NULL DEFAULT true,
    "prompt_template" TEXT,

    CONSTRAINT "chatbots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "user_message" TEXT,
    "bot_response" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_ip" VARCHAR(50),
    "user_agent" TEXT,
    "user_id" INTEGER,
    "chatbot_id" INTEGER NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_faqs" (
    "id" SERIAL NOT NULL,
    "chatbot_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "emoji" VARCHAR(10) DEFAULT '❓',
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "chatbot_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_products" (
    "id" SERIAL NOT NULL,
    "chatbot_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "price" DECIMAL(10,2),
    "position" INTEGER NOT NULL DEFAULT 0,
    "button_text" VARCHAR(100) NOT NULL DEFAULT 'خرید',
    "secondary_text" VARCHAR(100) NOT NULL DEFAULT 'جزئیات',
    "product_url" TEXT,

    CONSTRAINT "chatbot_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_options" (
    "id" SERIAL NOT NULL,
    "chatbot_id" INTEGER NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "emoji" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "chatbot_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "image_url" TEXT,
    "category" TEXT,
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "chatbot_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "user_ip" VARCHAR(50),
    "user_agent" TEXT,
    "subject" VARCHAR(500) NOT NULL,
    "message" TEXT NOT NULL,
    "image_url" TEXT,
    "status" "ticket_status" NOT NULL DEFAULT 'OPEN',
    "priority" "ticket_priority" NOT NULL DEFAULT 'NORMAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_responses" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_admin_users" (
    "id" SERIAL NOT NULL,
    "chatbot_id" INTEGER NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255),
    "email" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_admin_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "session_token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_admin_users_username_key" ON "chatbot_admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_admin_sessions_session_token_key" ON "chatbot_admin_sessions"("session_token");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_faqs" ADD CONSTRAINT "chatbot_faqs_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_products" ADD CONSTRAINT "chatbot_products_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_options" ADD CONSTRAINT "chatbot_options_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_responses" ADD CONSTRAINT "ticket_responses_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_admin_users" ADD CONSTRAINT "chatbot_admin_users_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_admin_sessions" ADD CONSTRAINT "chatbot_admin_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "chatbot_admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
