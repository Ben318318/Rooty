#!/usr/bin/env node

/**
 * Rooty Database Seed Script
 * Created by Nelson
 * 
 * This script loads sample root data into the Supabase database
 * Run with: node scripts/seed.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   VITE_SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    console.error('');
    console.error('Please create a .env.local file with these values from your Supabase project.');
    process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
    try {
        console.log('🌱 Starting Rooty database seed...');
        
        // Load seed data
        const seedDataPath = join(__dirname, '../supabase/seeds/roots.seed.json');
        const seedData = JSON.parse(readFileSync(seedDataPath, 'utf8'));
        
        console.log(`📚 Loading ${seedData.length} root entries...`);
        
        // Clear existing roots (for development)
        console.log('🧹 Clearing existing roots...');
        const { error: deleteError } = await supabase
            .from('roots')
            .delete()
            .neq('id', 0); // Delete all rows
        
        if (deleteError) {
            console.warn('⚠️  Warning clearing existing roots:', deleteError.message);
        }
        
        // Insert new roots
        const { data, error } = await supabase
            .from('roots')
            .insert(seedData);
        
        if (error) {
            throw error;
        }
        
        console.log(`✅ Successfully inserted ${seedData.length} root entries!`);
        
        // Create sample themes
        console.log('📅 Creating sample themes...');
        
        const themes = [
            {
                name: 'Week 1: Nature Roots',
                week_start: '2024-01-01',
                description: 'Learn roots related to natural elements like water, earth, fire, and air.'
            },
            {
                name: 'Week 2: Human Experience',
                week_start: '2024-01-08', 
                description: 'Explore roots about emotions, knowledge, and human society.'
            },
            {
                name: 'Week 3: Science & Technology',
                week_start: '2024-01-15',
                description: 'Discover roots used in scientific and technological terms.'
            }
        ];
        
        const { data: themeData, error: themeError } = await supabase
            .from('themes')
            .insert(themes)
            .select();
        
        if (themeError) {
            throw themeError;
        }
        
        console.log(`✅ Created ${themes.length} sample themes!`);
        
        // Link some roots to themes (for demo purposes)
        console.log('🔗 Linking roots to themes...');
        
        const { data: rootsData } = await supabase
            .from('roots')
            .select('id, root_text')
            .limit(20);
        
        if (rootsData && themeData) {
            const themeRoots = [];
            
            // Link first 7 roots to Week 1 (Nature)
            for (let i = 0; i < 7 && i < rootsData.length; i++) {
                themeRoots.push({
                    theme_id: themeData[0].id,
                    root_id: rootsData[i].id
                });
            }
            
            // Link next 7 roots to Week 2 (Human Experience)
            for (let i = 7; i < 14 && i < rootsData.length; i++) {
                themeRoots.push({
                    theme_id: themeData[1].id,
                    root_id: rootsData[i].id
                });
            }
            
            // Link remaining roots to Week 3 (Science & Technology)
            for (let i = 14; i < rootsData.length; i++) {
                themeRoots.push({
                    theme_id: themeData[2].id,
                    root_id: rootsData[i].id
                });
            }
            
            const { error: linkError } = await supabase
                .from('theme_roots')
                .insert(themeRoots);
            
            if (linkError) {
                throw linkError;
            }
            
            console.log(`✅ Linked ${themeRoots.length} roots to themes!`);
        }
        
        console.log('');
        console.log('🎉 Database seeding completed successfully!');
        console.log('');
        console.log('📊 Summary:');
        console.log(`   • ${seedData.length} root entries loaded`);
        console.log(`   • ${themes.length} themes created`);
        console.log('   • Sample theme-root relationships established');
        console.log('');
        console.log('🚀 Ready for frontend development!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        console.error('');
        console.error('Please check:');
        console.error('1. Supabase project is running');
        console.error('2. Environment variables are correct');
        console.error('3. Database schema has been applied');
        process.exit(1);
    }
}

// Run the seed
seedDatabase();
