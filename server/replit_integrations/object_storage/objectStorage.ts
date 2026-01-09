import { Response } from "express";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

const isReplit = !!process.env.REPL_ID;
let replitClient: any = null;

if (isReplit) {
  import("@replit/object-storage").then(({ Client }) => {
    replitClient = new Client();
  });
}

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!isReplit && !fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  async uploadFile(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const objectId = randomUUID();
    const extension = fileName.split('.').pop() || '';
    const objectPath = `uploads/${objectId}.${extension}`;

    if (isReplit && replitClient) {
      const { ok, error } = await replitClient.uploadFromBytes(objectPath, fileBuffer);
      if (!ok) {
        throw new Error(`Failed to upload file: ${error?.message || 'Unknown error'}`);
      }
      return `/objects/${objectPath}`;
    } else {
      const localPath = path.join(LOCAL_UPLOAD_DIR, `${objectId}.${extension}`);
      fs.writeFileSync(localPath, fileBuffer);
      return `/uploads/${objectId}.${extension}`;
    }
  }

  async downloadObjectToResponse(objectPath: string, res: Response): Promise<void> {
    const extension = objectPath.split('.').pop()?.toLowerCase() || '';
    const contentTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
    };
    const contentType = contentTypeMap[extension] || 'application/octet-stream';

    if (isReplit && replitClient) {
      const cleanPath = objectPath.replace(/^\/objects\//, '');
      const { ok, value: data, error } = await replitClient.downloadAsBytes(cleanPath);
      
      if (!ok || !data) {
        throw new ObjectNotFoundError();
      }

      res.set({
        "Content-Type": contentType,
        "Content-Length": data[0].length.toString(),
        "Cache-Control": "public, max-age=3600",
      });
      
      res.send(data[0]);
    } else {
      const cleanPath = objectPath.replace(/^\/uploads\//, '');
      const localPath = path.join(LOCAL_UPLOAD_DIR, cleanPath);
      
      if (!fs.existsSync(localPath)) {
        throw new ObjectNotFoundError();
      }

      const data = fs.readFileSync(localPath);
      res.set({
        "Content-Type": contentType,
        "Content-Length": data.length.toString(),
        "Cache-Control": "public, max-age=3600",
      });
      
      res.send(data);
    }
  }

  async objectExists(objectPath: string): Promise<boolean> {
    if (isReplit && replitClient) {
      const cleanPath = objectPath.replace(/^\/objects\//, '');
      const { ok, value: exists } = await replitClient.exists(cleanPath);
      return ok && exists === true;
    } else {
      const cleanPath = objectPath.replace(/^\/uploads\//, '');
      const localPath = path.join(LOCAL_UPLOAD_DIR, cleanPath);
      return fs.existsSync(localPath);
    }
  }

  async deleteObject(objectPath: string): Promise<void> {
    if (isReplit && replitClient) {
      const cleanPath = objectPath.replace(/^\/objects\//, '');
      await replitClient.delete(cleanPath);
    } else {
      const cleanPath = objectPath.replace(/^\/uploads\//, '');
      const localPath = path.join(LOCAL_UPLOAD_DIR, cleanPath);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
  }
}

export { replitClient };
