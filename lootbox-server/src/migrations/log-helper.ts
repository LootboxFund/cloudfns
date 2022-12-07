const fs = require("fs");

export function logWrite(filePath, consoleLog, text) {
  // Create the folder if it doesn't exist
  const folderPath = filePath.substring(0, filePath.lastIndexOf("/"));
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  if (consoleLog) {
    console.log(text);
  }
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Append the text to the file
    fs.appendFileSync(filePath, text);
  } else {
    // Write the text to the file
    fs.writeFileSync(filePath, text);
  }
}
