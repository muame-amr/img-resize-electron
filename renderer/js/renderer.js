const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

// console.log(versions.electron())

function loadImage(e) {
  const imgFile = e.target.files[0];

  if (!isFileImage(imgFile)) {
    alertMsg('Please pick an image !', false);
    return;
  }

  // Get original dimensions
  const image = new Image();
  image.src = URL.createObjectURL(imgFile);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  console.log(img.files[0].name);
  form.style.display = 'block';
  filename.innerHTML = img.files[0].name;
  outputPath.innerText = path.join(os.homedir(), 'imageresizer');
}

function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if (!img.files[0]) {
    alertMsg('Please upload an image!', false);
    return;
  }

  if (width === '' || height === '') {
    alertMsg('Please fill in image height and width!', false);
    return;
  }

  // Send to main using ipcRenderer
  ipcRenderer.send('image:resize', {
    imgPath,
    height,
    width
  });
}

ipcRenderer.on('image:done', () => {
  alertMsg(`Image resized to ${widthInput.value} x ${heightInput.value}`, true);
});

function isFileImage(file) {
  const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  return file && acceptedImageTypes.includes(file['type']);
}

function alertMsg(message, isSuccess) {
  Toastify.toast({
    text: message,
    duaration: 5000,
    close: false,
    style: {
      background: isSuccess ? 'green' : 'red',
      color: 'white',
      textAlign: 'center'
    }
  });
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);