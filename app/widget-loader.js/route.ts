// This file seems to be a duplicate or misnamed.
// Assuming the correct path is `app/api/widget-loader/route.ts`
// If this file is intended to be a separate endpoint, its content should be defined.
// For now, I'll assume it's a redundant path and keep it minimal or redirect.
// If it's meant to serve a JS file directly, it should return a JS response.

import { NextResponse } from "next/server"

export async function GET() {
  // This route might be intended to serve a static JS file or redirect.
  // For now, returning a simple console log.
  return new NextResponse('console.log("Widget loader JS route hit.");', {
    headers: { "Content-Type": "application/javascript" },
  })
}
