"use client";

import { useState } from "react";

export default function Home() {
  const [origin1, setOrigin1] = useState("");
  const [origin2, setOrigin2] = useState("");
  const [destination, setDestination] = useState("");
  const [windowStart, setWindowStart] = useState("");
  const [windowEnd, setWindowEnd] = useState("");
  const [maxBudget, setMaxBudget] = useState("300"); 
  const [isLoading, setIsLoading] = useState(false);
  // NEW: State to hold our algorithm's results
  const [suggestedTrips, setSuggestedTrips] = useState<any[]>([]);

  const getLocationId = async (searchQuery: string) => {
    try {
      const response = await fetch(`/api/searchLocation?query=${searchQuery}`);
      const data = await response.json();
      if (data && data.data && data.data.length > 0) {
        const bestMatch = data.data[0];
        return {
          skyId: bestMatch.navigation.relevantFlightParams.skyId,
          entityId: bestMatch.navigation.relevantFlightParams.entityId,
          name: bestMatch.presentation.suggestionTitle
        };
      }
      return null;
    } catch (error) {
      console.error(`Error finding ID for ${searchQuery}:`, error);
      return null;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsLoading(true); 
    console.log(`Searching between ${windowStart} and ${windowEnd} for under €${maxBudget}`);

    // 1. Get Location IDs
    const [origin1Data, origin2Data, destinationData] = await Promise.all([
      getLocationId(origin1),
      getLocationId(origin2),
      getLocationId(destination)
    ]);

    if (!origin1Data || !origin2Data || !destinationData) {
      alert("Could not find locations.");
      setIsLoading(false);
      return;
    }

    // 2. Helper to fetch calendars
    const fetchCalendar = async (origin: any, dest: any, type: "outbound" | "return") => {
      const params = new URLSearchParams({
        originSkyId: origin.skyId,
        destinationSkyId: dest.skyId,
        fromDate: windowStart,
        type: type
      });
      const res = await fetch(`/api/calendar?${params.toString()}`);
      return res.json();
    };

    try {
      console.log("Scouting cheapest days...");
      const [p1Out, p2Out, p1Ret, p2Ret] = await Promise.all([
        fetchCalendar(origin1Data, destinationData, "outbound"),
        fetchCalendar(origin2Data, destinationData, "outbound"),
        fetchCalendar(origin1Data, destinationData, "return"),
        fetchCalendar(origin2Data, destinationData, "return")
      ]);

      // --- THE ALGORITHM STARTS HERE ---

      // Helper function to turn the calendar arrays into easy-to-read Maps
      const extractPrices = (calendarData: any) => {
        const priceMap = new Map();
        const days = calendarData?.data?.flights?.days || [];
        days.forEach((d: any) => {
          if (d.day && d.price !== undefined) {
            priceMap.set(d.day, d.price);
          }
        });
        return priceMap;
      };

      const p1OutPrices = extractPrices(p1Out);
      const p2OutPrices = extractPrices(p2Out);
      const p1RetPrices = extractPrices(p1Ret);
      const p2RetPrices = extractPrices(p2Ret);

      const validTrips = [];

      // Create an array of all dates in the user's window
      const possibleDates = [];
      let currentDate = new Date(windowStart);
      const endDate = new Date(windowEnd);
      while (currentDate <= endDate) {
        possibleDates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Loop through all possible Departure Dates
      for (let i = 0; i < possibleDates.length; i++) {
        const depDate = possibleDates[i];
        
        // If both people can fly out on this day...
        if (p1OutPrices.has(depDate) && p2OutPrices.has(depDate)) {
          
          // Loop through all possible Return Dates (must be AFTER departure date)
          for (let j = i + 1; j < possibleDates.length; j++) {
            const retDate = possibleDates[j];
            
            // If both people can fly back on this day...
            if (p1RetPrices.has(retDate) && p2RetPrices.has(retDate)) {
              
              const p1OutPrice = p1OutPrices.get(depDate);
              const p2OutPrice = p2OutPrices.get(depDate);
              const p1RetPrice = p1RetPrices.get(retDate);
              const p2RetPrice = p2RetPrices.get(retDate);
              
              const totalCost = p1OutPrice + p2OutPrice + p1RetPrice + p2RetPrice;
              
              // Does it beat our budget?
              if (totalCost <= Number(maxBudget)) {
                validTrips.push({
                  departureDate: depDate,
                  returnDate: retDate,
                  totalCost: totalCost.toFixed(2),
                  breakdown: {
                    p1Total: (p1OutPrice + p1RetPrice).toFixed(2),
                    p2Total: (p2OutPrice + p2RetPrice).toFixed(2)
                  }
                });
              }
            }
          }
        }
      }

      // Sort from cheapest to most expensive
      validTrips.sort((a, b) => Number(a.totalCost) - Number(b.totalCost));

      console.log("✅ ALGORITHM FINISHED! Valid Trips:", validTrips);
      
      // Save the trips to our state so they show up on the screen
      setSuggestedTrips(validTrips);

      if (validTrips.length === 0) {
        alert("No trips found under that budget for those dates.");
      }

    } catch (error) {
      console.error("Error scouting dates:", error);
    }

    setIsLoading(false); 
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Meet-in-the-Middle Flights</h1>
        <p className="text-gray-500 mb-8">Find overlapping dates where all 4 tickets stay under your budget.</p>

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin 1 (e.g. Romania)</label>
              <input type="text" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800" value={origin1} onChange={(e) => setOrigin1(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin 2 (e.g. Nuremberg)</label>
              <input type="text" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800" value={origin2} onChange={(e) => setOrigin2(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination (e.g. Catania)</label>
            <input type="text" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800" value={destination} onChange={(e) => setDestination(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Earliest Departure</label>
              <input type="date" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800" value={windowStart} onChange={(e) => setWindowStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latest Return</label>
              <input type="date" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800" value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Max Budget (€)</label>
              <input type="number" min="50" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-800" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={`w-full text-white font-semibold py-3 rounded-lg transition ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isLoading ? "Scouting calendars..." : "Find Best Dates"}
          </button>
        </form>
      </div>

       {/* --- NEW: DISPLAY THE RESULTS --- */}
      {suggestedTrips.length > 0 && (
        <div className="max-w-3xl mx-auto mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Best Date Combinations</h2>
          
          {suggestedTrips.map((trip, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center border-l-4 border-green-500">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Outbound: {trip.departureDate} &nbsp;✈️&nbsp; Return: {trip.returnDate}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Estimated Total: <span className="font-semibold text-green-600">€{trip.totalCost}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  (Person 1: €{trip.breakdown.p1Total} | Person 2: €{trip.breakdown.p2Total})
                </p>
              </div>
              
              <button 
                className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition font-semibold"
                onClick={() => alert(`Next step: Fetching real tickets for ${trip.departureDate}!`)}
              >
                Find Real Tickets
              </button>
            </div>
          ))}
        </div>
      )
      }
    </main>
  );
}