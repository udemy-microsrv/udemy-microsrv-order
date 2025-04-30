import { RpcException } from '@nestjs/microservices';
import { RpcError } from './rpc-error';

export const createRpcException = (
  status: number,
  message: string,
): RpcException => {
  const error: RpcError = { status, message };
  return new RpcException(error);
};
