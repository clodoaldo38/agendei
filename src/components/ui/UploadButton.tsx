import React, { useRef } from 'react'
import Button from './Button'

interface UploadButtonProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  accept?: string
  className?: string
  children?: React.ReactNode
}

export default function UploadButton({ onFileSelect, accept = "image/*", className, children }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <Button 
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white ${className || ''}`}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7,10 12,15 17,10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {children || 'Upload'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onFileSelect}
        className="hidden"
      />
    </>
  )
}