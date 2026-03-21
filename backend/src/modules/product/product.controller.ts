import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class ProductController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body, req.userId!);
      ApiResponse.success(res, product, 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.findAll({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        sortBy: req.query.sortBy as string,
        order: req.query.order as 'asc' | 'desc',
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        search: req.query.search as string,
      });
      ApiResponse.paginated(res, result.data, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.findById(req.params.id as string);
      ApiResponse.success(res, product);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(
        req.params.id as string,
        req.body,
        req.userId!,
        req.userRole!,
      );
      ApiResponse.success(res, product);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.delete(req.params.id as string, req.userId!, req.userRole!);
      ApiResponse.success(res, { message: 'Producto eliminado' });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
