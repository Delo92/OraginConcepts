import type { Express, Request, Response } from "express";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export function registerObjectStorageRoutes(app: Express): void {
  const objectStorageService = new ObjectStorageService();

  app.post("/api/uploads/request-url", async (req: Request, res: Response) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name) {
        return res.status(400).json({
          error: "Missing required field: name",
        });
      }

      res.json({
        uploadURL: "/api/uploads/file",
        objectPath: "pending",
        useServerUpload: true,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating upload info:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.post("/api/uploads/file", async (req: Request, res: Response) => {
    try {
      const chunks: Buffer[] = [];
      
      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      req.on('end', async () => {
        try {
          const fileBuffer = Buffer.concat(chunks);
          // Decode file name (may be URI-encoded for special characters)
          const rawFileName = req.headers['x-file-name'] as string || 'upload';
          const fileName = decodeURIComponent(rawFileName);
          const contentType = req.headers['content-type'] || 'application/octet-stream';
          
          const objectPath = await objectStorageService.uploadFile(fileBuffer, fileName, contentType);
          
          res.json({
            objectPath,
            metadata: { 
              name: fileName, 
              size: fileBuffer.length, 
              contentType 
            },
          });
        } catch (error) {
          console.error("Error uploading file:", error);
          res.status(500).json({ error: "Failed to upload file" });
        }
      });

      req.on('error', (error) => {
        console.error("Request error:", error);
        res.status(500).json({ error: "Upload request failed" });
      });
    } catch (error) {
      console.error("Error in upload handler:", error);
      res.status(500).json({ error: "Failed to process upload" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req: Request, res: Response) => {
    try {
      await objectStorageService.downloadObjectToResponse(req.path, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}
