import React from 'react'
import Navbar from '../components/Navbar'
import { useLocation, useNavigate } from 'react-router-dom'

function parseGeminiText(text) {
  if (!text) return {}

  const cleanText = t => t.replace(/\*\*/g, '').replace(/\*/g, '').trim()

  const result = {
    about: '',
    formType: '',          // new
    usageInstructions: [],
    sideEffects: [],
    ageGroup: [],
    expiryInfo: [],
    primaryPurpose: [],
    usefulFor: '',         // new
    treats: '',            // new
    storage: '',           // new
    warnings: '',          // new
    prescriptionRequired: '', // new
    manufacturer: '',      // new
    raw: text,
  }

  const patterns = {
    about: /about the medicine\s*[:\-]?\s*(.*?)(?=\n\s*(usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    formType: /form & packaging type\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    usageInstructions: /usage instructions\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    sideEffects: /possible side effects\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    ageGroup: /recommended age group\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    expiryInfo: /expiry information\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    primaryPurpose: /primary purpose\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    usefulFor: /useful for\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    treats: /treats\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    storage: /storage instructions\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|warnings|prescription required|manufacturer information)|$)/is,
    warnings: /warnings\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|prescription required|manufacturer information)|$)/is,
    prescriptionRequired: /prescription required\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|manufacturer information)|$)/is,
    manufacturer: /manufacturer information\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required)|$)/is,
  }

  for (const [key, regex] of Object.entries(patterns)) {
    const match = text.match(regex)
    if (match && match[1]) {
      const value = cleanText(match[1])

      // For arrays: usageInstructions, sideEffects, ageGroup, expiryInfo, primaryPurpose
      if (['usageInstructions', 'sideEffects', 'ageGroup', 'expiryInfo', 'primaryPurpose'].includes(key)) {
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
          <p>
            <strong>About the medicine:</strong><br />
            {report.about ? report.about : <span className="text-gray-400">Not available</span>}
          </p>

          <div className="mt-4">
            <strong>Form & Packaging Type:</strong>
            <p className="mt-2">
              {report.formType ? report.formType : <span className="text-gray-400">Not available</span>}
            </p>
          </div>

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

          <div className="mt-4">
            <strong>Useful for:</strong>
            <p className="mt-2">
              {report.usefulFor ? report.usefulFor : <span className="text-gray-400">Not available</span>}
            </p>
          </div>

          <div className="mt-4">
            <strong>Treats:</strong>
            <p className="mt-2">
              {report.treats ? report.treats : <span className="text-gray-400">Not available</span>}
            </p>
          </div>

          <div className="mt-4">
            <strong>Storage instructions:</strong>
            <p className="mt-2">
              {report.storage ? report.storage : <span className="text-gray-400">Not available</span>}
            </p>
          </div>

          <div className="mt-4">
            <strong>Warnings / Precautions:</strong>
            <p className="mt-2">
              {report.warnings ? report.warnings : <span className="text-gray-400">Not available</span>}
            </p>
          </div>

          <div className="mt-4">
            <strong>Prescription required:</strong>
            <p className="mt-2">
              {report.prescriptionRequired ? report.prescriptionRequired : <span className="text-gray-400">Not available</span>}
            </p>
          </div>

          <div className="mt-4">
            <strong>Manufacturer information:</strong>
            <p className="mt-2">
              {report.manufacturer ? report.manufacturer : <span className="text-gray-400">Not available</span>}
            </p>
          </div>

          <hr className="my-4" />

          <p className="text-center text-sm text-gray-500">
            This analysis is generated by AI. For medical advice, always consult a healthcare professional.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReportPage
