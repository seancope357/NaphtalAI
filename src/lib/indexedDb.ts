const DB_NAME = "naphtalai-db";
const DB_VERSION = 1;
const FILES_STORE = "files";
const CANVAS_STORE = "canvas";

export interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string | ArrayBuffer;
  thumbnail?: string;
  uploadedAt: Date;
}

export interface StoredCanvas {
  id: string;
  name: string;
  nodes: string;
  edges: string;
  savedAt: Date;
}

let dbInstance: IDBDatabase | null = null;

// Initialize the database
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create files store
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        const fileStore = db.createObjectStore(FILES_STORE, { keyPath: "id" });
        fileStore.createIndex("name", "name", { unique: false });
        fileStore.createIndex("type", "type", { unique: false });
      }
      
      // Create canvas store
      if (!db.objectStoreNames.contains(CANVAS_STORE)) {
        const canvasStore = db.createObjectStore(CANVAS_STORE, { keyPath: "id" });
        canvasStore.createIndex("name", "name", { unique: false });
      }
    };
  });
}

// File Operations
export async function saveFile(file: StoredFile): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FILES_STORE], "readwrite");
    const store = transaction.objectStore(FILES_STORE);
    const request = store.put(file);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to save file"));
  });
}

export async function getFile(id: string): Promise<StoredFile | undefined> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FILES_STORE], "readonly");
    const store = transaction.objectStore(FILES_STORE);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Failed to get file"));
  });
}

export async function getAllFiles(): Promise<StoredFile[]> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FILES_STORE], "readonly");
    const store = transaction.objectStore(FILES_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Failed to get files"));
  });
}

export async function deleteFile(id: string): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FILES_STORE], "readwrite");
    const store = transaction.objectStore(FILES_STORE);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to delete file"));
  });
}

// Canvas Operations
export async function saveCanvas(id: string, name: string, nodes: string, edges: string): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CANVAS_STORE], "readwrite");
    const store = transaction.objectStore(CANVAS_STORE);
    const request = store.put({
      id,
      name,
      nodes,
      edges,
      savedAt: new Date(),
    });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to save canvas"));
  });
}

export async function getCanvas(id: string): Promise<StoredCanvas | undefined> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CANVAS_STORE], "readonly");
    const store = transaction.objectStore(CANVAS_STORE);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Failed to get canvas"));
  });
}

export async function getAllCanvases(): Promise<StoredCanvas[]> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CANVAS_STORE], "readonly");
    const store = transaction.objectStore(CANVAS_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Failed to get canvases"));
  });
}

export async function deleteCanvas(id: string): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CANVAS_STORE], "readwrite");
    const store = transaction.objectStore(CANVAS_STORE);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to delete canvas"));
  });
}

// Helper to read file content
export async function readFileContent(file: File): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    // Images are stored as data URLs for immediate rendering.
    if (file.type.startsWith("image/")) {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
      return;
    }

    // PDFs are stored as binary for scalable canvas and viewer rendering.
    if (file.type === "application/pdf") {
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
      return;
    } else {
      // Text-based formats remain plain text for analysis prompts.
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    }
  });
}

// Helper to create thumbnail for images
export async function createThumbnail(file: File, maxSize: number = 200): Promise<string | undefined> {
  if (!file.type.startsWith("image/")) {
    return undefined;
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => reject(new Error("Failed to create thumbnail"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
