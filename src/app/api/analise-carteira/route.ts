import { NextResponse } from "next/server";

export async function POST() {
  try {

    const baseUrl = process.env.LOCAL_API_URL?.trim(); // sem NEXT_PUBLIC
    const apiToken = process.env.API_TOKEN?.trim();

    if (!baseUrl || !apiToken) {
      return NextResponse.json(
        { error: "Variáveis de ambiente faltando." },
        { status: 500 }
      );
    }

    const response = await fetch(`${baseUrl}/empresa/listar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_token: apiToken,

      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro do backend: ${response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: `Erro interno: ${err}` }, { status: 500 });
  }
}
