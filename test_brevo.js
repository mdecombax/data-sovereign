const BREVO_API_KEY = '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';

async function test() {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Test', email: 'Martin.decombarieu@gmail.com' },
        to: [{ email: 'Martin.decombarieu@gmail.com', name: 'Martin' }],
        subject: 'Test API Key',
        htmlContent: '<p>Test</p>'
      })
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
