# Rooty Dataset Accuracy Documentation

## Overview

Rooty uses a fixed dataset of **50 Christmas-themed Latin and Greek word roots** for the demo application. This document describes the dataset sources, validation approach, and data quality assurance process.

## Dataset Composition

### Size and Scope
- **Total Roots**: 50 roots
- **Theme**: Christmas Special (holiday, winter, celebration-related roots)
- **Languages**: Latin and Greek word roots
- **Format**: JSON seed file (`supabase/seeds/roots.seed.json`)

### Data Structure

Each root entry contains:
- `root_text`: The root word (e.g., "nativitas", "stella", "angelos")
- `origin_lang`: Language of origin ("Latin" or "Greek")
- `meaning`: English meaning/translation
- `examples`: Array of example words derived from the root
- `source_title`: Source reference title
- `source_url`: Source reference URL

## Data Sources

### Primary Sources

The dataset draws from established etymology references:

1. **Oxford Etymology Dictionary**
   - Used for Latin root definitions and historical context
   - Provides authoritative word origins

2. **Etymonline (Online Etymology Dictionary)**
   - Primary source for Greek roots
   - Provides accessible online references
   - URLs included for verification

3. **Academic Etymology References**
   - Standard classical language dictionaries
   - Validated against multiple sources for accuracy

### Source Attribution

Every root entry includes:
- `source_title`: Name of the reference source
- `source_url`: Direct link to the source (when available)

This ensures:
- **Transparency**: Users can verify information
- **Credibility**: Academic sources are cited
- **Traceability**: Data lineage is documented

## Data Quality Assurance

### Validation Process

1. **Manual Review**
   - Each root was reviewed for accuracy
   - Meanings verified against multiple sources
   - Examples checked for correct derivation

2. **Format Validation**
   - JSON structure validated
   - Required fields checked
   - Data types verified (arrays, strings, etc.)

3. **Content Validation**
   - Root text spelling verified
   - Language classification confirmed
   - Example words validated for correct etymology

### Fixed Dataset Rationale

**Why 50 Roots?**
- Sufficient for meaningful learning sessions
- Manageable for a demo application
- Allows comprehensive coverage of Christmas theme
- Provides variety without overwhelming users

**Why Christmas Theme?**
- Themed learning improves engagement
- Cohesive vocabulary set
- Clear scope for demo purposes
- Seasonal relevance for presentation

**Why Fixed Dataset?**
- Ensures consistency across sessions
- Predictable learning experience
- Easier to validate and maintain
- Suitable for class demonstration

## Data Accuracy Standards

### Meaning Accuracy
- All meanings verified against authoritative sources
- Multiple source cross-referencing
- Historical accuracy prioritized

### Example Word Accuracy
- Examples verified to actually derive from the root
- Common usage prioritized
- Educational value considered

### Language Classification
- Latin vs. Greek classification verified
- Historical language origins confirmed
- Mixed-origin words classified by primary source

## Limitations

### Scope Limitations
- Fixed at 50 roots (not expandable in demo)
- Christmas theme only (no other themes in demo)
- English meanings only (no other languages)

### Source Limitations
- Some sources may have minor variations
- Historical etymology can have scholarly debate
- Online sources may change URLs over time

## Maintenance

### Dataset Updates
- Dataset is fixed for demo purposes
- Updates require manual seed file modification
- Changes should be validated before deployment

### Source Verification
- URLs should be periodically checked
- Broken links should be updated
- New authoritative sources can be added

## Usage in Application

### Seeding Process
- Dataset loaded via `npm run db:seed`
- Seed script (`scripts/seed.mjs`) handles insertion
- All 50 roots linked to "Christmas Special" theme

### Database Storage
- Roots stored in `roots` table
- Linked to themes via `theme_roots` junction table
- Source information preserved for reference

## Verification

To verify dataset accuracy:
1. Check seed file: `supabase/seeds/roots.seed.json`
2. Review source URLs for each root
3. Cross-reference with etymology dictionaries
4. Validate examples against word derivation rules

## Contact

For questions about dataset accuracy or to report issues:
- Review source URLs in seed file
- Check database after seeding
- Verify against authoritative etymology sources

---

*Documentation created for Rooty demo application*  
*Dataset: 50 Christmas-themed Latin and Greek word roots*  
*Last updated: Debug branch implementation*

