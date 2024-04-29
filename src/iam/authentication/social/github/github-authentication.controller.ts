import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { successResponse } from 'src/common/utils/apiResponse';
import { GithubSignInDto } from '../../dto/github-sign-in.dto.js';
import { GithubAuthenticationService } from './github-authentication.service.js';

@Controller('auth/github')
export class GithubAuthenticationController {
  constructor(
    private readonly githubAuthService: GithubAuthenticationService,
  ) {}

  @Get('/')
  generateUrl(@Res({ passthrough: true }) res: Response) {
    const url = this.githubAuthService.generateWebAuthorizationUri();

    //res.redirect(url);
    return { status: 'success', data: url };
    return successResponse(url);
  }

  @Post('/')
  async test(@Body() body: GithubSignInDto) {
    const data = await this.githubAuthService.getUser(body);
    console.log(data);
    return 'ok';
  }
}
