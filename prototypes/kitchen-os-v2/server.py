#!/usr/bin/env python3
"""Local-only staging server. NEVER connects to production signage."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
import json, os, shutil, tempfile, datetime

ROOT=Path(__file__).resolve().parent
DATA=ROOT/'data'
DRAFT=DATA/'draft.json'
APPROVED=DATA/'approved.json'
SEED=DATA/'seed.json'
MAX_BODY=1024*1024

def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))

def write_json(path, value):
    fd,tmp=tempfile.mkstemp(prefix='.draft-',dir=DATA)
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as f:
            json.dump(value,f,indent=2,ensure_ascii=False)
            f.flush();os.fsync(f.fileno())
        os.replace(tmp,path)
    finally:
        if os.path.exists(tmp): os.unlink(tmp)

def validate(payload):
    if not isinstance(payload,dict) or payload.get('schemaVersion')!=1: raise ValueError('Invalid schemaVersion')
    items=payload.get('items')
    if not isinstance(items,list) or not items or len(items)>500: raise ValueError('Invalid items')
    ids=set()
    for item in items:
        if not isinstance(item,dict): raise ValueError('Invalid item')
        key=item.get('id')
        if not isinstance(key,str) or not key or key in ids: raise ValueError('Missing or duplicate item ID')
        ids.add(key)
        if item.get('category') not in ('lunch','portions','specialties'): raise ValueError('Invalid category')
        if not isinstance(item.get('name'),str) or not 1<=len(item['name'])<=120: raise ValueError('Invalid name')
        price=item.get('price')
        if isinstance(price,bool) or not isinstance(price,(int,float)) or not 0<=price<=10000: raise ValueError('Invalid price')
        if round(price,2)!=price: raise ValueError('Price has more than two decimals')
        if item.get('status') not in ('confirmed','proposed','pending'): raise ValueError('Invalid status')
        if not isinstance(item.get('available'),bool): raise ValueError('Invalid availability')
    return True

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def send_json(self,data,status=200):
        body=json.dumps(data,ensure_ascii=False).encode()
        self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
    def do_GET(self):
        path=urlparse(self.path).path
        if path=='/api/draft': return self.send_json(read_json(DRAFT if DRAFT.exists() else SEED))
        if path=='/api/approved': return self.send_json(read_json(APPROVED) if APPROVED.exists() else {'items':[],'version':0})
        if path=='/api/health': return self.send_json({'mode':'STAGING_ONLY','productionConnected':False,'draftExists':DRAFT.exists(),'approvedExists':APPROVED.exists()})
        if path.startswith('/api/'): return self.send_json({'error':'Not found'},404)
        return super().do_GET()
    def do_POST(self):
        path=urlparse(self.path).path
        if path not in ('/api/draft','/api/approve','/api/reset'): return self.send_json({'error':'Not found'},404)
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length>MAX_BODY or length<2: raise ValueError('Invalid request size')
            payload=json.loads(self.rfile.read(length))
            if path=='/api/reset':
                if payload.get('confirm')!='RESET_DRAFT': raise ValueError('Reset confirmation required')
                write_json(DRAFT,read_json(SEED));return self.send_json({'ok':True})
            validate(payload)
            if path=='/api/draft':
                write_json(DRAFT,payload);return self.send_json({'ok':True,'message':'Draft saved locally'})
            if any(i['available'] and i['status']!='confirmed' for i in payload['items']): raise ValueError('Available items must be confirmed before approval')
            previous=read_json(APPROVED) if APPROVED.exists() else {'version':0}
            version=int(previous.get('version',0))+1
            payload['version']=version
            payload['approvedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
            payload['approvalScope']='LOCAL_PREVIEW_ONLY'
            if APPROVED.exists(): shutil.copy2(APPROVED,DATA/f'approved-v{version-1}.json')
            write_json(DRAFT,payload);write_json(APPROVED,payload)
            return self.send_json({'ok':True,'version':version,'message':'Approved local preview only; production untouched'})
        except (ValueError,KeyError,TypeError,json.JSONDecodeError) as e: return self.send_json({'error':str(e)},400)

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8765);args=p.parse_args()
    print(f'Anthony staging only: http://127.0.0.1:{args.port}/')
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
