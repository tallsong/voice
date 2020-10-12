var rec, wave, recBlob;
/**调用open打开录音请求好录音权限**/
function recOpen() {//一般在显示出录音按钮或相关的录音界面时进行此方法调用，后面用户点击开始录音时就能畅通无阻了
  rec = null;
  wave = null;
  recBlob = null;
  var newRec = Recorder({
    type: "mp3", sampleRate: 16000, bitRate: 16 //mp3格式，指定采样率hz、比特率kbps，其他参数使用默认配置；注意：是数字的参数必须提供数字，不要用字符串；需要使用的type类型，需提前把格式支持文件加载进来，比如使用wav格式需要提前加载wav.js编码引擎
    , onProcess: function (buffers, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd) {
      //录音实时回调，大约1秒调用12次本回调
      document.querySelector(".recpowerx").style.width = powerLevel + "%";
      document.querySelector(".recpowert").innerText = bufferDuration + " / " + powerLevel;

      //可视化图形绘制
      wave.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate);
    }
  });

  createDelayDialog(); //我们可以选择性的弹一个对话框：为了防止移动端浏览器存在第三种情况：用户忽略，并且（或者国产系统UC系）浏览器没有任何回调，此处demo省略了弹窗的代码
  newRec.open(function () {//打开麦克风授权获得相关资源
    dialogCancel(); //如果开启了弹框，此处需要取消

    rec = newRec;
    console.log(rec);

    //此处创建这些音频可视化图形绘制浏览器支持妥妥的
    wave = Recorder.FrequencyHistogramView({ elem: ".recwave" });
    console.log(rec);
    reclog("已打开录音，可以点击录制开始录音了", 2);
    console.log(rec);
  }, function (msg, isUserNotAllow) {//用户拒绝未授权或不支持
    console.log(rec);
    dialogCancel(); //如果开启了弹框，此处需要取消
    reclog((isUserNotAllow ? "UserNotAllow，" : "") + "打开录音失败：" + msg, 1);
  });
  console.log(rec);
  window.waitDialogClick = function () {
    dialogCancel();
    reclog("打开失败：权限请求被忽略，<span style='color:#f00'>用户主动点击的弹窗</span>", 1);
  };
};



/**关闭录音，释放资源**/
function recClose() {
  if (rec) {
    rec.close();
    reclog("已关闭");
  } else {
    reclog("未打开录音", 1);
  };
};



/**开始录音**/
function recStart() {//打开了录音后才能进行start、stop调用
  console.log(rec);
  if (rec && Recorder.IsOpen()) {
    recBlob = null;
    rec.start();
    reclog("已开始录音...");
  } else {
    reclog("未打开录音", 1);
  };
};

/**暂停录音**/
function recPause() {
  if (rec && Recorder.IsOpen()) {
    rec.pause();
  } else {
    reclog("未打开录音", 1);
  };
};
/**恢复录音**/
function recResume() {
  if (rec && Recorder.IsOpen()) {
    rec.resume();
  } else {
    reclog("未打开录音", 1);
  };
};

/**结束录音，得到音频文件**/
function recStop() {
  if (!(rec && Recorder.IsOpen())) {
    reclog("未打开录音", 1);
    return;
  };
  rec.stop(function (blob, duration) {
    console.log(blob, (window.URL || webkitURL).createObjectURL(blob), "时长:" + duration + "ms");

    recBlob = blob;
    reclog("已录制mp3：" + duration + "ms " + blob.size + "字节，可以点击播放、上传了", 2);
  }, function (msg) {
    reclog("录音失败:" + msg, 1);
  });
};









/**播放**/
function recPlay() {
  if (!recBlob) {
    reclog("请先录音，然后停止后再播放", 1);
    return;
  };
  var cls = ("a" + Math.random()).replace(".", "");
  reclog('播放中: <span class="' + cls + '"></span>');
  var audio = document.createElement("audio");
  audio.controls = true;
  document.querySelector("." + cls).appendChild(audio);
  //简单利用URL生成播放地址，注意不用了时需要revokeObjectURL，否则霸占内存
  audio.src = (window.URL || webkitURL).createObjectURL(recBlob);
  audio.play();

  setTimeout(function () {
    (window.URL || webkitURL).revokeObjectURL(audio.src);
  }, 5000);
};

/**上传**/
function recUpload() {
  var blob = recBlob;
  if (!blob) {
    reclog("请先录音，然后停止后再上传", 1);
    return;
  };

  //本例子假设使用原始XMLHttpRequest请求方式，实际使用中自行调整为自己的请求方式
  //录音结束时拿到了blob文件对象，可以用FileReader读取出内容，或者用FormData上传
  var api = "https://xx.xx/test_request";
  var onreadystatechange = function (title) {
    return function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          reclog(title + "上传成功", 2);
        } else {
          reclog(title + "没有完成上传，演示上传地址无需关注上传结果，只要浏览器控制台内Network面板内看到的请求数据结构是预期的就ok了。", "#d8c1a0");

          console.error(title + "上传失败", xhr.status, xhr.responseText);
        };
      };
    };
  };
  reclog("开始上传到" + api + "，请求稍后...");

  /***方式一：将blob文件转成base64纯文本编码，使用普通application/x-www-form-urlencoded表单上传***/
  var reader = new FileReader();
  reader.onloadend = function () {
    var postData = "";
    postData += "mime=" + encodeURIComponent(blob.type);//告诉后端，这个录音是什么格式的，可能前后端都固定的mp3可以不用写
    postData += "&upfile_b64=" + encodeURIComponent((/.+;\s*base64\s*,\s*(.+)$/i.exec(reader.result) || [])[1]) //录音文件内容，后端进行base64解码成二进制
    //...其他表单参数

    var xhr = new XMLHttpRequest();
    xhr.open("POST", api);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = onreadystatechange("上传方式一【Base64】");
    xhr.send(postData);
  };
  reader.readAsDataURL(blob);

  /***方式二：使用FormData用multipart/form-data表单上传文件***/
  var form = new FormData();
  form.append("upfile", blob, "recorder.mp3"); //和普通form表单并无二致，后端接收到upfile参数的文件，文件名为recorder.mp3
  //...其他表单参数

  var xhr = new XMLHttpRequest();
  xhr.open("POST", api);
  xhr.onreadystatechange = onreadystatechange("上传方式二【FormData】");
  xhr.send(form);
};



function tttt(){
  recOpen();
  recStart();
}






//recOpen我们可以选择性的弹一个对话框：为了防止移动端浏览器存在第三种情况：用户忽略，并且（或者国产系统UC系）浏览器没有任何回调
var showDialog = function () {
  if (!/mobile/i.test(navigator.userAgent)) {
    return;//只在移动端开启没有权限请求的检测
  };
  dialogCancel();

  //显示弹框，应该使用自己的弹框方式
  var div = document.createElement("div");
  document.body.appendChild(div);
  div.innerHTML = (''
    + '<div class="waitDialog" style="z-index:99999;width:100%;height:100%;top:0;left:0;position:fixed;background:rgba(0,0,0,0.3);">'
    + '<div style="display:flex;height:100%;align-items:center;">'
    + '<div style="flex:1;"></div>'
    + '<div style="width:240px;background:#fff;padding:15px 20px;border-radius: 10px;">'
    + '<div style="padding-bottom:10px;">录音功能需要麦克风权限，请允许；如果未看到任何请求，请点击忽略~</div>'
    + '<div style="text-align:center;"><a onclick="waitDialogClick()" style="color:#0B1">忽略</a></div>'
    + '</div>'
    + '<div style="flex:1;"></div>'
    + '</div>'
    + '</div>');
};
var createDelayDialog = function () {
  dialogInt = setTimeout(function () {//定时8秒后打开弹窗，用于监测浏览器没有发起权限请求的情况，在open前放置定时器利于收到了回调能及时取消（不管open是同步还是异步回调的）
    showDialog();
  }, 8000);
};
var dialogInt;
var dialogCancel = function () {
  clearTimeout(dialogInt);

  //关闭弹框，应该使用自己的弹框方式
  var elems = document.querySelectorAll(".waitDialog");
  for (var i = 0; i < elems.length; i++) {
    elems[i].parentNode.removeChild(elems[i]);
  };
};
//recOpen弹框End











function reclog(s, color) {
  var now = new Date();
  var t = ("0" + now.getHours()).substr(-2)
    + ":" + ("0" + now.getMinutes()).substr(-2)
    + ":" + ("0" + now.getSeconds()).substr(-2);
  var div = document.createElement("div");
  var elem = document.querySelector(".reclog");
  console.log( '<div style="color:' + (!color ? "" : color == 1 ? "red" : color == 2 ? "#0b1" : color) + '">[' + t + ']' + s + '</div>');
};







const recordBtn = document.querySelector(".record-btn");
const player = document.querySelector(".audio-player");
const recordBtn_synthesis = document.querySelector(".record_btn_synthesis");
const player_synthesis = document.querySelector(".audio-player_synthesis");

function upload(data, text) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.open('POST', '/');
  //httpRequest.setRequestHeader("Content-type",'application/octet-stream');
  var formData = new FormData();
  formData.append("data", data);
  formData.append("text", text);
  console.log(formData.get('data'));
  httpRequest.send(formData);

  httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
      var json = httpRequest.responseText;//获取到服务端返回的数据
      var score = JSON.parse(json).data.read_sentence.rec_paper.read_sentence.sentence.total_score;
      console.log(score)
      alert("总分是" + score)

    }
  };
}

//https://www.freesion.com/article/5984902147/
if (navigator.mediaDevices.getUserMedia) {
  var chunks = [];
  const constraints = { audio: true };
  navigator.mediaDevices.getUserMedia(constraints).then(
    stream => {
      console.log("授权成功！");
      var options = {
        //audioBitsPerSecond : 256000,   //比特率（音频位速、码率）
        //sampleRate:16000,
        //mimeType : 'audio/wav'

        sampleBits: 16,     // 采样位数，范围8或16
        sampleRate: 16000,   // 采样率，范围11025、16000、22050、24000、44100、48000
        numChannels: 1,     // 声道，范围1或2
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      //mediaRecorder.setAudioSampleRate =16000;//音频采样率
      //mediaRecorder.setAudioSampleRate (16000);

      recordBtn.onclick = () => {
        if (mediaRecorder.state === "recording") {
          recStop();
          mediaRecorder.stop();
          recordBtn.textContent = "record";
          //console.log(mediaRecorder.audioBitsPerSecond)
          console.log("录音结束");


        } else {
          recStart();
          mediaRecorder.start();
          console.log("录音中...");
          recordBtn.textContent = "stop";
        }
        console.log("录音器状态：", mediaRecorder.state);
      };

      mediaRecorder.ondataavailable = e => {
        chunks.push(e.data);
      };
      mediaRecorder.onstop = e => {
        var blob = new Blob(chunks, { type: "audio/ogg;codecs=opus" });  //编解码器为opus
        //console.log(Blob);
        var evaluate_tex = document.getElementById('evaluate_text');
        console.log(evaluate_tex.value.length)
        if (evaluate_tex.value.length > 0) {
          upload(blob, evaluate_tex.value);
        } else {
          alert("请输入测评文本")
        }
        chunks = [];
        var audioURL = window.URL.createObjectURL(blob);

        player.src = audioURL;

      };
    },
    () => {
      console.error("授权失败！");
    }
  );
} else {
  console.error("浏览器不支持 getUserMedia");
}
var td = document.getElementsByTagName("td");


function removeBgc(td) {
  Array.from(td).forEach(function (element) {
    if (element.hasAttribute("value")) {
      element.style.backgroundColor = 'transparent';
    }
  });
}

Array.from(td).forEach(function (element) {
  element.addEventListener("click", function () {
    if (element.hasAttribute("value")) {
      evaluate_text.setAttribute("value", element.innerHTML);
      removeBgc(td)
      element.style.backgroundColor = "green"

    }

  });
});





function download_synthesis(text, player, recordBtn) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.responseType = "blob";
  httpRequest.open('POST', '/index2');
  //httpRequest.setRequestHeader("Content-type",'application/octet-stream');
  var formData = new FormData();
  formData.append("text", text);
  httpRequest.send(formData);

  httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
      var myblob = httpRequest.response;//获取到服务端返回的数据
      var audioURL = window.URL.createObjectURL(myblob);
      console.log(audioURL);
      player.src = audioURL;
      console.log(myblob);
      recordBtn.textContent = "synthesise";

    }
  };
}
//https://www.freesion.com/article/5984902147/



recordBtn_synthesis.onclick = () => {
  if (recordBtn_synthesis.textContent === "synthesise") {
    var evaluate_tex = document.getElementById('evaluate_text_synthesis');
    console.log(evaluate_tex.value.length)
    if (evaluate_tex.value.length > 0) {
      download_synthesis(evaluate_tex.value, player_synthesis, recordBtn_synthesis);
    } else {
      alert("请输入测评文本")
    }
    recordBtn_synthesis.textContent = "synthesising";
    console.log("录音结束");
  } else {
    console.log("不要急慢慢来...");
  }
};
window.onload=function(){
  recOpen();
}

