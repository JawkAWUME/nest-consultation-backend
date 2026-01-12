import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  constructor(private readonly options?: { optional?: boolean }) {}

  transform(value: any) {
    if (!value && this.options?.optional) {
      return undefined;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date format: ${value}`);
    }
    return date;
  }
}
