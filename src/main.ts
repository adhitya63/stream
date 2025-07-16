import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get allowed origins from environment or use defaults
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080', 'http://localhost:9090'];
  
  // Enable CORS for development
  app.enableCors({
    origin: [...allowedOrigins, 'file://'], // Include file:// for local testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Streaming server is running on: http://localhost:${port}/api`);
  console.log(`📡 WebSocket gateway is available on: ws://localhost:${port}`);
  console.log(`📺 RTMP server is running on: rtmp://localhost:1935`);
  console.log(`🎥 HLS server is running on: http://localhost:8002`);
}
bootstrap();
