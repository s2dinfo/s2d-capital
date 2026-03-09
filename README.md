# S2D Capital Insights

Financial intelligence platform covering Crypto, Macro, Commodities, FX, Geopolitics, and Market Structure.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Hosting:** Vercel
- **APIs:** CoinGecko (crypto), FRED (macro)
- **Newsletter:** Beehiiv
- **Domain:** s2d.info

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys.

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

This project auto-deploys to Vercel when you push to `main`.

### Environment Variables (set in Vercel Dashboard)

- `NEXT_PUBLIC_COINGECKO_API_KEY` - CoinGecko Demo API key
- `FRED_API_KEY` - FRED API key
- `BEEHIIV_API_KEY` - Beehiiv API key (when ready)
- `BEEHIIV_PUBLICATION_ID` - Beehiiv publication ID (when ready)

## Project Structure

```
app/
  layout.tsx          # Root layout (nav, ticker, footer)
  page.tsx            # Homepage
  page.module.css     # Homepage styles
  research/
    page.tsx          # Research hub with filtering
  markets/
    page.tsx          # Market data dashboard
  newsletter/
    page.tsx          # Newsletter signup with topic picker
  about/
    page.tsx          # About page
  impressum/
    page.tsx          # Legal (German requirement)
  datenschutz/
    page.tsx          # Privacy policy (GDPR)
components/
  Navbar.tsx          # Navigation bar
  Footer.tsx          # Site footer
  Ticker.tsx          # Live price ticker
lib/
  api.ts              # CoinGecko + FRED API functions
  verticals.ts        # Six vertical definitions
  articles.ts         # Article data (replace with Notion CMS)
public/
  logo.png            # Nav logo
  logo-hero.png       # Hero logo
  logo-icon.png       # Monogram icon
  logo-full.png       # Full logo
styles/
  globals.css         # Design system + global styles
```

## Roadmap

- [ ] Connect Notion as CMS for articles
- [ ] Integrate FRED macro data on markets page
- [ ] Add BTC/ETH interactive charts
- [ ] Connect Beehiiv API for newsletter
- [ ] Build AI chatbot (Phase 3)
- [ ] Add FX rates from Open Exchange Rates
