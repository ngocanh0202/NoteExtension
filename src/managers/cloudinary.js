import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { getDb, getConfigCloudinary, getCurrentUser } from './firebase.js';
import { handleAlert, Alert, DurationLength } from '../ui/alert.js';

export async function generateCloudinarySignature(params, apiSecret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const message = sortedParams + apiSecret;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function handleUploadImageUrl(data) {
  const db = getDb();
  const user = getCurrentUser();
  if (!db) {
    console.error('Firestore not initialized when uploading image URL');
    return;
  }
  const docData = { ...data };
  if (user) {
    docData.userId = user.uid;
  }
  await addDoc(collection(db, "note-images"), docData);
}

export async function handleCleanImagesCloudinary(listItem, setLoading) {
  const db = getDb();
  if (!db) {
    console.error('Firestore not initialized when cleaning images');
    return;
  }
  const configCloudinary = getConfigCloudinary();
  const user = getCurrentUser();

  let listImage = [];
  let q;
  if (user) {
    q = query(collection(db, "note-images"), where("userId", "==", user.uid));
  } else {
    q = collection(db, "note-images");
  }
  const querySnapshotImages = await getDocs(q);
  querySnapshotImages.forEach((d) => {
    const data = d.data();
    listImage.push({
      id: d.id,
      url: data.url,
      signature: data.signature
    });
  });

  if (listImage.length === 0) return;

  const unusedImages = listImage.filter(
    img => !listItem.some(item => item.example.includes(img.url))
  );

  if (!unusedImages.length || !configCloudinary.CLOUDINARY_APISECRET) return;

  setLoading(true);
  try {
    for (const img of unusedImages) {
      try {
        const urlParts = img.url.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) continue;

        const pathAfterUpload = urlParts.slice(uploadIndex + 1);
        const lastPart = pathAfterUpload[pathAfterUpload.length - 1];
        const publicId = lastPart.split('.')[0];
        const timestamp = Math.floor(Date.now() / 1000);

        const params = {
          public_id: publicId,
          timestamp: timestamp,
          invalidate: true
        };

        const signature = await generateCloudinarySignature(params, configCloudinary.CLOUDINARY_APISECRET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${configCloudinary.CLOUDINARY_CLOUDNAME}/image/destroy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...params,
            api_key: configCloudinary.CLOUDINARY_APIKEY,
            signature: signature
          })
        });

        const data = await response.json();
        if (data.result !== 'ok') {
          handleAlert(Alert.DANGER, 'Failed to delete image from Cloudinary', DurationLength.LONG);
        } else {
          await deleteDoc(doc(db, `note-images/${img.id}`));
          handleAlert(Alert.INFO, 'Image deleted from Cloudinary successfully', DurationLength.MEDIUM);
        }
      } catch (error) {
        handleAlert(Alert.DANGER, 'Error: ' + error.message, DurationLength.LONG);
      }
    }
  } finally {
    setLoading(false);
  }
}
