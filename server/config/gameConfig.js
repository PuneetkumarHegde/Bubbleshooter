import dotenv from 'dotenv';
dotenv.config();

// Centralized Backend Game Configuration
export const GAME_NAME = process.env.GAME_NAME || 'BUBBLE BLAST ADVENTURE';
export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bubble_blast_adventure';
export const JWT_SECRET = process.env.JWT_SECRET || 'bubble_blast_adventure_jwt_secret_key_prod_2026';
export const NODE_ENV = process.env.NODE_ENV || 'development';
