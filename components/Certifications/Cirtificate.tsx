'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Certificate({
  title,
  icon,
  color,
  description,
  organization,
  date,
  tags,
  certificateLink,
  imageUrl,
  logoUrl,
}: {
  title: string
  icon: string
  color: string
  description: string
  organization: string
  date: string
  tags: string
  certificateLink: string
  imageUrl?: string
  logoUrl?: string
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-700',
    indigo: 'from-indigo-500 to-indigo-700',
    purple: 'from-purple-500 to-purple-700',
    pink: 'from-pink-500 to-pink-700',
    rose: 'from-rose-500 to-rose-700',
    orange: 'from-orange-500 to-orange-700',
    emerald: 'from-emerald-500 to-emerald-700',
    cyan: 'from-cyan-500 to-cyan-700',
  }

  // Determine the final color to use
  let finalColor = color

  // If color is missing or is the default 'blue', we pick one based on the title to ensure variety
  if (!color || color === 'blue' || !colorMap[color]) {
    const colors = Object.keys(colorMap)
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    finalColor = colors[hash % colors.length]
  }

  const gradientClass = colorMap[finalColor] || 'from-blue-500 to-blue-700'

  const [imgError, setImgError] = useState(false)
  const [showWebsite, setShowWebsite] = useState(false)

  return (
    <>
      <div
        className="group relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition duration-300 cursor-pointer"
        onClick={() => (imageUrl || logoUrl || certificateLink) && setIsModalOpen(true)}
      >

        {/* Header Section (Colored/Image) */}
        <div className="relative h-32 overflow-hidden">
          {imageUrl && !imgError ? (
            <>
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-80`}></div>
            </>
          ) : (
            <div className={`h-full w-full bg-gradient-to-r ${gradientClass}`}></div>
          )}

          <div className="absolute inset-0 p-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight drop-shadow-md">{title}</h3>
            <div className="bg-white/20 backdrop-blur-md text-white w-12 h-12 shrink-0 rounded-xl border border-white/30 flex items-center justify-center shadow-inner overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={organization} className="w-full h-full object-cover" />
              ) : (
                <i className={`fa-solid ${icon} text-xl`}></i>
              )}
            </div>
          </div>
        </div>

        {/* Details Section (White) */}
        <div className="p-6 flex-grow bg-white">
          <p className="text-gray-700 font-medium mb-4 line-clamp-3">{description}</p>
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-gray-600">
              <i className="fas fa-building mr-2 w-5 text-blue-500"></i>
              <span className="truncate">{organization}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <i className="far fa-calendar-alt mr-2 w-5 text-blue-500"></i>
              <span>{date}</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
            {certificateLink && certificateLink !== '#' && (
              <a
                href={certificateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Verify</span>
                <i className="fas fa-external-link-alt ml-1"></i>
              </a>
            )}

            {(imageUrl || certificateLink) && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <i className="fas fa-expand"></i> Click to preview
              </span>
            )}
          </div>
        </div>

        {/* Hover Overlay (Image Preview) */}
        {(imageUrl || logoUrl) && (
          <div className="absolute inset-0 z-20 bg-gray-900 bg-opacity-95 text-white transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out flex flex-col items-center justify-center overflow-hidden">
            <img
              src={imageUrl || logoUrl}
              alt="Certificate Preview"
              className="w-full h-48 object-cover mb-4 opacity-50"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center">
              <h4 className="text-xl font-bold mb-4">{title}</h4>
              <div className="px-6 py-3 bg-white text-blue-900 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2">
                <span>View Full Certificate</span>
                <i className="fas fa-eye"></i>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop with Blur */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setIsModalOpen(false)
              setShowWebsite(false)
            }}
          ></div>

          {/* Modal Content */}
          <div className="relative z-10 bg-white rounded-lg shadow-2xl max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col transition-all">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                {certificateLink && (
                  <button
                    onClick={() => setShowWebsite(!showWebsite)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-2 ${showWebsite ? 'bg-blue-600 text-white border-blue-600' : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    <i className={`fas ${showWebsite ? 'fa-image' : 'fa-globe'}`}></i>
                    <span>{showWebsite ? 'Show Image' : 'View Live Website'}</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setShowWebsite(false)
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="flex-grow bg-gray-100 overflow-hidden flex items-center justify-center relative">
              {showWebsite && certificateLink ? (
                <iframe
                  src={certificateLink}
                  className="w-full h-full border-none bg-white"
                  title="Certificate Document"
                />
              ) : (
                imageUrl || logoUrl ? (
                  <img
                    src={imageUrl || logoUrl}
                    alt={title}
                    className="max-w-full max-h-full shadow-lg object-contain transition-transform duration-500"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <i className="fas fa-file-invoice text-5xl mb-4"></i>
                    <p>Certificate preview not available</p>
                  </div>
                )
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setShowWebsite(false)
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Close
              </button>
              {certificateLink && (
                <a
                  href={certificateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium shadow-md transition-all active:scale-95"
                >
                  <span>Open Original</span>
                  <i className="fas fa-external-link-alt"></i>
                </a>
              )}
            </div>
          </div>
        </div>
      )
      }
    </>
  )
}
