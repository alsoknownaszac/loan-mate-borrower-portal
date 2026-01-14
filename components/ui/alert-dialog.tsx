"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface AlertDialogContextType {
  showAlert: (message: string, title?: string) => Promise<void>
  showConfirm: (message: string, title?: string) => Promise<boolean>
  showPrompt: (message: string, title?: string, defaultValue?: string) => Promise<string | null>
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined)

export function useAlertDialog() {
  const context = useContext(AlertDialogContext)
  if (!context) {
    throw new Error("useAlertDialog must be used within AlertDialogProvider")
  }
  return context
}

interface DialogState {
  isOpen: boolean
  type: "alert" | "confirm" | "prompt"
  title: string
  message: string
  defaultValue?: string
  resolve?: (value: any) => void
}

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: "alert",
    title: "",
    message: ""
  })
  const [inputValue, setInputValue] = useState("")

  const showAlert = (message: string, title: string = "Alert") => {
    return new Promise<void>((resolve) => {
      setDialog({
        isOpen: true,
        type: "alert",
        title,
        message,
        resolve
      })
    })
  }

  const showConfirm = (message: string, title: string = "Confirm") => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        isOpen: true,
        type: "confirm",
        title,
        message,
        resolve
      })
    })
  }

  const showPrompt = (message: string, title: string = "Input", defaultValue: string = "") => {
    setInputValue(defaultValue)
    return new Promise<string | null>((resolve) => {
      setDialog({
        isOpen: true,
        type: "prompt",
        title,
        message,
        defaultValue,
        resolve
      })
    })
  }

  const handleClose = (value?: any) => {
    if (dialog.resolve) {
      dialog.resolve(value)
    }
    setDialog({ ...dialog, isOpen: false })
    setInputValue("")
  }

  return (
    <AlertDialogContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      
      {dialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{dialog.title}</h3>
            </div>
            
            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-gray-700 whitespace-pre-wrap">{dialog.message}</p>
              
              {dialog.type === "prompt" && (
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter value..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleClose(inputValue)
                    } else if (e.key === "Escape") {
                      handleClose(null)
                    }
                  }}
                />
              )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              {dialog.type === "alert" && (
                <button
                  onClick={() => handleClose()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  OK
                </button>
              )}
              
              {dialog.type === "confirm" && (
                <>
                  <button
                    onClick={() => handleClose(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleClose(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Confirm
                  </button>
                </>
              )}
              
              {dialog.type === "prompt" && (
                <>
                  <button
                    onClick={() => handleClose(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleClose(inputValue)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    OK
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AlertDialogContext.Provider>
  )
}
