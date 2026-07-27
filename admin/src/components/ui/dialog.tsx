import * as React from "react"

export function Dialog({ open, onOpenChange, children }: any) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={() => onOpenChange(false)}></div>
      <div className="z-50 bg-card text-card-foreground border rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ children }: any) {
  return <div className="p-6 space-y-4">{children}</div>
}

export function DialogHeader({ children }: any) {
  return <div className="space-y-1.5">{children}</div>
}

export function DialogTitle({ children }: any) {
  return <h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>
}

export function DialogFooter({ children }: any) {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{children}</div>
}
