import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const originSkyId = searchParams.get('originSkyId');
  const destinationSkyId = searchParams.get('destinationSkyId');
  const originEntityId = searchParams.get('originEntityId');
  const destinationEntityId = searchParams.get('destinationEntityId');
  const date = searchParams.get('date');
  const returnDate = searchParams.get('returnDate');

  // Let's print exactly what the backend received to your VS Code terminal
  console.log("--- NEW FLIGHT SEARCH ---");
  console.log("Received Dates:", { date, returnDate });

  if (!originSkyId || !destinationSkyId || !date || !returnDate) {
    return NextResponse.json({ error: "Missing required flight parameters" }, { status: 400 });
  }

  // UPDATED: Now using the exact v2 URL you found!
  const baseUrl = 'https://fly-scraper.p.rapidapi.com/v2/flights/search-roundtrip';
  
  const queryParams = new URLSearchParams({
    originSkyId,
    destinationSkyId,
    originEntityId: originEntityId || '',
    destinationEntityId: destinationEntityId || '',
    date,
    returnDate,
    adults: '1',
    cabinClass: 'economy',
    currency: 'EUR' 
  });

  const url = `${baseUrl}?${queryParams.toString()}`;
  console.log("Sending request to:", url);

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
    console.error("Error fetching flights:", error);
    return NextResponse.json({ error: "Failed to fetch flights" }, { status: 500 });
  }
}