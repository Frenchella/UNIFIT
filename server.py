
import json, sqlite3, secrets, hashlib, hmac, time, getpass, os
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from http.cookies import SimpleCookie

ROOT = Path(__file__).resolve().parent
DB = sqlite3.connect(ROOT / 'private.sqlite3')
DB.execute('CREATE TABLE IF NOT EXISTS account (username TEXT, salt TEXT, digest TEXT)')
DB.execute('CREATE TABLE IF NOT EXISTS records (kind TEXT, id TEXT PRIMARY KEY, body TEXT)')
DB.execute('CREATE TABLE IF NOT EXISTS student (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, digest TEXT NOT NULL, profile TEXT NOT NULL)')
SESSIONS = {}
STUDENT_SESSIONS = {}
FAILURES = []
def digest(password, salt):
    return hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()
def save(kind, record):
    DB.execute('INSERT OR REPLACE INTO records VALUES (?,?,?)', (kind,record['id'],json.dumps(record)))
    DB.commit()
def records(kind):
    return [json.loads(r[0]) for r in DB.execute('SELECT body FROM records WHERE kind=? ORDER BY rowid DESC',(kind,))]

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT/'public'),**kwargs)
    def reply(self,code,data,cookie=None):
        self.send_response(code)
        self.send_header('Content-Type','application/json')
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        if cookie: self.send_header('Set-Cookie',cookie)
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    def authorized(self):
        cookie=SimpleCookie(self.headers.get('Cookie',''))
        token=cookie.get('unifit_admin')
        return token and SESSIONS.get(token.value,0)>time.time()
    def student_user(self):
        cookie=SimpleCookie(self.headers.get('Cookie',''))
        token=cookie.get('unifit_student')
        if not token: return None
        session=STUDENT_SESSIONS.get(token.value)
        if not session or session[1]<=time.time(): return None
        row=DB.execute('SELECT id,email,profile FROM student WHERE id=?',(session[0],)).fetchone()
        if not row: return None
        user=json.loads(row[2])
        user.update(id=row[0],email=row[1])
        return user
    def do_GET(self):
        if self.path=='/api/student-session':
            user=self.student_user()
            if not user: return self.reply(401,{'error':'Please log in.'})
            return self.reply(200,{'user':user})
        if self.path=='/api/my-orders':
            user=self.student_user()
            if not user: return self.reply(401,{'error':'Please log in to view your orders.'})
            orders=[order for order in records('order') if order.get('ownerId')==user['id']]
            orders.sort(key=lambda o:o.get('updatedAt',o.get('orderDate','')),reverse=True)
            return self.reply(200,{'orders':orders})
        if self.path.startswith('/api/'):
            if not self.authorized(): return self.reply(401,{'error':'Please log in.'})
            return self.reply(200,{'orders':records('order'),'messages':records('message')})
        super().do_GET()
    def do_POST(self):
        if self.headers.get('Origin') != 'http://'+self.headers.get('Host',''):
            return self.reply(403,{'error':'Invalid origin.'})
        try:
            size=int(self.headers.get('Content-Length','0'))
            if size>200000: return self.reply(413,{'error':'Request too large.'})
            data=json.loads(self.rfile.read(size))
            if not isinstance(data,dict): raise ValueError()
            self.action(data)
        except (ValueError,KeyError,TypeError): self.reply(400,{'error':'Invalid request.'})
    def action(self,data):
        if self.path=='/api/student-register':
            fields=('firstName','lastName','studentNumber','contactNumber','email','password')
            if any(not isinstance(data.get(key),str) or not data[key].strip() for key in fields): raise ValueError()
            email=data['email'].strip().lower()
            password=data['password']
            if len(email)>254 or len(password)<6 or len(password)>256: raise ValueError()
            profile={key:data[key].strip() for key in ('firstName','lastName','studentNumber','contactNumber')}
            if DB.execute('SELECT 1 FROM student WHERE email=?',(email,)).fetchone():
                return self.reply(409,{'error':'An account with this email already exists. Please log in.'})
            ident=secrets.token_hex(16)
            salt=secrets.token_hex(16)
            try:
                DB.execute('INSERT INTO student VALUES (?,?,?,?,?)',(ident,email,salt,digest(password,salt),json.dumps(profile)))
                DB.commit()
            except sqlite3.IntegrityError:
                return self.reply(409,{'error':'An account with this email already exists. Please log in.'})
            return self.reply(201,{'ok':True})
        if self.path=='/api/student-login':
            email=str(data.get('email','')).strip().lower()
            password=str(data.get('password',''))
            row=DB.execute('SELECT id,email,salt,digest,profile FROM student WHERE email=?',(email,)).fetchone()
            if not row:
                return self.reply(404,{'error':'No student account is registered on this server. Create the account from this localhost site first.'})
            if not hmac.compare_digest(digest(password,row[2]),row[3]):
                return self.reply(401,{'error':'Incorrect password.'})
            token=secrets.token_urlsafe(32)
            STUDENT_SESSIONS[token]=(row[0],time.time()+43200)
            user=json.loads(row[4])
            user.update(id=row[0],email=row[1])
            cookie=f'unifit_student={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200'
            return self.reply(200,{'ok':True,'user':user},cookie)
        if self.path=='/api/student-logout':
            cookie=SimpleCookie(self.headers.get('Cookie',''))
            token=cookie.get('unifit_student')
            if token: STUDENT_SESSIONS.pop(token.value,None)
            return self.reply(200,{'ok':True},'unifit_student=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0')
        if self.path=='/api/my-orders':
            user=self.student_user()
            if not user: return self.reply(401,{'error':'Please log in to view your orders.'})
            orders=[order for order in records('order') if order.get('ownerId')==user['id']]
            orders.sort(key=lambda o:o.get('updatedAt',o.get('orderDate','')),reverse=True)
            return self.reply(200,{'orders':orders})
        if self.path=='/api/login':
            FAILURES[:]=[t for t in FAILURES if t>time.time()-300]
            if len(FAILURES)>=10: return self.reply(429,{'error':'Too many attempts. Try again in 5 minutes.'})
            user,salt,hashed=DB.execute('SELECT * FROM account').fetchone()
            if not (hmac.compare_digest(str(data.get('username','')),user) and hmac.compare_digest(digest(str(data.get('password','')),salt),hashed)):
                FAILURES.append(time.time())
                return self.reply(401,{'error':'Incorrect username or password.'})
            token=secrets.token_urlsafe(32)
            SESSIONS[token]=time.time()+3600
            return self.reply(200,{'ok':True},f'unifit_admin={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600')
        if self.path=='/api/orders':
            user=self.student_user()
            if not user: return self.reply(401,{'error':'Please log in before placing an order.'})
            if not data.get('orderNumber') or not isinstance(data.get('items'),list): raise ValueError()
            ident=str(data['orderNumber'])[:100]
            if not DB.execute('SELECT 1 FROM records WHERE id=?',(ident,)).fetchone():
                data.update(id=ident,ownerId=user['id'],status='Payment Verification',unread=True)
                save('order',data)
            return self.reply(200,{'ok':True})
        if self.path=='/api/messages':
            for key in ('name','email','text'):
                if not isinstance(data.get(key),str) or not data[key].strip() or len(data[key])>4000: raise ValueError()
            data.update(id=secrets.token_hex(12),unread=True,date=time.strftime('%Y-%m-%d %H:%M'))
            save('message',data)
            return self.reply(200,{'ok':True})
        if not self.authorized(): return self.reply(401,{'error':'Please log in again.'})
        if self.path=='/api/logout':
            cookie=SimpleCookie(self.headers.get('Cookie',''))
            if cookie.get('unifit_admin'): SESSIONS.pop(cookie['unifit_admin'].value,None)
            return self.reply(200,{'ok':True},'unifit_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0')
        if self.path=='/api/update':
            row=DB.execute('SELECT kind,body FROM records WHERE id=?',(data['id'],)).fetchone()
            if not row: return self.reply(404,{'error':'Record not found.'})
            kind,body=row
            record=json.loads(body)
            if 'status' in data:
                if kind!='order' or data['status'] not in ['Payment Verification','Processing','Ready for Pickup','Completed','Cancelled']: raise ValueError()
                if record['status'] in ['Completed','Cancelled']: return self.reply(400,{'error':'This order is already closed.'})
                if data['status']=='Cancelled' and not str(data.get('reason','')).strip(): raise ValueError()
                record.update(status=data['status'],reason=str(data.get('reason',''))[:1000],updatedAt=__import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat())
            record['unread']=False
            save(kind,record)
            return self.reply(200,{'ok':True})
        self.reply(404,{'error':'Not found.'})

if __name__=='__main__':
    if not DB.execute('SELECT 1 FROM account').fetchone():
        print('Create your private admin account (stored outside public files).')
        username=input('Admin username: ').strip()
        password=getpass.getpass('Admin password (at least 12 characters): ')
        if not username or len(password)<12: raise SystemExit('Username required; password must have at least 12 characters.')
        if password!=getpass.getpass('Confirm password: '): raise SystemExit('Passwords do not match.')
        salt=secrets.token_hex(16)
        DB.execute('INSERT INTO account VALUES (?,?,?)',(username,salt,digest(password,salt)))
        DB.commit()
    print('Open http://localhost:8000/login.html — press Ctrl+C to stop.')
    HTTPServer(('127.0.0.1',8000),Handler).serve_forever()
