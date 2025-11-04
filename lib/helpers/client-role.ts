"use client"
import { useRole } from "@/lib/context/role-context";

const useClientRole = () => {
  return useRole();
};

export default useClientRole;
