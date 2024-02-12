import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { SetProfileDataDtoRequest } from '../requests/setProfileData.dto.request';
import { AuthGuard } from '../../auth.guard';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  @Patch('set-profile-data')
  setProfileData(@Body() setProfileDto: SetProfileDataDtoRequest) {
    console.log(typeof setProfileDto);
  }
}
