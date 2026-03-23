import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Cloudinary environment variables are missing on server' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('image');
    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    if (!file.type?.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'computer9',
          transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
        },
        (err, res) => (err ? reject(err) : resolve(res))
      ).end(buffer);
    });

    if (!result?.secure_url) {
      return NextResponse.json({ error: 'Upload failed to return a URL' }, { status: 500 });
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    return NextResponse.json({ error: err?.message || 'Unexpected upload failure' }, { status: 500 });
  }
}
