import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { PrismaService } from '../prisma.service';
import { throwRpcException } from '../common/exceptions/throw-rpc-exception';
import { PaginationAndFilterDto } from './dto/pagination-and-filter.dto';

@Injectable()
export class OrdersService {
  constructor(private prismaService: PrismaService) {}

  create(createOrderDto: CreateOrderDto) {
    return this.prismaService.order.create({
      data: createOrderDto,
    });
  }

  async findAll(paginationAndFilterDto: PaginationAndFilterDto) {
    const { page, limit, status } = paginationAndFilterDto;

    const total = await this.prismaService.order.count({ where: { status } });
    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.prismaService.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { status },
      }),
      meta: {
        page,
        limit,
        total,
        lastPage,
      },
    };
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

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;
    const order = await this.findOne(id);

    if (order?.status === status) {
      return order;
    }

    return this.prismaService.order.update({
      where: { id },
      data: { status },
    });
  }
}
