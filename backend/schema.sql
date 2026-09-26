-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_product_id INT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product Options Table
CREATE TABLE product_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    store_option_id TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, store_option_id)
);

-- Tracked Items Table
CREATE TABLE tracked_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_option_id UUID REFERENCES product_options(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Scrape History Table
CREATE TYPE scrape_outcome AS ENUM ('success', 'retried', 'failed');

CREATE TABLE scrape_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracked_item_id UUID REFERENCES tracked_items(id) ON DELETE CASCADE,
    price NUMERIC,
    stock TEXT,
    outcome scrape_outcome NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
