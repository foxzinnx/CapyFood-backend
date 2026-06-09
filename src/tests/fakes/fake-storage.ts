import type { StorageService, UploadParams } from "@/application/ports/storage-service.js";

export class FakeStorageService implements StorageService {
    public uploads: UploadParams[] = [];
    public deletedUrls: string[] = [];
    
    async upload(params: UploadParams): Promise<string> {
        this.uploads.push(params);
        return `https://fake-storage.com/${params.folder}/${params.fileName}`
    }
    
    async delete(fileUrl: string): Promise<void> {
        this.deletedUrls.push(fileUrl);
    }

}