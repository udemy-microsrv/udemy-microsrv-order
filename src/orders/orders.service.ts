import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { PrismaService } from '../prisma.service';
import { throwRpcException } from '../common/exceptions/throw-rpc-exception';

@Injectable()
export class OrdersService {
  constructor(private prismaService: PrismaService) {}

  create(createOrderDto: CreateOrderDto) {
    return this.prismaService.order.create({
      data: createOrderDto,
    });
  }

  findAll() {
    return `This action returns all orders`;
  }

  async findOne(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
    });

    if (!order) {
      throwRpcException(HttpStatus.NOT_FOUND, 'Order not found.');
    }

    return order;
  }

  changeStatus(id: string, changeOrderStatusDto: ChangeOrderStatusDto) {
    return `This action updates a #${id} order`;
  }
}
