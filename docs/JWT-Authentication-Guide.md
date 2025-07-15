# 🔐 JWT Token Authentication Guide

## Quick Start

To get a JWT token, you need to register or login through the authentication API:

### 1. Register (First Time)
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "myuser",
  "email": "user@example.com",
  "password": "password123"
}
```

### 2. Login (Returning User)
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com", 
  "password": "password123"
}
```

### 3. Response Contains Token
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "myuser",
    "email": "user@example.com"
  }
}
```

## Using JWT Tokens

### In API Calls
Add the token to the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### For Android Development
```java
// Store after login
String jwtToken = response.getString("access_token");
sharedPreferences.edit().putString("jwt_token", jwtToken).apply();

// Use in requests
String token = sharedPreferences.getString("jwt_token", "");
request.addHeader("Authorization", "Bearer " + token);
```

### For React Native
```javascript
// Store after login
await AsyncStorage.setItem('jwt_token', access_token);

// Use in requests  
const token = await AsyncStorage.getItem('jwt_token');
headers: { 'Authorization': `Bearer ${token}` }
```

## Testing Tools

### Stream Manager (Web Interface)
1. Open: `http://localhost:8080/stream-manager.html`
2. Register/Login using the form
3. Copy the JWT token from the response
4. Use in your mobile app

### curl Examples
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login  
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token
curl -X POST http://localhost:3000/api/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Room","description":"Test room"}'
```

## What Requires Authentication?

### Public Endpoints (No Token Needed)
- `GET /api/rooms` - View public rooms
- `GET /api/streams` - View active streams  
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Protected Endpoints (Token Required)
- `POST /api/rooms` - Create rooms
- `PUT /api/rooms/:id` - Update rooms
- `DELETE /api/rooms/:id` - Delete rooms
- `POST /api/streams` - Create streams
- `PUT /api/streams/:id` - Update streams

## Token Lifecycle

1. **Get Token**: Register or login
2. **Store Securely**: In app storage (encrypted recommended)
3. **Include in Requests**: Authorization header
4. **Handle Expiration**: Re-login when you get 401 errors
5. **Logout**: Clear stored token

## Security Best Practices

- Store tokens securely in your mobile app
- Don't expose tokens in logs or URLs
- Implement automatic token refresh
- Clear tokens on logout
- Use HTTPS in production
