import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Ottieni il percorso della directory corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Configurazione di multer per l'upload dei file
const upload = multer({
    dest: 'uploads/', // Directory temporanea per i file caricati
    limits: { fileSize: 100 * 1024 * 1024 }, // Limite di dimensione file a 100 MB
    fileFilter: (req, file, cb) => {
        // Permetti solo file audio
        if (!file.mimetype.startsWith('audio/')) {
            return cb(new Error('Solo file audio sono permessi.'), false);
        }
        cb(null, true);
    }
});

// Middleware per servire file statici
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint per caricare e convertire l'audio
app.post('/convert', upload.single('audioFile'), async (req, res) => {
    const { format = 'mp3' } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).send('Nessun file caricato.');
    }

    const filePath = file.path;

    try {
        console.log('Inizio la conversione del file...');

        // Usa una libreria alternativa o un servizio gratuito
        // Questo esempio utilizza un placeholder per la conversione

        const outputFileName = `converted.${format}`;
        const outputPath = path.join(__dirname, 'converted', outputFileName);

        // Simula la conversione del file
        fs.copyFileSync(filePath, outputPath);

        fs.unlinkSync(filePath); // Elimina il file temporaneo
        res.download(outputPath, (err) => {
            if (err) {
                console.error('Errore durante il download del file convertito:', err.message);
                res.status(500).send('Errore durante il download del file convertito.');
            }
            fs.unlinkSync(outputPath); // Elimina il file convertito dopo il download
        });
    } catch (error) {
        console.error('Errore durante la conversione del file:', error.message);
        fs.unlinkSync(filePath); // Elimina il file temporaneo in caso di errore
        res.status(500).send('Errore durante la conversione del file.');
    }
});

app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
