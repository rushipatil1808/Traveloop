import os
import sys
print('cwd:', os.getcwd())
print('sys.path[0]:', sys.path[0])
try:
    import app.main
    print('import app.main ok')
except Exception as e:
    print('import app.main failed:', type(e).__name__, e)
    raise
