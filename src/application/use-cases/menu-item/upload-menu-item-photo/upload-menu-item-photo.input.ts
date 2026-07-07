export interface UploadMenuItemPhotoInput{
    menuItemId: string;
    ownerId: string;
    fileName: string;
    fileType: string;
    fileBuffer: Buffer;
}