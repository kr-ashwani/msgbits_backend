import * as fs from "fs";
import * as path from "path";

// TypeScript-friendly way to get the current directory
const currentDir = __dirname;

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
  }
}

function copyFile(src: string, dest: string): void {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// Copy views directory
const viewsSrc = path.join(currentDir, "..", "views");
const viewsDest = path.join(currentDir, "..", "build", "views");
copyDir(viewsSrc, viewsDest);
console.log("Views directory copied successfully");

console.log("All files copied successfully");
