import HomeClient from './home-client';

// No server-side data fetching — HomeClient fetches from /api/market-data client-side
// This eliminates CoinGecko/FRED rate limiting issues on Vercel
export default function Home() {
  return <HomeClient />;
}
