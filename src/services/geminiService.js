// src/services/geminiService.js

const GEMINI_API_KEY = 'AIzaSyAB_dhliD7qqi3fWFuPjyJWTrDGLVocwCk'
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
    const prompt = `
You are provided an image of a medicine package. Extract all clearly visible information and generate a concise, structured summary. Use a professional tone. For any missing sections (except expiry and manufacturer), provide medically accurate placeholders without guessing visible details.

Format the output exactly as below, keeping each section brief (max 100 words). Do not repeat any information.

---

About the Medicine:  
Summarize the medicine or list its main ingredients visible on the packaging.

Form & Packaging Type:  
Specify the form (e.g., tablet, soft gel capsule, syrup) and packaging type.

Usage Instructions:  
If visible, copy instructions; otherwise, say "Use as directed by a healthcare provider."

Possible Side Effects:  
Extract if visible; else provide common side effects relevant to the medicine type.

Recommended Age Group:  
State if visible; otherwise, provide a suitable age recommendation.

Expiry Information:  
Extract only clearly visible expiry date, e.g., "EXP: Nov 2026." Do not guess.

Primary Purpose:  
Describe the health benefit or main function of the medicine.

Useful For:  
Indicate who this medicine is suitable for.

Treats:  
List conditions or deficiencies the medicine addresses.

Storage Instructions:  
Extract if visible; otherwise, state "Store in a cool, dry place away from sunlight."

Warnings / Precautions:  
Include visible warnings or common safety advice if none visible.

Prescription Required:  
State if a prescription is required; infer only if clearly indicated.

Manufacturer Information:  
Extract company name and location only if clearly visible.

---

Ensure the output is well-structured, concise, and free of repetition. Only fabricate information where explicitly allowed, and never guess expiry or manufacturer details.
`

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
