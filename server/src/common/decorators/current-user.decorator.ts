import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    console.log('--- DEBUG CURRENT USER ---');
    console.log('User object in request:', user);
    // console.log('Requested data field:', data);
    return data ? user?.[data] : user;
  },
);
