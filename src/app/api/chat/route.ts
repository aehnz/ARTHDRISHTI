import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: { code: 'MOVED_TO_BACKEND', message: 'Conversational intelligence is available through the FastAPI /api/v1/ask endpoint.' } },
    { status: 410 },
  );
}
