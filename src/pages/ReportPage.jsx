import React from 'react'
import Navbar from '../components/Navbar'
import { useLocation, useNavigate } from 'react-router-dom'

function parseGeminiText(text) {
  if (!text) return {}

  const cleanText = t => t.replace(/\*\*/g, '').replace(/\*/g, '').trim()

  const result = {
    about: '',
    usageInstructions: [],
    sideEffects: [],
    ageGroup: [],
    expiryInfo: [],
    primaryPurpose: [],
    raw: text,
  }

  const patterns = {
    about: /about the medicine\s*[:\-]?\s*(.*?)(?=\n\s*(usage instructions|possible side effects|recommended age group|expiry information|primary purpose)|$)/is,
    usageInstructions: /usage instructions\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|possible side effects|recommended age group|expiry information|primary purpose)|$)/is,
    sideEffects: /possible side effects\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|recommended age group|expiry information|primary purpose)|$)/is,
    ageGroup: /recommended age group\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|expiry information|primary purpose)|$)/is,
    expiryInfo: /expiry information\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|primary purpose)|$)/is,
    primaryPurpose: /primary purpose\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information)|$)/is,
  }

  for (const [key, regex] of Object.entries(patterns)) {
    const match = text.match(regex)
    if (match && match[1]) {
      const value = cleanText(match[1])

      if (['usageInstructions', 'sideEffects', 'ageGroup', 'expiryInfo', 'primaryPurpose'].includes(key)) {
        // Split by newlines, bullets, or numbered lists, clean and filter empty
        result[key] = value
          .split(/\n+|\*|\d+\.\s+/)
          .map(line => cleanText(line))
          .filter(Boolean)
      } else {
        result[key] = value
      }
    }
  }

  return result
}

const ReportPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Use the correct key: "analysis"
  const geminiResponse = location.state?.analysis

  if (!geminiResponse) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lime-300 p-4">
        <div className="mx-auto flex w-full max-w-[1000px] flex-col">
          <Navbar />
          <div className="mx-auto mt-20 w-full max-w-[800px] border bg-white p-10 text-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <p className="text-lg text-red-500 font-semibold">
              No report data found. Please analyze a medicine image first.
            </p>
            <button
              className="mt-6 border-2 bg-lime-400 py-2 px-6 font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-lime-500"
              onClick={() => navigate('/')}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Extract the text from the Gemini response
  let reportText = ''
  if (typeof geminiResponse === 'string') {
    reportText = geminiResponse
  } else if (
    geminiResponse.candidates &&
    geminiResponse.candidates.length > 0 &&
    geminiResponse.candidates[0].content
  ) {
    if (typeof geminiResponse.candidates[0].content === 'string') {
      reportText = geminiResponse.candidates[0].content
    } else if (Array.isArray(geminiResponse.candidates[0].content.parts)) {
      reportText = geminiResponse.candidates[0].content.parts.map(p => p.text).join('\n')
    }
  }

  const report = parseGeminiText(reportText)

  return (
    <div className="flex min-h-screen items-center justify-center bg-lime-300 p-4">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col">
        <Navbar />

        <h1 className="mt-8 text-center text-3xl font-bold">Your Medicine Analysis</h1>

        <div className="mx-auto mt-14 w-full max-w-[800px] border bg-white p-10 text-left shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          {/* Medicine name (if you want to add later) */}
          {/* <h3 className="mb-2 text-xl font-semibold">{report.medicineName || 'Unknown Medicine'}</h3> */}

          <p>
            <strong>About the medicine:</strong><br />
            {report.about ? report.about : <span className="text-gray-400">Not available</span>}
          </p>

          <div className="mt-4">
            <strong>Usage instructions:</strong>
            <ul className="mt-2 list-inside list-disc">
              {report.usageInstructions.length > 0
                ? report.usageInstructions.map((item, idx) => <li key={idx}>{item}</li>)
                : <li className="text-gray-400">Not available</li>}
            </ul>
          </div>

          <div className="mt-4">
            <strong>Possible side effects:</strong>
            <ul className="mt-2 list-inside list-disc">
              {report.sideEffects.length > 0
                ? report.sideEffects.map((item, idx) => <li key={idx}>{item}</li>)
                : <li className="text-gray-400">Not available</li>}
            </ul>
          </div>

          <div className="mt-4">
            <strong>Recommended age group:</strong>
            <ul className="mt-2 list-inside list-disc">
              {report.ageGroup.length > 0
                ? report.ageGroup.map((item, idx) => <li key={idx}>{item}</li>)
                : <li className="text-gray-400">Not available</li>}
            </ul>
          </div>

          <div className="mt-4">
            <strong>Expiry information:</strong>
            <ul className="mt-2 list-inside list-disc">
              {report.expiryInfo.length > 0
                ? report.expiryInfo.map((item, idx) => <li key={idx}>{item}</li>)
                : <li className="text-gray-400">Not available</li>}
            </ul>
          </div>

          <div className="mt-4">
            <strong>Primary purpose:</strong>
            <ul className="mt-2 list-inside list-disc">
              {report.primaryPurpose.length > 0
                ? report.primaryPurpose.map((item, idx) => <li key={idx}>{item}</li>)
                : <li className="text-gray-400">Not available</li>}
            </ul>
          </div>

          <hr className="my-4" />

          <p className="text-center text-sm text-gray-500">
            This analysis is generated by AI. For medical advice, always consult a healthcare professional.
          </p>
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-[800px] flex-col gap-4">
          <button
            className="w-full border-2 bg-lime-400 py-2 font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition hover:bg-lime-600 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
            onClick={() => window.print()}
          >
            Download PDF
          </button>
          <button
            className="w-full border-2 bg-lime-400 py-2 font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition hover:bg-lime-600 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
            onClick={() => navigate('/')}
          >
            Analyze Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportPage
