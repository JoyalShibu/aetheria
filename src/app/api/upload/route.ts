import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const fileName = req.headers.get('X-File-Name') || 'uploaded_movie.mp4';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'movies');
    
    // Ensure nested directories exist immediately
    await fs.promises.mkdir(uploadDir, { recursive: true });
    
    // Sanitize to prevent path traversal loops
    const safeName = decodeURIComponent(fileName).replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFilename = `aetheria_${Date.now()}_${safeName}`;
    const filePath = path.join(uploadDir, finalFilename);

    if (!req.body) {
      return NextResponse.json({ error: 'No stream body detected' }, { status: 400 });
    }

    // Pipe the Web ReadableStream directly to a Node.js WriteStream
    const reader = req.body.getReader();
    const writeStream = fs.createWriteStream(filePath);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Write memory chunks straight to the SSD (virtually 0 RAM footprint)
      writeStream.write(Buffer.from(value));
    }
    
    writeStream.end();

    return NextResponse.json({ 
      success: true, 
      path: `/uploads/movies/${finalFilename}` 
    });
    
  } catch (error) {
    console.error('Media streaming failure:', error);
    return NextResponse.json({ error: 'Internal Streaming Failure' }, { status: 500 });
  }
}
