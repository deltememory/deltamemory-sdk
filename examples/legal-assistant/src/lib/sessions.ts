export interface Session {
  id: string;
  name: string;
  collection: string;
  documents: DocumentInfo[];
  createdAt: Date;
}

export interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  chunks?: number;
  uploadedAt?: Date;
}

export interface UploadProgress {
  status: "parsing" | "ingesting" | "complete" | "error";
  progress: number;
  total: number;
  message: string;
  error?: string;
}
