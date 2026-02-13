import { useEffect, useState } from "react"
import { pb } from "./pb"
import type { UsersResponse } from "@/types/pocketbase-types"

export function useAuth() {
  const [user, setUser] = useState<UsersResponse | null>(pb.authStore.model as UsersResponse | null)

  useEffect(() => {
    return pb.authStore.onChange((_token: string, model: any) => {
      setUser(model as UsersResponse | null)
    })
  }, [])

  const logout = () => {
    pb.authStore.clear()
  }

  return { user, logout }
}
