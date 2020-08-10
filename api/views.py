from django.shortcuts import render
from django.views.generic import View
from django.http import Http404, HttpResponseRedirect,HttpResponse,JsonResponse,FileResponse
from django.template import loader
import re
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings

# Create your views here.
import base64
import hashlib
import json
import time

import requests











def voice(fileid,text):  
    x_appid = '5f1e8785'
    api_key = '9578a76b042b78f7c7a66efd2b26875e'
    curTime = str(int(time.time()))
    url = 'http://api.xfyun.cn/v1/service/v1/ise'
    AUDIO_PATH = r"./media/{}.wav".format(fileid)
    #AUDIO_PATH = r"D:\12498\code\voice\media\out.wav"
    os.system("ffmpeg -i ./media/{}.webm -c:a pcm_s16le -ar 16000 -y  ./media/{}.wav".format(fileid,fileid))
    print("ffmpeg -i ./media/{}.webm -c:a pcm_s16le -ar 16000 -y  ./media/{}.wav".format(fileid,fileid))
    print(AUDIO_PATH)
    with open(AUDIO_PATH, 'rb') as f:
        file_content = f.read()
    base64_audio = base64.b64encode(file_content)
    body = {'audio': base64_audio, 'text': text}
    param = json.dumps({"aue": "raw", "result_level": "simple", "language": "zh_cn", "category": "read_sentence"})
    paramBase64 = str(base64.b64encode(param.encode('utf-8')), 'utf-8')
    m2 = hashlib.md5()
    m2.update((api_key + curTime + paramBase64).encode('utf-8'))
    checkSum = m2.hexdigest()
    x_header = {
                'X-Appid': x_appid,
                'X-CurTime': curTime,
                'X-Param': paramBase64,
                'X-CheckSum': checkSum,
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                }
    req = requests.post(url, data=body, headers=x_header)
    result = req.content.decode('utf-8')
    #print(result)
    with open('res.json','w',encoding='utf-8') as f:
        f.write(result)
    return  json.loads(result)
# sudo ffmpeg -i 1596806745.5859797.wav -c:a pcm_s16le -ar 16000 -y  ./out.wav






class IndexView(View):
    def get(self, request):
        template = loader.get_template('index.html')
        return render(request, 'index.html')  
    def post(self, request):
        data=request.FILES.get('data')
        #print(voice(data.read()))
        #print(request.FILES)
        text=request.POST.get("text")
        fileid = time.time()
        # with(open('./a.wav','wb+')) as f:
        #     f.write(data.read())
        path = default_storage.save( "media/{}.webm".format(fileid), ContentFile(data.read()))
        tmp_file = os.path.join(settings.MEDIA_ROOT, path)
        #return JsonResponse({'res':2, 'msg':'df'})
        return JsonResponse(voice(fileid,text))



class Index2View(View):
    def get(self, request):
        template = loader.get_template('index2.html')
        return render(request, 'index2.html')  
    def post(self, request):
        text=request.POST.get("text")
        os.system("python3 ./media/tts_ws_python3_demo.py {}".format(text))
        return FileResponse(open('demo.mp3', 'rb'))

