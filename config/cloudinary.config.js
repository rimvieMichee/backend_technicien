// import {v2 as cloudinary} from 'cloudinary';
// import dotenv from 'dotenv';

// dotenv.config();

// cloudinary.config({
//   cloud_name: 'Root',
//   api_key: '635337398966686',
//   api_secret: '4eC98-s7azl253sNI0kuhRbDq1g'
// });

// export default cloudinary;


// config/cloudinary.js
import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();


cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: 'dwpvw2fgo',
  api_key: '635337398966686',
  api_secret: '4eC98-s7azl253sNI0kuhRbDq1g'
});

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'photos', // Nom du dossier dans Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

// module.exports = {
//   cloudinary,
//   storage,
// };
export default cloudinary;
