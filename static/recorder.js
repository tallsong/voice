function upload(data) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.open('POST', '/'); 
  //httpRequest.setRequestHeader("Content-type",'application/octet-stream');
  var formData = new FormData();
  formData.append("data",data);
  formData.append("action",'fuck');
  console.log(formData.get('data'));
  httpRequest.send(formData);
  
  httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
      var json = httpRequest.responseText;//获取到服务端返回的数据
      console.log(data)
      console.log(json);
    }
  };
}


const recordBtn = document.querySelector(".record-btn");
const player = document.querySelector(".audio-player");

if (navigator.mediaDevices.getUserMedia) {
  var chunks = [];
  const constraints = { audio: true };
  navigator.mediaDevices.getUserMedia(constraints).then(
    stream => {
      console.log("授权成功！");

      const mediaRecorder = new MediaRecorder(stream);

      recordBtn.onclick = () => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          recordBtn.textContent = "record";
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
        var blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        console.log(Blob);
        upload(blob);
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
