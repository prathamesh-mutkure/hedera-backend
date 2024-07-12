import { Controller, Get } from '@nestjs/common';
import { StellarService } from './stellar.service';

@Controller('stellar')
export class StellarController {
  constructor(private readonly stellarService: StellarService) {}

  @Get('test')
  async test() {
    return this.stellarService.transferFunds({
      destinationAccount:
        'GAKK3J2FUPRA7JM3GVZWG7VUZGQ5FERXWXVNWHSZ2OIT57J3IR2B4WH2',
    });
  }
}
