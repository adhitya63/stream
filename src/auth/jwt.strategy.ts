import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'streaming-secret-key',
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    const user = await this.authService.findById(payload.sub);
    console.log('Found user:', user ? 'Yes' : 'No');
    if (!user) {
      console.log('User not found for ID:', payload.sub);
      throw new UnauthorizedException();
    }
    return user;
  }
}
