import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import { z as zod } from "zod";

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Documents ===
  app.get(api.documents.list.path, async (req, res) => {
    const docs = await storage.getDocuments();
    res.json(docs);
  });

  app.get(api.documents.get.path, async (req, res) => {
    const doc = await storage.getDocument(Number(req.params.id));
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(doc);
  });

  app.post(api.documents.upload.path, upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      // Basic text extraction (For MVP we support TXT, simple parsing)
      // TODO: Add proper PDF/DOCX parsing libraries in next iteration
      let content = '';
      const buffer = req.file.buffer;
      const mimetype = req.file.mimetype;

      if (mimetype === 'text/plain') {
        content = buffer.toString('utf-8');
      } else {
        // Fallback or placeholder for other types until parsing libs added
        content = buffer.toString('utf-8'); 
        // Real implementation will need pdf-parse or similar
      }

      // Clean up content: normalize whitespace
      content = content.replace(/\s+/g, ' ').trim();
      
      const wordCount = content.split(' ').length;

      const doc = await storage.createDocument({
        title: req.file.originalname,
        originalFilename: req.file.originalname,
        content,
        wordCount,
      });

      res.status(201).json(doc);
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ message: 'Failed to process file' });
    }
  });

  app.delete(api.documents.delete.path, async (req, res) => {
    await storage.deleteDocument(Number(req.params.id));
    res.status(204).end();
  });

  app.patch(api.documents.updateProgress.path, async (req, res) => {
    try {
      const { currentWordIndex } = api.documents.updateProgress.input.parse(req.body);
      const updated = await storage.updateDocumentProgress(Number(req.params.id), currentWordIndex);
      res.json(updated);
    } catch (err) {
      if (err instanceof zod.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(404).json({ message: 'Document not found' });
    }
  });

  // === Settings ===
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch(api.settings.update.path, async (req, res) => {
    try {
      const updates = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(updates);
      res.json(settings);
    } catch (err) {
      if (err instanceof zod.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Seed data
  const existingDocs = await storage.getDocuments();
  if (existingDocs.length === 0) {
    await storage.createDocument({
      title: "Welcome to AVSR",
      originalFilename: "welcome.txt",
      content: "Welcome to Adaptive Visual Speed Reader. This is a demo document to help you get started with speed reading. The concept is simple: words are flashed one by one at a speed you control. This technique, known as Rapid Serial Visual Presentation (RSVP), eliminates the time spent on eye movements, allowing you to read much faster. Try adjusting the WPM (Words Per Minute) setting to find your comfortable pace. Happy reading!",
      wordCount: 65
    });
  }

  return httpServer;
}
