import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt: Date;
}
