import { RpcException } from '@nestjs/microservices';
import { RpcError } from './rpc-error';

export const throwRpcException = (status: number, message: string): void => {
  const error: RpcError = { status, message };
  throw new RpcException(error);
};
