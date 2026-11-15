import re, sys, pathlib

src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).parent / "gem.html"
html = src.read_text(encoding="utf-8")
out = src.parent
(out / "css").mkdir(exist_ok=True)
(out / "js").mkdir(exist_ok=True)

# The three <style> blocks, in document order:
# 1) embedded fonts  2) compiled Tailwind utilities  3) custom app styles
style_names = ["fonts.css", "tailwind.css", "styles.css"]
style_blocks = list(re.finditer(r"<style>(.*?)</style>", html, re.S))
assert len(style_blocks) == len(style_names), f"Expected 3 <style> blocks, found {len(style_blocks)}"

# The single inline <script> (no src attribute)
script_block = re.search(r"<script>(.*?)</script>", html, re.S)
assert script_block, "No inline <script> found"

# Write the extracted files
for m, name in zip(style_blocks, style_names):
    (out / "css" / name).write_text(m.group(1).strip() + "\n", encoding="utf-8")
(out / "js" / "app.js").write_text(script_block.group(1).strip() + "\n", encoding="utf-8")

# Rebuild the HTML (replace from the end so earlier offsets stay valid)
replacements = [(script_block.start(), script_block.end(), '<script src="js/app.js"></script>')]
for m, name in zip(style_blocks, style_names):
    replacements.append((m.start(), m.end(), f'<link rel="stylesheet" href="css/{name}" />'))
for start, end, text in sorted(replacements, reverse=True):
    html = html[:start] + text + html[end:]

split_html = out / f"{src.stem}.split.html"
split_html.write_text(html, encoding="utf-8")
print(f"Done: {split_html.name}, css/fonts.css, css/tailwind.css, css/styles.css, js/app.js")