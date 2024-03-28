"use client";
import { useEffect } from "react";
export function AutoPrint () {
  useEffect(() => {
    const id = setTimeout(() =>{
      window.print();
    }, 500);
    return () => clearTimeout(id);
  }, []);
  return (<></>)
}
