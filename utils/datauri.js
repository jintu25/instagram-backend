import path from "path";
import DatauriParser from 'datauri/parser.js';

const parser = new DatauriParser();

const getDataUri = (file) => {
    const ext = path.extname(file.originalname).toString();
    // Convert the file to Data URI using Datauri parser
    return parser.format(ext, file.buffer).content;
}

export default getDataUri;
