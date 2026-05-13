export interface UploadRestaurantPhotoInput {
    restaurantId: string;
    ownerId: string;
    fileName: string;
    fileType: string;
    fileBuffer: string;
}