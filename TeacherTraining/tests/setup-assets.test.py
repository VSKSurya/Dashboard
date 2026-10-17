"""Offline fixture verifies header whitespace and no-index-change failure behavior."""
from pathlib import Path
import tempfile, runpy, urllib.request
from unittest.mock import patch
script=Path(__file__).resolve().parents[1]/'setup-assets.py'
class Response:
 def __init__(self,data):self.data=data
 def __enter__(self):return self
 def __exit__(self,*args):pass
 def read(self):return self.data
with tempfile.TemporaryDirectory() as folder:
 root=Path(folder); (root/'assets/vendor').mkdir(parents=True)
 source=script.read_text();(root/'setup-assets.py').write_text(source)
 urls=['https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css','https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js','https://code.jquery.com/jquery-4.0.0.min.js']
 original='\n'.join(urls);(root/'index.html').write_text(original)
 def fetch(url,timeout):
  url=url.full_url if isinstance(url,urllib.request.Request) else url
  if 'bootstrap' in url:return Response(b'/*! Bootstrap v5.3.8 */'+b' '*100000)
  return Response(b'/*! jQuery v4.0.0 */'+b' '*50000)
 with patch.object(urllib.request,'urlopen',fetch):runpy.run_path(str(root/'setup-assets.py'),run_name='__main__')
 assert 'assets/vendor/bootstrap-5.3.8.min.css' in (root/'index.html').read_text()
 assert len([p for p in (root/'assets/vendor').rglob('*') if p.is_file()])==3
 (root/'index.html').write_text(original)
 with patch.object(urllib.request,'urlopen',lambda *args,**kwargs:Response(b'Unexpected response')):
  try:runpy.run_path(str(root/'setup-assets.py'),run_name='__main__')
  except SystemExit as error:assert 'No index changes made' in str(error)
  else:raise AssertionError('Invalid response accepted')
 assert (root/'index.html').read_text()==original
print('Asset setup fixture passed: whitespace normalization and unchanged index on invalid response. Network fetch not verified.')
