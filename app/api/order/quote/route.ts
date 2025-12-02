import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    
    console.log('Quote request received:', data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Quote request received successfully',
      data: data 
    });
    
  } catch (error) {
    console.error('Error processing quote request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process quote request' },
      { status: 500 }
    );
  }
}