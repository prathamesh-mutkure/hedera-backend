import { Controller, Get } from '@nestjs/common';
import { StellarService } from './stellar.service';

@Controller('stellar')
export class StellarController {
  constructor(private readonly stellarService: StellarService) {}

  @Get('test')
  async test() {
    return this.stellarService.test();
  }
}
