import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { analyzeMedicineImage } from '../services/geminiService'

const MAX_FILE_SIZE_MB = 10

const MainPage = () => {
  const [file, setFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null) // <-- changed to state
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [analysisResult, setAnalysisResult] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!file) {
      setFilePreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setFilePreviewUrl(objectUrl)

    // Cleanup when file changes or component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const validateFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return false
    }
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError('File size exceeds 10 MB.')
      return false
    }
    setError('')
    return true
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile)
      setIsAnalyzed(false)
      setAnalysisResult('')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile)
      setIsAnalyzed(false)
      setAnalysisResult('')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a file to analyze.')
      return
    }

    setIsUploading(true)
    setError('')
    setAnalysisResult('')

    try {
      const result = await analyzeMedicineImage(file)
      setAnalysisResult(result.analysis)
      setIsAnalyzed(true)
    } catch (err) {
      setError(err.message || 'Failed to analyze image.')
      setIsAnalyzed(false)
    } finally {
      setIsUploading(false)
    }
  }

  const handleReport = () => {
    if (!file || !isAnalyzed) {
      setError('Please upload and analyze a file first.')
      return
    }
    navigate('/report', { state: { analysis: analysisResult } })
  }

  const resetFile = () => {
    setFile(null)
    setIsAnalyzed(false)
    setAnalysisResult('')
    setError('')
    setFilePreviewUrl(null) // reset preview URL state
  }

  return (
    <div className="min-h-screen bg-lime-300 flex justify-center items-center p-4">
      <div className="w-full max-w-[1000px] flex flex-col">
        <Navbar />
        <div className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-72px)]">
          {/* Upload Section */}
          <div
            className="border-2 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:m-14 md:w-1/2 w-full"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <h1 className="text-center text-xl font-bold">Upload Your Medicine Image</h1>
            <p className="mt-5 text-center text-xs text-zinc-400 italic">
              Please upload an image of the back side of the medicine wrapper to help analyze the medication accurately.
            </p>

            <label
              htmlFor="file-upload"
              className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400"
            >
              <div className="mb-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Drag & drop or click to choose image file</p>
              <p className="mt-1 text-xs text-gray-400">Max file size: 10 MB</p>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {error && <div className="mt-3 text-red-500 text-sm text-center">{error}</div>}

            <div className="mt-6 flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-3">
                <div className="rounded bg-orange-100 p-2 text-orange-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 12l-4-4-4 4M12 16v-8" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-700">{file ? file.name : 'No image uploaded'}</p>
                  <p className="text-xs text-gray-400">
                    {file
                      ? `${file.type || 'Unknown format'} | ${(file.size / 1024 / 1024).toFixed(2)} MB`
                      : 'Upload an image file (JPG, PNG, etc.) to start'}
                  </p>
                </div>
              </div>
              <button
                className={`text-gray-500 hover:text-gray-700 ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Delete uploaded image"
                onClick={resetFile}
                disabled={!file}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {file && filePreviewUrl && (
              <div className="image-display flex justify-center mt-4">
                <img
                  src={filePreviewUrl}
                  alt="Uploaded preview"
                  className="max-h-56 object-contain bg-white"
                />
              </div>
            )}

            <button
              className={`mt-6 w-full bg-green-400 border-2 px-3 py-2 font-bold text-black hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-shadow duration-200 ${
                !file || isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleAnalyze}
              disabled={!file || isUploading}
            >
              {isUploading ? 'Analyzing...' : 'Analyze Medicine'}
            </button>

            {isAnalyzed && !error && (
              <div className="mt-4 text-green-700 text-center text-sm font-medium">
                Analysis completed. You can now view the report.
              </div>
            )}
          </div>

          {/* Report Section */}
          <div className="mt-10 md:mt-14 md:w-1/2 w-full pr-0 md:pr-14 flex flex-col justify-start">
            <div className="mb-5">
              {isAnalyzed ? (
                <>
                  <p className="text-sm text-green-700">Report is generated. You can view it below.</p>
                  <button
                    className="mt-2 w-full border-2 bg-purple-400 py-2 font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-purple-400"
                    onClick={handleReport}
                  >
                    View Report
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-700">Please upload and analyze an image to generate the report.</p>
              )}
            </div>

            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <h1 className="mb-2 text-xl font-bold">How PillPeer Works?</h1>
              <p className="text-sm text-gray-700">
                PillPeer analyzes the medicine and generates a detailed report containing:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                <li>About the medicine</li>
                <li>Usage instructions</li>
                <li>Possible side effects</li>
                <li>Recommended age group</li>
                <li>Expiry information</li>
                <li>Primary purpose</li>
              </ul>
            </div>

            <div className="mt-5">
              <h1 className="mb-2 text-lg font-bold">Disclaimer</h1>
              <p className="text-sm text-gray-600">
                This application helps users take the right medication at the right time, avoid expired products, and prevent misuse of medicine.
                <br />
                <br />
                <strong>Important:</strong> This app does not provide medical advice. Always consult a licensed doctor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage
