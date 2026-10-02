import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Provider } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface GoogleProfileDto {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Lógica híbrida de vinculación de cuentas:
   * 1. Busca por googleId (usuario federado conocido)
   * 2. Si no existe, busca por email (usuario local preexistente)
   * 3. Si existe por email, vincula el googleId
   * 4. Si no existe de ninguna forma, crea un usuario federado nuevo
   */
  async validateGoogleUser(profile: GoogleProfileDto) {
    // 1. Buscar por googleId
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      // 2. Buscar por email (por si ya existe como usuario LOCAL)
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (existingByEmail) {
        // 3. Vincular googleId al usuario local existente
        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: profile.googleId,
            firstName: existingByEmail.firstName ?? profile.firstName,
            lastName: existingByEmail.lastName ?? profile.lastName,
            picture: existingByEmail.picture ?? profile.picture,
            provider: Provider.GOOGLE,
          },
        });
      } else {
        // 4. Crear usuario federado nuevo
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            picture: profile.picture,
            googleId: profile.googleId,
            provider: Provider.GOOGLE,
          },
        });
      }
    }

    return this.signToken(user);
  }

  /**
   * Firma el JWT con el payload mínimo necesario.
   * No incluimos datos sensibles como password.
   */
  private async signToken(user: { id: string; email: string; provider: Provider }) {
    const payload = {
      sub: user.id,
      email: user.email,
      provider: user.provider,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      jwt: token,
      user: {
        id: user.id,
        email: user.email,
        provider: user.provider,
      },
    };
  }
}