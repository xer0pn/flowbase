import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tickers } = await req.json();

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'tickers array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching prices for tickers:', tickers);

    const prices: Record<string, number> = {};

    // Fetch all tickers in parallel for better performance
    const results = await Promise.allSettled(
      tickers.map(ticker => fetchStockPrice(ticker))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        prices[tickers[index]] = result.value;
        console.log(`${tickers[index]}: $${result.value}`);
      } else {
        console.warn(`Could not fetch price for ${tickers[index]}`);
      }
    });

    return new Response(
      JSON.stringify({ prices }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in stock-prices function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Main function to fetch stock price with fallback methods
async function fetchStockPrice(ticker: string): Promise<number | null> {
  // Try Method 1: Yahoo Finance query2 endpoint (most reliable)
  let price = await fetchFromYahooQuery2(ticker);
  if (price) return price;

  // Try Method 2: Yahoo Finance query1 endpoint
  price = await fetchFromYahooQuery1(ticker);
  if (price) return price;

  // Try Method 3: FMP Free endpoint (no API key needed for basic quotes)
  price = await fetchFromFMP(ticker);
  if (price) return price;

  return null;
}

// Method 1: Yahoo Finance query2.finance.yahoo.com
async function fetchFromYahooQuery2(ticker: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const price = data.quoteSummary?.result?.[0]?.price?.regularMarketPrice?.raw;
      if (price && !isNaN(price) && price > 0) return price;
    }
  } catch (error) {
    // Silently fail and try next method
  }
  return null;
}

// Method 2: Yahoo Finance query1.finance.yahoo.com
async function fetchFromYahooQuery1(ticker: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://finance.yahoo.com/',
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price && !isNaN(price) && price > 0) return price;
    }
  } catch (error) {
    // Silently fail and try next method
  }
  return null;
}

// Method 3: Financial Modeling Prep (FMP) - Free tier, no API key for basic quotes
async function fetchFromFMP(ticker: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/quote-short/${ticker}?apikey=demo`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const price = data[0].price;
        if (price && !isNaN(price) && price > 0) return price;
      }
    }
  } catch (error) {
    // Silently fail
  }
  return null;
}