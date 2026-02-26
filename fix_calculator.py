import re

with open("components/tools/CalculatorEngine.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace colorMap
c_map_str = """    const colorMap: Record<string, { primary: string; bg: string; border: string; ring: string; text: string; light: string }> = {
        // Redefined to use True Dark theme (Black/White/Neutral)
        default: { primary: 'bg-white hover:bg-neutral-200 text-black', bg: 'bg-white/5', border: 'border-white/10', ring: 'focus:ring-white focus:border-white', text: 'text-white', light: 'bg-white/10 text-white' }
    }
    const c = colorMap.default"""

code = re.sub(
    r"const colorMap: Record<string, \{.*?\}> = \{.*?\n\s+const c = colorMap.*?\|\| colorMap\.violet",
    c_map_str,
    code,
    flags=re.DOTALL
)

# Text replacements
replacements = {
    "bg-slate-950": "bg-black",
    "bg-slate-900/50": "bg-[#0A0A0A]",
    "bg-slate-900/20": "bg-white/[0.02]",
    "bg-slate-900/95": "bg-[#0A0A0A]/95",
    "bg-slate-800": "bg-neutral-800",
    "bg-slate-800/50": "bg-white/5",
    "text-slate-100": "text-white",
    "text-slate-200": "text-neutral-200",
    "text-slate-300": "text-neutral-300",
    "text-slate-400": "text-neutral-400",
    "text-slate-500": "text-neutral-500",
    "text-slate-600": "text-neutral-600",
    "border-slate-500": "border-neutral-500",
    "bg-emerald-500/5": "bg-[#0A0A0A]",
    "bg-amber-500/5": "bg-[#0A0A0A]",
    "bg-red-500/5": "bg-[#0A0A0A]",
}

for old, new in replacements.items():
    code = code.replace(old, new)

with open("components/tools/CalculatorEngine.tsx", "w", encoding="utf-8") as f:
    f.write(code)
