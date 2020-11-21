let watermark = {};

let setWatermark = ({ id, content }) => {
  if (document.getElementById(id) !== null) {
    document.body.removeChild(document.getElementById(id));
  }

  //创建一个画布
  let can = document.createElement('canvas');
  //设置画布的长宽
  can.width = document.documentElement.clientWidth;
  can.height = document.documentElement.clientHeight;

  let cans = can.getContext('2d');
  //旋转角度
  cans.font = '200px Vedana';
  //设置填充绘画的颜色、渐变或者模式
  cans.fillStyle = 'rgba(230, 230, 232, 0.4)';
  //设置文本内容的当前对齐方式
  cans.textAlign = 'center';
  //在画布上绘制填色的文本（输出的文本，开始绘制文本的X坐标位置，开始绘制文本的Y坐标位置）
  cans.fillText(content, can.width / 2, can.height / 2 + 100);
  let div = document.createElement('div');
  div.id = id;
  div.style.pointerEvents = 'none';
  div.style.top = '0';
  div.style.left = '0';
  div.style.position = 'fixed';
  div.style.zIndex = '0';
  div.style.width = document.documentElement.clientWidth + 'px';
  div.style.height = document.documentElement.clientHeight + 'px';
  div.style.background = 'url(' + can.toDataURL('image/png') + ')';
  document.body.appendChild(div);
};

// 使用：watermark.set({ contnet: '水印内容' })
watermark.set = ({ id = 'watermark-ljw', content }) => {
  if (!content) {
    return;
  }
  setWatermark({ id, content });
  window.onresize = () => {
    setWatermark({ id, content });
  };
};

export default watermark;
