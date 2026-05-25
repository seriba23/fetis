import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('gallery')
  gallery(@Query('category') category?: string, @Query('limit') limit?: string) {
    return this.publicService.getGallery(category, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('gallery-categories')
  categories() {
    return this.publicService.getCategories();
  }

  @Get('furniture-types')
  furnitureTypes() {
    return this.publicService.getFurnitureTypes();
  }

  @Get('business')
  business() {
    return this.publicService.getBusinessInfo();
  }

  @Post('contact')
  contact(@Body() dto: CreateContactRequestDto) {
    return this.publicService.submitContactRequest(dto);
  }
}
