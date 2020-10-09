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
      console.log( score)
      alert("总分是" + score)

    }
  };
}
//https://www.freesion.com/article/5984902147/

const recordBtn = document.querySelector(".record-btn");
const player = document.querySelector(".audio-player");

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
          mediaRecorder.stop();
          recordBtn.textContent = "record";
          //console.log(mediaRecorder.audioBitsPerSecond)
          console.log("录音结束");


        } else {
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


function removeBgc(){
  Array.from(td).forEach(function (element){
    if (element.hasAttribute("value")) {
      element.style.backgroundColor= 'transparent';
    }
  });
}

Array.from(td).forEach(function (element) {
  element.addEventListener("click", function () {
    if (element.hasAttribute("value")) {
      evaluate_text.setAttribute("value", element.innerHTML);
      removeBgc()
      element.style.backgroundColor = "green"

    }

  });
});



const recordBtn_synthesis = document.querySelector(".record_btn_synthesis");
const player_synthesis = document.querySelector(".audio-player_synthesis");

function download_synthesis(text,player) {
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
      recordBtn_synthesis.textContent = "synthesise";


    }
  };
}
//https://www.freesion.com/article/5984902147/



recordBtn_synthesis.onclick = () => {
  if (recordBtn_synthesis.textContent === "synthesise") {
    var evaluate_tex = document.getElementById('evaluate_text_synthesis');
    console.log(evaluate_tex.value.length)
    if (evaluate_tex.value.length > 0) {
      download_synthesis(evaluate_tex.value,player_synthesis);
    } else {
      alert("请输入测评文本")
    }
    recordBtn_synthesis.textContent = "synthesising";
    console.log("录音结束");


  } else {
    console.log("不要急慢慢来...");
  }

};


