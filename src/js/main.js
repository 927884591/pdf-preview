import * as pdfjsLib from "pdfjs-dist";

// 配置 worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.min.mjs";

let pdfDoc = null;
let pageNum = 1;
let scale = 1;
let canvas = document.getElementById("pdf-canvas");
let ctx = canvas.getContext("2d");

// 重置状态函数
function resetState() {
  pdfDoc = null;
  pageNum = 1;
  scale = 1;
  document.getElementById("page-num").textContent = "";
  document.getElementById("page-count").textContent = "";
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 加载PDF文件
async function loadPDF(file) {
  // 重置文件状态
  resetState();

  const fileReader = new FileReader();

  fileReader.onload = async function () {
    const typedarray = new Uint8Array(this.result);

    try {
      console.log("加载PDF文件");

      pdfDoc = await pdfjsLib.getDocument(typedarray).promise;
      document.getElementById("page-count").textContent = pdfDoc.numPages;
      renderPage(pageNum);
    } catch (error) {
      alert("无法加载PDF文件");
    }
  };

  fileReader.readAsArrayBuffer(file);
}

// 渲染页面
async function renderPage(num) {
  try {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    document.getElementById("page-num").textContent = num;
    console.log("渲染页面");
  } catch (error) {
    console.error("Error rendering page:", error);
    alert("渲染页面时出错");
  }
}

// 事件监听器
document.getElementById("file-input").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file && file.type === "application/pdf") {
    loadPDF(file);
  }
});

document.getElementById("prev-page").addEventListener("click", () => {
  if (pageNum <= 1) return;
  pageNum--;
  renderPage(pageNum);
});

document.getElementById("next-page").addEventListener("click", () => {
  if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
  pageNum++;
  renderPage(pageNum);
});

document.getElementById("zoom-select").addEventListener("change", (e) => {
  scale = parseFloat(e.target.value);
  renderPage(pageNum);
});

document.getElementById("download-btn").addEventListener("click", () => {
  if (!pdfDoc) return;
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});

document.getElementById("print-btn").addEventListener("click", () => {
  if (!pdfDoc) return;
  window.print();
});
