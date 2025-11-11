/**
 * API Route: /api/users
 * Methods: GET, POST, PATCH, DELETE
 */
import { NextRequest, NextResponse } from 'next/server';

// Mock user data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
];

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit');
  
  let responseUsers = users;
  
  if (limit) {
    const limitNumber = parseInt(limit, 10);
    responseUsers = users.slice(0, limitNumber);
  }
  
  return NextResponse.json({
    data: responseUsers,
    total: users.length,
    status: 'success'
  });
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { 
          message: 'Name and email are required',
          status: 'error'
        },
        { status: 400 }
      );
    }
    
    const newUser = {
      id: users.length + 1,
      name,
      email
    };
    
    users.push(newUser);
    
    return NextResponse.json({
      message: 'User created successfully',
      data: newUser,
      status: 'success'
    }, { status: 201 });
    
  } catch (error) {
    return NextResponse.json(
      { 
        message: 'Invalid request data',
        status: 'error'
      },
      { status: 400 }
    );
  }
}
