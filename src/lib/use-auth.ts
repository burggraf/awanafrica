import { useEffect, useState } from "react"
import { pb } from "./pb"
import type { AuthModel } from "pocketbase"

export function useAuth() {
  const [user, setUser] = useState<AuthModel | null>(pb.authStore.model)

  useEffect(() => {
    return pb.authStore.onChange((_token: string, model: AuthModel | null) => {
      setUser(model)
    })
  }, [])

  const logout = () => {
    pb.authStore.clear()
  }

  return { user, logout, pb }
}
