// design-sync pilot entry — re-exports ONLY the standalone-clean components
// so esbuild never bundles the 49 Next.js-coupled files in components/.
// Passed via `--entry .design-sync/pilot-entry.tsx` to package-build.mjs.
export { default as KPICard } from '../components/KPICard';
export { default as AnimatedNumber } from '../components/AnimatedNumber';
export { default as AuroraShader } from '../components/AuroraShader';
export { default as CursorGlow } from '../components/CursorGlow';
