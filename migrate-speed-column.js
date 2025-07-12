const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api");

// Initialize the Convex client
const client = new ConvexHttpClient(process.env.CONVEX_URL);

async function migrateSpeedColumn() {
  console.log("Starting speed column migration...");
  
  try {
    // Get all NPCs
    console.log("Fetching all NPCs...");
    const npcs = await client.query(api.npcs.getAllNpcs);
    console.log(`Found ${npcs.length} NPCs`);
    
    // Update each NPC to add speed field (leave blank for now)
    for (const npc of npcs) {
      if (!npc.speed) {
        console.log(`Updating NPC: ${npc.name}`);
        await client.mutation(api.npcs.updateNpc, {
          id: npc._id,
          speed: undefined // Leave blank as requested
        });
      }
    }
    
    // Get all player characters
    console.log("Fetching all player characters...");
    const characters = await client.query(api.characters.getAllCharacters);
    console.log(`Found ${characters.length} player characters`);
    
    // Update each player character to add speed field (leave blank for now)
    for (const character of characters) {
      if (!character.speed) {
        console.log(`Updating player character: ${character.name}`);
        await client.mutation(api.characters.updateCharacter, {
          id: character._id,
          speed: undefined // Leave blank as requested
        });
      }
    }
    
    console.log("Migration completed successfully!");
    
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateSpeedColumn(); 