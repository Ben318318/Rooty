#!/usr/bin/env node

/**
 * Rooty Database Seed Script
 * Created by Nelson
 *
 * This script loads sample root data into the Supabase database
 * Run with: node scripts/seed.mjs
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // or fall back to .env by passing an array if you want

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   VITE_SUPABASE_URL");
  console.error("   SUPABASE_SERVICE_ROLE_KEY");
  console.error("");
  console.error(
    "Please create a .env.local file with these values from your Supabase project."
  );
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  try {
    console.log("🌱 Starting Rooty database seed...");

    // Load seed data
    const seedDataPath = join(__dirname, "../supabase/seeds/roots.seed.json");
    const seedData = JSON.parse(readFileSync(seedDataPath, "utf8"));

    console.log(`📚 Loading ${seedData.length} root entries...`);

    // Clear existing roots (for development)
    console.log("🧹 Clearing existing roots...");
    const { error: deleteError } = await supabase
      .from("roots")
      .delete()
      .neq("id", 0); // Delete all rows

    if (deleteError) {
      console.warn("⚠️  Warning clearing existing roots:", deleteError.message);
    }

    // Insert new roots
    const { data, error } = await supabase.from("roots").insert(seedData);

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully inserted ${seedData.length} root entries!`);

    // Clear existing themes and theme_roots (for idempotency)
    console.log("🧹 Clearing existing themes and theme-root links...");
    const { error: deleteThemeRootsError } = await supabase
      .from("theme_roots")
      .delete()
      .neq("theme_id", 0);
    if (deleteThemeRootsError) {
      console.warn("⚠️  Warning clearing theme_roots:", deleteThemeRootsError.message);
    }

    const { error: deleteThemesError } = await supabase
      .from("themes")
      .delete()
      .neq("id", 0);
    if (deleteThemesError) {
      console.warn("⚠️  Warning clearing themes:", deleteThemesError.message);
    }

    // Create Christmas Special theme
    console.log("🎄 Creating Christmas Special theme...");

    const themes = [
      {
        name: "Christmas Special",
        week_start: "2024-12-01",
        description:
          "Learn Latin and Greek roots related to Christmas, winter, and celebration.",
      },
    ];

    const { data: themeData, error: themeError } = await supabase
      .from("themes")
      .insert(themes)
      .select();

    if (themeError) {
      throw themeError;
    }

    console.log(`✅ Created Christmas Special theme!`);

    // Link all roots to Christmas theme
    console.log("🔗 Linking all roots to Christmas Special theme...");

    const { data: rootsData, error: rootsQueryError } = await supabase
      .from("roots")
      .select("id, root_text");

    if (rootsQueryError) {
      throw rootsQueryError;
    }

    if (rootsData && themeData && themeData[0]) {
      const themeRoots = rootsData.map((root) => ({
        theme_id: themeData[0].id,
        root_id: root.id,
      }));

      const { error: linkError } = await supabase
        .from("theme_roots")
        .insert(themeRoots);

      if (linkError) {
        throw linkError;
      }

      console.log(`✅ Linked ${themeRoots.length} roots to Christmas Special theme!`);
    }

    // Load and seed word_roots data
    console.log("📝 Loading word roots seed data...");
    const wordRootsSeedPath = join(__dirname, "../supabase/seeds/word_roots.seed.json");
    const wordRootsSeedData = JSON.parse(readFileSync(wordRootsSeedPath, "utf8"));

    console.log(`📚 Loading ${wordRootsSeedData.length} word root entries...`);

    // Clear existing word_roots (for development)
    console.log("🧹 Clearing existing word roots...");
    const { error: deleteWordRootsError } = await supabase
      .from("word_roots")
      .delete()
      .neq("id", 0);

    if (deleteWordRootsError) {
      console.warn("⚠️  Warning clearing existing word_roots:", deleteWordRootsError.message);
    }

    // Insert word_roots
    const { data: wordRootsData, error: wordRootsError } = await supabase
      .from("word_roots")
      .insert(wordRootsSeedData)
      .select();

    if (wordRootsError) {
      throw wordRootsError;
    }

    console.log(`✅ Successfully inserted ${wordRootsSeedData.length} word root entries!`);

    // Link all word_roots to Christmas theme
    console.log("🔗 Linking all word roots to Christmas Special theme...");

    if (wordRootsData && themeData && themeData[0]) {
      const themeWordRoots = wordRootsData.map((wordRoot) => ({
        theme_id: themeData[0].id,
        word_root_id: wordRoot.id,
      }));

      // Clear existing theme_word_roots
      const { error: deleteThemeWordRootsError } = await supabase
        .from("theme_word_roots")
        .delete()
        .neq("theme_id", 0);

      if (deleteThemeWordRootsError) {
        console.warn("⚠️  Warning clearing theme_word_roots:", deleteThemeWordRootsError.message);
      }

      const { error: linkWordRootsError } = await supabase
        .from("theme_word_roots")
        .insert(themeWordRoots);

      if (linkWordRootsError) {
        throw linkWordRootsError;
      }

      console.log(`✅ Linked ${themeWordRoots.length} word roots to Christmas Special theme!`);
    }

    console.log("");
    console.log("🎉 Database seeding completed successfully!");
    console.log("");
    console.log("📊 Summary:");
    console.log(`   • ${seedData.length} Christmas-themed root entries loaded`);
    console.log(`   • ${wordRootsSeedData.length} word root entries loaded`);
    console.log(`   • ${themes.length} theme created (Christmas Special)`);
    console.log(`   • All ${seedData.length} roots linked to Christmas Special theme`);
    console.log(`   • All ${wordRootsSeedData.length} word roots linked to Christmas Special theme`);
    console.log("");
    console.log("🚀 Ready for frontend development!");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    console.error("");
    console.error("Please check:");
    console.error("1. Supabase project is running");
    console.error("2. Environment variables are correct");
    console.error("3. Database schema has been applied");
    process.exit(1);
  }
}

// Run the seed
seedDatabase();
