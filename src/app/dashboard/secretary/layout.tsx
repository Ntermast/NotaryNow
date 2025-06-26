// src/app/dashboard/secretary/layout.tsx
import { ReactNode } from "react"

interface SecretaryLayoutProps {
  children: ReactNode
}

export default function SecretaryLayout({ children }: SecretaryLayoutProps) {
  return <>{children}</>
}