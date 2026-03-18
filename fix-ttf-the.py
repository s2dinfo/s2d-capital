#!/usr/bin/env python3
"""
Patch EnergyArticle.tsx to distinguish TTF (European benchmark) from THE (German gas hub).
Two changes:
1. Expand the TTF Definition box to mention THE and other national hubs
2. Add a "Note" callout after the TTF definition clarifying the distinction for German gas
"""
import sys, re

filepath = sys.argv[1] if len(sys.argv) > 1 else "app/research/europe-energy-decoded/EnergyArticle.tsx"

with open(filepath, "r") as f:
    content = f.read()

# ── FIX 1: Find the TTF definition and expand it ──
# The TTF definition ends with something like:
#   "they almost always mean the TTF month-ahead contract."
# We need to add THE clarification after it.

old_ttf = 'When media report "European gas prices," they almost always mean the TTF month-ahead contract.'

new_ttf = (
    'When media report "European gas prices," they almost always mean the TTF month-ahead contract. '
    'However, TTF is not the only gas trading hub in Europe. Each major market has its own: '
    "Germany trades at THE (Trading Hub Europe), Spain at PVB (Punto Virtual de Balance), "
    "Italy at PSV (Punto di Scambio Virtuale), and France at PEG (Point d'Échange de Gaz). "
    "These national hubs generally track TTF but can diverge significantly during local supply stress, "
    "pipeline constraints, or regulatory shifts."
)

if old_ttf in content:
    content = content.replace(old_ttf, new_ttf)
    print("✅ FIX 1: Expanded TTF definition with THE and national hubs")
else:
    # Try a more flexible match
    alt = 'TTF month-ahead contract.'
    if alt in content:
        content = content.replace(
            alt,
            alt + (
                " However, TTF is not the only gas trading hub in Europe. Each major market has its own: "
                "Germany trades at THE (Trading Hub Europe), Spain at PVB (Punto Virtual de Balance), "
                "Italy at PSV (Punto di Scambio Virtuale), and France at PEG (Point d\\u2019Échange de Gaz). "
                "These national hubs generally track TTF but can diverge significantly during local supply stress, "
                "pipeline constraints, or regulatory shifts."
            )
        )
        print("✅ FIX 1 (alt match): Expanded TTF definition with THE and national hubs")
    else:
        print("⚠️  FIX 1: Could not find TTF definition text — manual edit needed")

# ── FIX 2: Add a dedicated Definition box for THE after the TTF section ──
# Look for the closing of the TTF Definition box (a </div> after the TTF text)
# and insert a new THE definition callout.

# We'll find the pattern where TTF definition ends and add a THE box.
# Looking for a natural insertion point — after the TTF definition block.

the_definition_jsx = '''

        <div style={S.callout}>
          <div style={S.calloutLabel}>Important Distinction</div>
          <strong>THE (Trading Hub Europe)</strong> is Germany{`'`}s gas trading hub — the German equivalent of TTF.
          When this article discusses {`"`}European gas prices,{`"`} it refers to TTF, the continental benchmark.
          But for German-specific gas supply, storage, and industrial pricing, THE is the relevant reference point.
          German gas storage levels, the Russian pipeline gas ban{`'`}s impact on Germany, and industrial gas costs
          are most directly reflected in THE prices — which can trade at a premium or discount to TTF depending on
          pipeline flows, storage levels, and cross-border capacity constraints.
        </div>'''

# Find the end of the TTF definition block by looking for the text we just modified
# and then the next closing </div>
marker = "pipeline constraints, or regulatory shifts."
if marker in content:
    # Find the position of the marker
    pos = content.find(marker)
    # Find the next </div> after it (closing the definition text div)
    next_div_close = content.find("</div>", pos)
    if next_div_close != -1:
        # Find the SECOND </div> (closing the callout container)
        second_div_close = content.find("</div>", next_div_close + 6)
        if second_div_close != -1:
            insert_pos = second_div_close + 6
            content = content[:insert_pos] + the_definition_jsx + content[insert_pos:]
            print("✅ FIX 2: Added THE (Trading Hub Europe) definition box")
        else:
            print("⚠️  FIX 2: Could not find insertion point for THE box")
    else:
        print("⚠️  FIX 2: Could not find closing div after TTF definition")
else:
    print("⚠️  FIX 2: Marker text not found — THE box not inserted")

with open(filepath, "w") as f:
    f.write(content)

print(f"\n📁 Patched: {filepath}")
print("Run: npm run build && git add . && git commit -m 'fix: distinguish TTF (European) from THE (German) gas benchmark' && git push")
