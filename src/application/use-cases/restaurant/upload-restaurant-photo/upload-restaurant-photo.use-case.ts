import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { UploadRestaurantPhotoOutput } from "./upload-restaurant-photo.output.js";
import type { UploadRestaurantPhotoInput } from "./upload-restaurant-photo.input.js";
import { InvalidFileTypeError } from "@/domain/errors/invalid-file-type.error.js";
import type { StorageService } from "@/application/ports/storage-service.js";

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type UploadRestaurantPhotoResult = Either<
    ResourceNotFoundError | NotAllowedError | InvalidFileTypeError,
    UploadRestaurantPhotoOutput
>

export class UploadRestaurantPhotoUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly storageService: StorageService
    ){}

    async execute(input: UploadRestaurantPhotoInput): Promise<UploadRestaurantPhotoResult>{
        if(!ALLOWED_MIME_TYPES.includes(input.fileType)){
            return left(new InvalidFileTypeError());
        }
        
        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value !== input.ownerId){
            return left(new NotAllowedError());
        }

        if(restaurant.logoUrl){
            await this.storageService.delete(restaurant.logoUrl);
        }

        const logoUrl = await this.storageService.upload({
            fileName: input.fileName,
            fileType: input.fileType,
            fileBuffer: input.fileBuffer,
            folder: 'restaurants'
        });

        restaurant.updateLogo(logoUrl);

        await this.restaurantRepository.save(restaurant);

        return right({ logoUrl });
    }
}