import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { storage } from './firebase'

const upload = async (file) => {
    if (!file) {
        console.error('Upload called with no file');
        return null;
    }

    // Choose folder based on file type
    let folder = 'files';
    if (file.type.startsWith('image/')) {
        folder = 'images';
    } else if (
        file.type.includes('pdf') || 
        file.type.includes('doc') || 
        file.name.match(/\.(pdf|doc|docx|xls|xlsx|txt|csv|ppt|pptx)$/i)
    ) {
        folder = 'documents';
    } else if (file.type.startsWith('audio/')) {
        folder = 'audio';
    }
    
    // Create a unique filename with timestamp
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}_${file.name}`;
    
    // Create storage reference with proper path
    const storageRef = ref(storage, `${folder}/${fileName}`);
    console.log(`Uploading to: ${folder}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                reject('Something went wrong! ' + error.code);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};

export default upload;