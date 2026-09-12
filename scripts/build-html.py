"""Build the standalone English player from the editable source files."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
files = ['simulation.js', 'renderer.js', 'audio.js', 'player.js']
bundle = '\n\n'.join((root / 'src' / name).read_text(encoding='utf-8') for name in files)
template = (root / 'web' / 'template.html').read_text(encoding='utf-8')
marker = '/* BUNDLED_SOURCE */'
if template.count(marker) != 1:
    raise ValueError('The HTML template must contain exactly one bundle marker.')
(root / 'index.html').write_text(template.replace(marker, bundle), encoding='utf-8')
print('Built index.html. Open it in a browser and click Play.')
