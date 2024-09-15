import path from "path";

// Function to parse stack trace
export const parseStack = (stack: string) => {
  const lines = stack.split("\n");
  const errorLine = lines[0];
  const stackLine = lines[1];
  const match = stackLine.match(/\((.+):(\d+):(\d+)\)$/);
  if (match) {
    return {
      errorMessage: errorLine.split(": ")[1],
      fileName: path.basename(match[1]),
      absoluteFilePath: match[1],
      lineNumber: match[2],
    };
  }
  return null;
};
