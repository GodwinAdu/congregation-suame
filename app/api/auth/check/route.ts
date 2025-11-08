import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ACCESS_TOKEN_SECRET = process.env.TOKEN_SECRET_KEY;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("Missing environment variable: TOKEN_SECRET_KEY");
}

const accessTokenEncoder = new TextEncoder().encode(ACCESS_TOKEN_SECRET);

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { payload } = await jwtVerify(accessToken, accessTokenEncoder);
    
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user: payload });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}