function upload(text) {
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

      player.src = audioURL;
      console.log(myblob);
      recordBtn.textContent = "synthesise";


    }
  };
}
//https://www.freesion.com/article/5984902147/

const recordBtn = document.querySelector(".record-btn");
const player = document.querySelector(".audio-player");

recordBtn.onclick = () => {
  if (recordBtn.textContent === "synthesise") {
    var evaluate_tex = document.getElementById('evaluate_text');
    console.log(evaluate_tex.value.length)
    if (evaluate_tex.value.length > 0) {
      upload(evaluate_tex.value);
    } else {
      alert("请输入测评文本")
    }
    recordBtn.textContent = "synthesising";
    console.log("录音结束");


  } else {
    console.log("不要急慢慢来...");
  }

};