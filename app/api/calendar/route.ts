import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const originSkyId = searchParams.get('originSkyId');
  const destinationSkyId = searchParams.get('destinationSkyId');
  const fromDate = searchParams.get('fromDate'); 
  const type = searchParams.get('type'); // "outbound" or "return"

  if (!originSkyId || !destinationSkyId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  // Choose the correct RapidAPI endpoint based on the type requested
  const endpoint = type === 'return' ? 'price-calendar-return' : 'price-calendar';
  
  let url = `https://fly-scraper.p.rapidapi.com/flights/${endpoint}?originSkyId=${originSkyId}&destinationSkyId=${destinationSkyId}`;
  
  if (fromDate) {
    url += `&fromDate=${fromDate}`;
  }

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
    console.error(`Error fetching ${type} calendar:`, error);
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}