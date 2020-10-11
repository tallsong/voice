# This is a website that test xunfei voice API
# deployment
`pip install -r requirements.txt`
## deploy by asgi **[recommend]**

```bash
apt install supervisord

cp supervisord.conf  /etc/supervisor/conf.d/supervisord.conf

supervisorctl update  

supervisorctl start uvicorn:*

supervisorctl stop uvicorn:*

supervisorctl restart uvicorn:*

cp supervisord.voice.conf /etc/nginx/conf.d/supervisord.voice.conf

nginx -s reload
 ```
## deploy by wsgi
```bash
cp api.voice.conf /etc/nginx/conf.d/api.voice.conf 

uwsgi --ini uwsgi.ini
```
