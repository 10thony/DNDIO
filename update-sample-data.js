import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the characters.ts file
const filePath = path.join(__dirname, 'convex', 'characters.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Function to add speed field to character data
function addSpeedToCharacter(charData) {
  // Find the line with "proficiencyBonus": 2, and add speed after it
  const lines = charData.split('\n');
  const updatedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    updatedLines.push(line);
    
    // If this line contains "proficiencyBonus": 2, add speed on the next line
    if (line.includes('"proficiencyBonus": 2,')) {
      updatedLines.push('          "speed": "30 ft",');
    }
  }
  
  return updatedLines.join('\n');
}

// Update the importPlayerData function
const importPlayerDataStart = content.indexOf('export const importPlayerData = mutation({');
const importPlayerDataEnd = content.indexOf('export const importPlayerAndNPCData = mutation({');
const importPlayerDataSection = content.substring(importPlayerDataStart, importPlayerDataEnd);

const updatedImportPlayerData = addSpeedToCharacter(importPlayerDataSection);

// Update the importPlayerAndNPCData function
const importPlayerAndNPCDataStart = content.indexOf('export const importPlayerAndNPCData = mutation({');
const importPlayerAndNPCDataEnd = content.indexOf('});', importPlayerAndNPCDataStart) + 3;
const importPlayerAndNPCDataSection = content.substring(importPlayerAndNPCDataStart, importPlayerAndNPCDataEnd);

const updatedImportPlayerAndNPCData = addSpeedToCharacter(importPlayerAndNPCDataSection);

// Replace the sections in the content
content = content.replace(importPlayerDataSection, updatedImportPlayerData);
content = content.replace(importPlayerAndNPCDataSection, updatedImportPlayerAndNPCData);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('Sample data updated successfully!'); 