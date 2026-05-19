export interface UploadParams {
    fileName: string;
    fileType: string;
    fileBuffer: Buffer;
    folder: string;
}

export interface StorageService {
    upload(params: UploadParams): Promise<string>;
    delete(fileUrl: string): Promise<void>;
}