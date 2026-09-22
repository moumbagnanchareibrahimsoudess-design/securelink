import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(
      `${process.env.SECURELINK_API_URL}/ask`,
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
        { error: "Le conseiller n'a pas pu traiter votre demande pour le moment." },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Erreur de communication avec le serveur d'assistance." },
      { status: 500 }
    );
  }
}
