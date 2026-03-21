import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class UserController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await userService.findAll(page, limit);
      ApiResponse.paginated(res, result.data, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id as string);
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(
        req.params.id as string,
        req.body,
        req.userId!,
        req.userRole!,
      );
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.delete(req.params.id as string, req.userId!);
      ApiResponse.success(res, { message: 'Usuario eliminado' });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
