import { CreateProductUseCase } from "../create_product_use_case";
import { Product } from '../../../domain/models';
import { Category } from '../../../../categories/domain/models/category';
import { CreateProductPort, GetProductPort } from '../../../domain/gateways';
import { GetCategoryByIdPort } from '../../../../categories/domain/gateways/get_category_by_id_port';

describe('CreateProductUseCase', () => {
  let createProductUseCase: CreateProductUseCase;
  let mockCreateProductGateway: jest.Mocked<CreateProductPort>;
  let mockGetProductGateway: jest.Mocked<GetProductPort>;
  let mockGetCategoryByIdGateway: jest.Mocked<GetCategoryByIdPort>;

  beforeEach(() => {
    mockCreateProductGateway = {
      Execute: jest.fn(),
    };
    mockGetProductGateway = {
      Execute: jest.fn(),
    };
    mockGetCategoryByIdGateway = {
      Execute: jest.fn(),
    };

    // Instantiate the use case with mocked gateways
    createProductUseCase = new CreateProductUseCase(
      mockCreateProductGateway,
      mockGetProductGateway,
      mockGetCategoryByIdGateway
    );
  });

  const product = new Product(
    'Test Product',
    'Test Description',
    1,
    1
  );

  describe('CreateProductUseCase', () => {
    const listeners = {
      onSuccess: jest.fn(),
      onExists: jest.fn(),
      onInvalid: jest.fn(),
    };

    it('should call onInvalid if the product is invalid', async () => {
      const invalidProduct = new Product('', '', 0, 0); // Invalid product
      await createProductUseCase.execute(invalidProduct, listeners);

      expect(listeners.onInvalid).toHaveBeenCalled();
      expect(listeners.onExists).not.toHaveBeenCalled();
      expect(listeners.onSuccess).not.toHaveBeenCalled();
    });

    it('should call onExists if the product already exists', async () => {
      mockGetProductGateway.Execute.mockResolvedValue(product); // Product exists
      await createProductUseCase.execute(product, listeners);

      expect(listeners.onExists).toHaveBeenCalledWith(product);
      expect(listeners.onInvalid).not.toHaveBeenCalled();
      expect(listeners.onSuccess).not.toHaveBeenCalled();
    });

    it('should call onInvalid if the category is invalid', async () => {
      mockGetProductGateway.Execute.mockResolvedValue(undefined); // Product doesn't exist
      mockGetCategoryByIdGateway.Execute.mockResolvedValue(undefined); // Invalid category
      await createProductUseCase.execute(product, listeners);

      expect(listeners.onInvalid).toHaveBeenCalled();
      expect(listeners.onExists).not.toHaveBeenCalled();
      expect(listeners.onSuccess).not.toHaveBeenCalled();
    });

    it('should call onSuccess if the product is created successfully', async () => {
      const category = new Category(1, 'Test Category');
      mockGetProductGateway.Execute.mockResolvedValue(undefined); // Product doesn't exist
      mockGetCategoryByIdGateway.Execute.mockResolvedValue(category); // Valid category
      mockCreateProductGateway.Execute.mockResolvedValue(product); // Product created

      await createProductUseCase.execute(product, listeners);

      expect(listeners.onSuccess).toHaveBeenCalledWith(product);
      expect(listeners.onExists).not.toHaveBeenCalled();
      expect(listeners.onInvalid).not.toHaveBeenCalled();
    });
  });
});
