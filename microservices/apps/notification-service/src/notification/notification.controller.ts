import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('notification.send.email')
  async handleSendEmail(
    @Payload() data: { to: string; subject: string; body: string },
  ) {
    this.logger.log(`Sending email to ${data.to}`);
    return this.notificationService.sendEmail(data.to, data.subject, data.body);
  }

  @EventPattern('notification.send.welcome')
  async handleWelcomeEmail(@Payload() data: { email: string; name?: string }) {
    this.logger.log(`Sending welcome email to ${data.email}`);
    return this.notificationService.sendWelcomeEmail(data.email, data.name);
  }

  @EventPattern('notification.send.password-reset')
  async handlePasswordResetEmail(
    @Payload() data: { email: string; resetToken: string },
  ) {
    this.logger.log(`Sending password reset email to ${data.email}`);
    return this.notificationService.sendPasswordResetEmail(
      data.email,
      data.resetToken,
    );
  }
}
