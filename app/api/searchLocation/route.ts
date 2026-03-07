import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: "A search query is required" }, { status: 400 });
  }

  // UPDATED: Using the exact URL from your cURL snippet!
  const url = `https://fly-scraper.p.rapidapi.com/flights/autocomplete?query=${query}`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
      'x-rapidapi-host': 'fly-scraper.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json({ error: "Failed to fetch location data" }, { status: 500 });
  }
}