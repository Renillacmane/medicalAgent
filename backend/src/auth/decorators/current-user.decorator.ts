import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../schemas/user.schema';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | User[keyof User] | null => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;
    if (!user) {
      return null;
    }
    if (data) {
      return user[data];
    }
    return user;
  },
);
