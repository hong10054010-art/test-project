// Migration endpoint to update database schema
// This adds new columns to existing tables if they don't exist
export async function onRequestPost({ env }) {
  const migrations = [];
  const errors = [];

  try {
    // Check if columns exist and add them if they don't
    // SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we need to check first
    
    // Check and add user_name column
    try {
      await env.DB.prepare("SELECT user_name FROM raw_feedback LIMIT 1").first();
    } catch (e) {
      try {
        await env.DB.prepare("ALTER TABLE raw_feedback ADD COLUMN user_name TEXT").run();
        migrations.push("Added user_name column to raw_feedback");
      } catch (err) {
        errors.push(`Failed to add user_name: ${err.message}`);
      }
    }

    // Check and add rating column
    try {
      await env.DB.prepare("SELECT rating FROM raw_feedback LIMIT 1").first();
    } catch (e) {
      try {
        await env.DB.prepare("ALTER TABLE raw_feedback ADD COLUMN rating INTEGER").run();
        migrations.push("Added rating column to raw_feedback");
      } catch (err) {
        errors.push(`Failed to add rating: ${err.message}`);
      }
    }

    // Check and add category column
    try {
      await env.DB.prepare("SELECT category FROM raw_feedback LIMIT 1").first();
    } catch (e) {
      try {
        await env.DB.prepare("ALTER TABLE raw_feedback ADD COLUMN category TEXT").run();
        migrations.push("Added category column to raw_feedback");
      } catch (err) {
        errors.push(`Failed to add category: ${err.message}`);
      }
    }

    // Check and add tags column
    try {
      await env.DB.prepare("SELECT tags FROM raw_feedback LIMIT 1").first();
    } catch (e) {
      try {
        await env.DB.prepare("ALTER TABLE raw_feedback ADD COLUMN tags TEXT").run();
        migrations.push("Added tags column to raw_feedback");
      } catch (err) {
        errors.push(`Failed to add tags: ${err.message}`);
      }
    }

    // Check and add verified column
    try {
      await env.DB.prepare("SELECT verified FROM raw_feedback LIMIT 1").first();
    } catch (e) {
      try {
        await env.DB.prepare("ALTER TABLE raw_feedback ADD COLUMN verified INTEGER DEFAULT 0").run();
        migrations.push("Added verified column to raw_feedback");
      } catch (err) {
        errors.push(`Failed to add verified: ${err.message}`);
      }
    }

    return Response.json({
      ok: true,
      migrations,
      errors: errors.length > 0 ? errors : undefined,
      message: migrations.length > 0 
        ? `Successfully applied ${migrations.length} migration(s)`
        : "Database schema is already up to date"
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error.message,
      migrations,
      errors
    }, { status: 500 });
  }
}
