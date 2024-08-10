// src/pages/api/generate.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { website_url, website_name, website_purpose, website_category, target_audience } = req.body;
  
      // Prepare payload
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Generate SEO meta tags and keywords for a website with the following details:\n\n
                       Website URL: ${website_url}\n
                       Website Name: ${website_name}\n
                       Website Purpose: ${website_purpose}\n
                       Website Category: ${website_category}\n
                       Target Audience: ${target_audience}.`
              }
            ]
          }
        ]
      };
  
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
  
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
  
        const data = await response.json();
        const generated_text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated.';
        res.status(200).json({ generated_text });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error occurred while generating content.' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }
  