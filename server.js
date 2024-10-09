const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Создайте папку uploads, если она не существует
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Обработка POST-запроса для загрузки изображения
app.post('/upload', upload.single('image'), (req, res) => {
    const imagePath = req.file.path;

    Tesseract.recognize(
        imagePath,
        'rus',
        {
            logger: info => console.log(info)
        }
    ).then(({ data: { text } }) => {
        res.json({ text });
    }).catch(err => {
        console.error(err);
        res.status(500).send('Ошибка распознавания');
    });
});

// Статические файлы
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
