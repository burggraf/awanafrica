import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_PATH = join(homedir(), ".pi", "web-search.json");
console.log("Config Path:", CONFIG_PATH);
console.log("File exists:", existsSync(CONFIG_PATH));

if (existsSync(CONFIG_PATH)) {
    const content = readFileSync(CONFIG_PATH, "utf-8");
    console.log("File content:", content);
    try {
        const json = JSON.parse(content);
        console.log("Parsed JSON:", JSON.stringify(json, null, 2));
        console.log("geminiApiKey value:", json.geminiApiKey);
    } catch (e) {
        console.error("JSON parse error:", e);
    }
}
