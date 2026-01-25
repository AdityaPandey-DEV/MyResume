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
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div
        className="group relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition duration-300 cursor-pointer"
        onClick={() => imageUrl && setIsModalOpen(true)}
      >

        {/* Content Layer */}
        <div className="relative z-10 bg-white h-full flex flex-col">
          <div className={`bg-${color}-600 p-5 flex items-center justify-between`}>
            <h3 className="text-lg font-bold text-white line-clamp-2">{title}</h3>
            <div className="bg-white text-blue-600 w-10 h-10 shrink-0 rounded-full flex items-center justify-center">
              <i className={icon}></i>
            </div>
          </div>
          <div className="p-6 flex-grow">
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

              {imageUrl && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <i className="fas fa-expand"></i> Click to preview
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover Overlay (Image Preview) */}
        {imageUrl && (
          <div className="absolute inset-0 z-20 bg-gray-900 bg-opacity-95 text-white transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out flex flex-col items-center justify-center overflow-hidden">
            {/* Using standard img for external/user content if domain not configured in next.config.js, 
                 but warning suggests using Image. Since we don't know domains, sticking to img is safer to avoid 'hostname not configured' error, 
                 but we'll suppress the warning if possible or just ignore it as it's a warning. 
                 Actually, the build failed on errors, warnings were just warnings. 
                 The build error was Type Error.
             */}
            <img
              src={imageUrl}
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
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative z-10 bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-500 transition-colors p-2"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-1 bg-gray-100 flex-grow overflow-auto flex items-center justify-center">
              <img src={imageUrl} alt={title} className="max-w-full max-h-[80vh] shadow-lg" />
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              {certificateLink && (
                <a
                  href={certificateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <span>Open Original</span>
                  <i className="fas fa-external-link-alt"></i>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
