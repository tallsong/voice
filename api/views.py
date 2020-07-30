from django.shortcuts import render
from django.views.generic import View
from django.http import Http404, HttpResponseRedirect,HttpResponse,JsonResponse
from django.template import  RequestContext,loader
import re
from django.core.paginator import Paginator,EmptyPage,PageNotAnInteger
from django.core.cache import cache
from django.urls import reverse
from django.db import transaction
from django.views.decorators.cache import cache_page


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


def voice(fileid):  
    x_appid = '5f1e8785'
    api_key = '9578a76b042b78f7c7a66efd2b26875e'
    curTime = str(int(time.time()))
    url = 'http://api.xfyun.cn/v1/service/v1/ise'
    text = "不管我的梦想能否成为事实"
    #AUDIO_PATH = r"D:\12498\code\voice\media\{}.oga".format(fileid)
    AUDIO_PATH = r"D:\12498\code\voice\media\cn_sentence.wav"
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
    print(result)
    with open('res.json','w',encoding='utf-8') as f:
        f.write(result)
    return result






class IndexView(View):
    def get(self, request):
        template = loader.get_template('index.html')
        context={'universities':'',
             'pages':''}
        return render(request, 'index.html', context)  
    def post(self, request):
        data=request.FILES.get('data')
        #print(voice(data.read()))
        print(request.FILES)
        fileid = time.time()
        # with(open('./a.oga','wb+')) as f:
        #     f.write(data.read())
        path = default_storage.save( "media/{}.oga".format(fileid), ContentFile(data.read()))
        tmp_file = os.path.join(settings.MEDIA_ROOT, path)
        #return JsonResponse({'res':2, 'msg':'df'})
        return JsonResponse({'res':2, 'msg':voice(fileid)})