import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.register')
  async register(@Payload() data: { email: string; password: string; name?: string }) {
    return this.userService.create(data);
  }

  @MessagePattern('user.validate')
  async validate(@Payload() data: { email: string; password: string }) {
    return this.userService.validateUser(data.email, data.password);
  }

  @MessagePattern('user.find')
  async find(@Payload() data: { id: string }) {
    return this.userService.findById(data.id);
  }

  @MessagePattern('user.update')
  async update(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...updateData } = data;
    return this.userService.update(id, updateData);
  }
}
