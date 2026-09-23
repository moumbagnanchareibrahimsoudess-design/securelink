import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendUrl = (process.env.SECURELINK_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
  const backendResponse = await fetch(
    `${backendUrl}/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.SECURELINK_API_KEY as string,
      },
      body: JSON.stringify(body),
    }
  );

  if (!backendResponse.ok) {
    return NextResponse.json(
      { error: "Erreur lors de l'analyse." },
      { status: backendResponse.status }
    );
  }

  const data = await backendResponse.json();
  return NextResponse.json(data);
}