import { InvalidFileTypeError } from "@/domain/errors/invalid-file-type.error.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { MenuItemRepository } from "@/domain/repositories/menu-item.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { UploadMenuItemPhotoOutput } from "./update-menu-item-photo.output.js";
import type { UploadMenuItemPhotoInput } from "./update-menu-item-photo.input.js";
import type { StorageService } from "@/application/ports/storage-service.js";

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type UpdateMenuItemPhotoResult = Either<
    ResourceNotFoundError | NotAllowedError | InvalidFileTypeError,
    UploadMenuItemPhotoOutput
>

export class UploadMenuItemPhotoUseCase {
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuItemRepository: MenuItemRepository,
        private readonly storageService: StorageService
    ){}

    async execute(input: UploadMenuItemPhotoInput): Promise<UpdateMenuItemPhotoResult> {
        if(!ALLOWED_MIME_TYPES.includes(input.fileType)){
            return left(new InvalidFileTypeError());
        }

        const menuItem = await this.menuItemRepository.findMenuItemById(input.menuItemId);
        if(!menuItem){
            return left(new ResourceNotFoundError('Menu item'));
        }

        const restaurant = await this.restaurantRepository.findByMenuId(menuItem.menuId.value);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value !== input.ownerId){
            return left(new NotAllowedError());
        }

        if(menuItem.imageUrl){
            await this.storageService.delete(menuItem.imageUrl);
        }

        const imageUrl = await this.storageService.upload({
            fileName: input.fileName,
            fileType: input.fileType,
            fileBuffer: input.fileBuffer,
            folder: 'menu-items'
        });

        menuItem.updateImage(imageUrl);

        await this.menuItemRepository.saveMenuItem(menuItem);

        return right({ imageUrl });
    }
}