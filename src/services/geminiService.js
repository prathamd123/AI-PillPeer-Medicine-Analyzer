// src/services/geminiService.js

const GEMINI_API_KEY = 'AIzaSyCgzNE0Z_yincWQzcRO7l39aJ1VLvj95L8'
const GEMINI_MODEL = 'gemini-1.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

// Convert File to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1] || reader.result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Gemini API call
export async function analyzeMedicineImage(imageFile) {
  if (!GEMINI_API_KEY) throw new Error('Missing Gemini API key.')
  if (!(imageFile instanceof File)) throw new Error('Invalid file type.')
const prompt = `Analyze this image and generate a detailed report with the following information if visible:
1. About the medicine (limit to 30 words)
2. Usage instructions (limit to 30 words)
3. Possible side effects (limit to 30 words)
4. Recommended age group (limit to 30 words)
5. Expiry information (limit to 30 words)
6. Primary purpose (limit to 30 words)

Extract only what can be confidently identified from the image. Format the response clearly using section headings. Ensure each section does not exceed 30 words.`;


  const base64Image = await fileToBase64(imageFile)

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Image
            }
          }
        ]
      }
    ]
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })

  const result = await response.json()
  if (result.error) {
    throw new Error(result.error.message || 'Gemini API error')
  }

  const text =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.candidates?.[0]?.content?.text
  if (!text) throw new Error('No result text from Gemini')
  return {
    analysis: text,
    raw: result
  }
}
