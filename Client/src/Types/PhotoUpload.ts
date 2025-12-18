export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
}

export interface UploadProgress {
  percent: number;
  loaded: number;
  total?: number;
}
