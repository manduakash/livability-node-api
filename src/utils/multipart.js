import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      return resolve({ fields: req.body || {}, files: {} });
    }

    const match = contentType.match(/boundary=(.+)/);
    if (!match) {
      return reject(new Error("Multipart boundary not found"));
    }

    const boundary = "--" + match[1];
    const boundaryBytes = Buffer.from(boundary);
    const bodyBuffers = [];

    req.on("data", (chunk) => {
      bodyBuffers.push(chunk);
    });

    req.on("end", () => {
      try {
        const buffer = Buffer.concat(bodyBuffers);
        const parts = splitBuffer(buffer, boundaryBytes);
        const fields = {};
        const files = {};

        for (const part of parts) {
          if (part.length === 0) continue;

          // Find the header-body boundary in the part (double CRLF)
          const headerEndIndex = part.indexOf("\r\n\r\n");
          if (headerEndIndex === -1) continue;

          const headersHeader = part.slice(0, headerEndIndex).toString("latin1");
          let partBody = part.slice(headerEndIndex + 4);

          // Strip trailing CRLF from part body
          if (partBody.length >= 2 && partBody[partBody.length - 2] === 0x0d && partBody[partBody.length - 1] === 0x0a) {
            partBody = partBody.slice(0, -2);
          }

          const nameMatch = headersHeader.match(/name="([^"]+)"/);
          if (!nameMatch) continue;
          const fieldName = nameMatch[1];

          const filenameMatch = headersHeader.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            const originalName = filenameMatch[1];
            if (!originalName) continue; // Skip empty files

            // Generate unique filename
            const ext = path.extname(originalName);
            const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
            const filepath = path.join(UPLOAD_DIR, uniqueName);

            fs.writeFileSync(filepath, partBody);

            const fileData = {
              fieldName,
              originalName,
              filename: uniqueName,
              filepath,
              path: `uploads/${uniqueName}`, // relative path
              size: partBody.length,
            };

            // Support arrays of files (e.g. current_project_views[0][project_image_file] or current_project_views[][project_image_file])
            if (fieldName.includes("[")) {
              // Parse field name into array-like structure
              // e.g. current_project_views[0][project_image_file]
              const baseName = fieldName.split("[")[0];
              if (!files[baseName]) files[baseName] = [];
              
              // We'll also store it flat for easy direct lookup
              files[fieldName] = fileData;
            } else {
              files[fieldName] = fileData;
            }
          } else {
            // Text field
            const valueStr = partBody.toString("utf8");
            setNestedField(fields, fieldName, valueStr);
          }
        }

        resolve({ fields, files });
      } catch (err) {
        reject(err);
      }
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

function splitBuffer(buffer, separator) {
  const parts = [];
  let index = 0;
  while (true) {
    const nextIndex = buffer.indexOf(separator, index);
    if (nextIndex === -1) {
      parts.push(buffer.slice(index));
      break;
    }
    parts.push(buffer.slice(index, nextIndex));
    index = nextIndex + separator.length;
  }
  return parts;
}

// Utility to set nested properties or arrays in form fields (e.g. construction_phase_conditions[0][category])
function setNestedField(obj, pathStr, value) {
  // If it's a JSON string, try to parse it
  if (value.startsWith("[") || value.startsWith("{")) {
    try {
      obj[pathStr] = JSON.parse(value);
      return;
    } catch (e) {
      // If parsing fails, fall back to setting the string value
    }
  }

  // Parse pathStr like "construction_phase_conditions[0][category]" or just "field_name"
  const tokens = pathStr.split(/[\[\]]+/).filter(Boolean);
  if (tokens.length === 1) {
    obj[pathStr] = value;
    return;
  }

  let current = obj;
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];
    
    // Check if next token is a number (array index)
    const isNextNumber = !isNaN(Number(nextToken));
    
    if (!current[token]) {
      current[token] = isNextNumber ? [] : {};
    }
    current = current[token];
  }
  
  const lastToken = tokens[tokens.length - 1];
  current[lastToken] = value;
}

export async function multipartMiddleware(req, res, next) {
  try {
    const { fields, files } = await parseMultipart(req);
    req.body = { ...req.body, ...fields };
    req.files = files;
    next();
  } catch (err) {
    next(err);
  }
}
