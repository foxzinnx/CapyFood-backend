import { CreateRestaurantOwnerUseCase } from "@/application/use-cases/restaurant-owner/create-restaurant-owner/create-restaurant-owner.use-case.js";
import { BcryptHasher } from "../cryptography/bcrypt-hasher.js";
import { JwtEncrypter } from "../cryptography/jwt-encrypter.js";
import { PrismaCustomerRepository } from "../database/prisma/repositories/prisma-customer.repository.js";
import { PrismaMenuItemRepository } from "../database/prisma/repositories/prisma-menu-item.repository.js";
import { PrismaOrderRepository } from "../database/prisma/repositories/prisma-order.repository.js";
import { PrismaRestaurantOwnerRepository } from "../database/prisma/repositories/prisma-restaurant-owner.repository.js";
import { PrismaRestaurantRepository } from "../database/prisma/repositories/prisma-restaurant.repository.js";
import { PrismaReviewRepository } from "../database/prisma/repositories/prisma-review.repository.js";
import { CloudinaryStorageService } from "../storage/cloudinary-storage.service.js";
import { AuthenticateRestaurantOwnerUseCase } from "@/application/use-cases/restaurant-owner/authenticate-restaurant-owner/authenticate-restaurant-owner.use-case.js";
import { CreateRestaurantUseCase } from "@/application/use-cases/restaurant/create-restaurant/create-restaurant.use-case.js";
import { GetRestaurantUseCase } from "@/application/use-cases/restaurant/get-restaurant/get-restaurant.use-case.js";
import { ListRestaurantsUseCase } from "@/application/use-cases/restaurant/list-restaurants/list-restaurants.use-case.js";
import { ToggleRestaurantStatusUseCase } from "@/application/use-cases/restaurant/toggle-restaurant-status/toggle-restaurant-status.use-case.js";
import { UpdateRestaurantHoursUseCase } from "@/application/use-cases/restaurant/update-restaurant-hours/update-restaurant-hours.use-case.js";
import { UploadRestaurantPhotoUseCase } from "@/application/use-cases/restaurant/upload-restaurant-photo/upload-restaurant-photo.use-case.js";
import { GetTopRatedRestaurantsUseCase } from "@/application/use-cases/restaurant/get-top-rated-restaurants/get-top-rated-restaurants.use-case.js";
import { CreateMenuItemUseCase } from "@/application/use-cases/menu-item/create-menu-item/create-menu-item.use-case.js";
import { UpdateMenuItemUseCase } from "@/application/use-cases/menu-item/update-menu-item/update-menu-item.use-case.js";
import { DeleteMenuItemUseCase } from "@/application/use-cases/menu-item/delete-menu-item/delete-menu-item.use-case.js";
import { ListMenuItemsUseCase } from "@/application/use-cases/menu-item/list-menu-items/list-menu-items.use-case.js";
import { UploadMenuItemPhotoUseCase } from "@/application/use-cases/menu-item/upload-menu-item-photo/upload-menu-item-photo.use-case.js";
import { GetFeaturedMenuItemsUseCase } from "@/application/use-cases/menu-item/get-featured-menu-items/get-featured-menu-items.use-case.js";
import { CreateCustomerUseCase } from "@/application/use-cases/customer/create-customer/create-customer.use-case.js";
import { AuthenticateCustomerUseCase } from "@/application/use-cases/customer/authenticate-customer/authenticate-customer.use-case.js";
import { GetCustomerProfileUseCase } from "@/application/use-cases/customer/get-customer-profile/get-customer-profile.use-case.js";
import { CreateOrderUseCase } from "@/application/use-cases/order/create-order/create-order.use-case.js";
import { ListCustomerOrdersUseCase } from "@/application/use-cases/order/list-customer-orders/list-customer-orders.use-case.js";
import { ListRestaurantOrdersUseCase } from "@/application/use-cases/order/list-restaurant-orders/list-restaurant-orders.use-case.js";
import { CreateReviewUseCase } from "@/application/use-cases/review/create-review/create-review.use-case.js";
import { UpdateReviewUseCase } from "@/application/use-cases/review/update-review/update-review.use-case.js";
import { DeleteReviewUseCase } from "@/application/use-cases/review/delete-review/delete-review.use-case.js";
import { ListRestaurantReviewsUseCase } from "@/application/use-cases/review/list-restaurant-reviews/list-restaurant-reviews.use-case.js";
import { GetOrderUseCase } from "@/application/use-cases/order/get-order/get-order.use-case.js";
import { UpdateOrderStatusUseCase } from "@/application/use-cases/order/update-order-status/update-order-status.use-case.js";
import { CancelOrderUseCase } from "@/application/use-cases/order/cancel-order/cancel-order.use-case.js";
import { GetMerchantWalletUseCase } from "@/application/use-cases/restaurant-owner/get-merchant-wallet/get-merchant-wallet.use-case.js";
import { DepositToWalletUseCase } from "@/application/use-cases/customer/deposit-to-wallet/deposit-to-wallet.use-case.js";

const ownerRepository = new PrismaRestaurantOwnerRepository();
const restaurantRepository = new PrismaRestaurantRepository();
const customerRepository = new PrismaCustomerRepository();
const menuItemRepository = new PrismaMenuItemRepository();
export const orderRepository = new PrismaOrderRepository();
const reviewRepository = new PrismaReviewRepository();

const hasher = new BcryptHasher();
const encrypter = new JwtEncrypter();
const storageService = new CloudinaryStorageService();

export const createRestaurantOwnerUseCase = new CreateRestaurantOwnerUseCase(ownerRepository, hasher);
export const authenticateRestaurantOwnerUseCase = new AuthenticateRestaurantOwnerUseCase(ownerRepository, hasher, encrypter);

export const createRestaurantUseCase = new CreateRestaurantUseCase(ownerRepository, restaurantRepository);
export const getRestaurantUseCase = new GetRestaurantUseCase(restaurantRepository);
export const listRestaurantsUseCase = new ListRestaurantsUseCase(restaurantRepository);
export const toggleRestaurantStatusUseCase = new ToggleRestaurantStatusUseCase(restaurantRepository);
export const updateRestaurantHoursUseCase = new UpdateRestaurantHoursUseCase(restaurantRepository);
export const uploadRestaurantPhotoUseCase = new UploadRestaurantPhotoUseCase(restaurantRepository, storageService);
export const getTopRatedRestaurantsUseCase = new GetTopRatedRestaurantsUseCase(restaurantRepository, reviewRepository);

export const createMenuItemUseCase = new CreateMenuItemUseCase(restaurantRepository, menuItemRepository);
export const updateMenuItemUseCase = new UpdateMenuItemUseCase(restaurantRepository, menuItemRepository);
export const deleteMenuItemUseCase = new DeleteMenuItemUseCase(restaurantRepository, menuItemRepository);
export const listMenuItemsUseCase = new ListMenuItemsUseCase(restaurantRepository, menuItemRepository);
export const uploadMenuItemPhotoUseCase = new UploadMenuItemPhotoUseCase(restaurantRepository, menuItemRepository, storageService);
export const getFeaturedMenuItemsUseCase = new GetFeaturedMenuItemsUseCase(menuItemRepository);

export const createCustomerUseCase = new CreateCustomerUseCase(customerRepository, hasher);
export const authenticateCustomerUseCase = new AuthenticateCustomerUseCase(customerRepository, hasher, encrypter);
export const getCustomerProfileUseCase = new GetCustomerProfileUseCase(customerRepository);

export const createOrderUseCase = new CreateOrderUseCase(customerRepository, restaurantRepository, menuItemRepository, orderRepository, ownerRepository);
export const getOrderUseCase = new GetOrderUseCase(orderRepository, restaurantRepository);
export const listCustomerOrdersUseCase = new ListCustomerOrdersUseCase(customerRepository, orderRepository);
export const listRestaurantOrdersUseCase = new ListRestaurantOrdersUseCase(restaurantRepository, orderRepository);
export const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository, restaurantRepository);
export const cancelOrderUseCase = new CancelOrderUseCase(orderRepository);

export const createReviewUseCase = new CreateReviewUseCase(customerRepository, restaurantRepository, reviewRepository);
export const updateReviewUseCase = new UpdateReviewUseCase(reviewRepository);
export const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository);
export const listRestaurantReviewsUseCase = new ListRestaurantReviewsUseCase(restaurantRepository, reviewRepository);

export const depositToWalletUseCase = new DepositToWalletUseCase(customerRepository);
export const getMerchantWalletUseCase = new GetMerchantWalletUseCase(ownerRepository);

export { storageService }