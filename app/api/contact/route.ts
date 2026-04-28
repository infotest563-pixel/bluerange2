import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get the form ID from the form data
    const formId = formData.get('_wpcf7');
    
    if (!formId) {
      return NextResponse.json(
        { message: 'Form ID is required' },
        { status: 400 }
      );
    }

    // Forward the form submission to WordPress Contact Form 7 REST API
    const wpResponse = await fetch(
      `https://dev-bluerange.pantheonsite.io/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
      {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let fetch set it automatically for FormData
        },
      }
    );

    const data = await wpResponse.json();

    return NextResponse.json(data, { status: wpResponse.status });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { message: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
