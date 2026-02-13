import { homedir } from "node:os";
import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";

console.log("Homedir:", homedir());
const configPath = join(homedir(), ".pi", "web-search.json");
console.log("Config Path:", configPath);

if (existsSync(configPath)) {
    console.log("File exists");
    try {
        const content = readFileSync(configPath, "utf-8");
        console.log("Content:", content);
        const json = JSON.parse(content);
        console.log("Parsed JSON:", json);
        console.log("geminiApiKey:", json.geminiApiKey);
        console.log("GEMINI_API_KEY:", json.GEMINI_API_KEY);
    } catch (e) {
        console.error("Error reading/parsing:", e);
    }
} else {
    console.log("File does NOT exist");
}
