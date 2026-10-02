import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * GET /auth/google
   * Inicia el flujo OAuth: redirige al usuario a la pantalla de Google.
   * El AuthGuard('google') se encarga de la redirección automáticamente.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Este método nunca se ejecuta: el guard redirige antes.
    // Es solo un "punto de entrada" que dispara el flujo.
  }

  /**
   * GET /auth/google/redirect
   * Callback al que Google redirige al usuario después de autenticarse.
   * Passport pone el resultado de GoogleStrategy.validate() en req.user.
   */
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const { jwt } = req.user as { jwt: string };
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    // Redirige al frontend con el token en la query string
    return res.redirect(`${frontendUrl}/login-success?token=${jwt}`);
  }

  /**
   * GET /auth/me
   * Ruta privada de ejemplo. Requiere JWT válido en el header Authorization.
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: Request) {
    return req.user;
  }
}