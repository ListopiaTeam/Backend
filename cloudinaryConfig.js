import cloudinary from 'cloudinary'

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
  });

  export const removeFromCloud=(id)=>{
    cloudinary.v2.uploader.destroy(id,()=>console.log('deleting:',id))
  }