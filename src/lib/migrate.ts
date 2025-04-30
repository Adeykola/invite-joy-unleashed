
import { supabase } from "./supabase";

// Run this migration to update the events table to include meta field
export const migrateEvents = async () => {
  try {
    // Check if meta column exists
    const { data: columns, error: columnError } = await supabase.rpc(
      "get_column_info", 
      { 
        p_table_name: 'events',
        p_column_name: 'meta' 
      }
    );
    
    if (columnError) {
      console.error("Error checking meta column:", columnError);
      return false;
    }
    
    if (!columns || columns.length === 0) {
      // Add meta column to events table if it doesn't exist
      const { error } = await supabase.rpc(
        "add_column_if_not_exists", 
        {
          p_table_name: 'events',
          p_column_name: 'meta',
          p_data_type: 'jsonb'
        }
      );
      
      if (error) {
        console.error("Error adding meta column:", error);
        return false;
      }
      
      console.log("Added meta column to events table");
      
      // Initialize existing records with empty meta data
      const { error: updateError } = await supabase.rpc(
        "execute_sql",
        {
          p_sql: "UPDATE public.events SET meta = '{}'::jsonb WHERE meta IS NULL"
        }
      );
      
      if (updateError) {
        console.error("Error initializing meta data:", updateError);
        return false;
      }
      
      return true;
    }
    
    console.log("Meta column already exists");
    return true;
  } catch (error) {
    console.error("Migration error:", error);
    return false;
  }
};
