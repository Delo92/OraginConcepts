import { Client } from "@replit/object-storage";
import { Response } from "express";
import { randomUUID } from "crypto";

const replitClient = new Client();

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
    
    const { ok, error } = await replitClient.uploadFromBytes(objectPath, fileBuffer);
    
    if (!ok) {
      throw new Error(`Failed to upload file: ${error?.message || 'Unknown error'}`);
    }
    
    return `/objects/${objectPath}`;
  }

  async downloadObjectToResponse(objectPath: string, res: Response): Promise<void> {
    const cleanPath = objectPath.replace(/^\/objects\//, '');
    
    const { ok, value: data, error } = await replitClient.downloadAsBytes(cleanPath);
    
    if (!ok || !data) {
      throw new ObjectNotFoundError();
    }

    const extension = cleanPath.split('.').pop()?.toLowerCase() || '';
    const contentTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
    };
    const contentType = contentTypeMap[extension] || 'application/octet-stream';
    
    res.set({
      "Content-Type": contentType,
      "Content-Length": data[0].length.toString(),
      "Cache-Control": "public, max-age=3600",
    });
    
    res.send(data[0]);
  }

  async objectExists(objectPath: string): Promise<boolean> {
    const cleanPath = objectPath.replace(/^\/objects\//, '');
    const { ok, value: exists } = await replitClient.exists(cleanPath);
    return ok && exists === true;
  }

  async deleteObject(objectPath: string): Promise<void> {
    const cleanPath = objectPath.replace(/^\/objects\//, '');
    await replitClient.delete(cleanPath);
  }
}

export { replitClient };
