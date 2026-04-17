import { NextResponse } from 'next/server'
import { uploadImage } from '@/app/actions/blog'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // Jodit sends the file with the key 'files[0]' by default.
    const file = formData.get('files[0]') as File
    if (!file) {
      return NextResponse.json({ success: false, msg: 'No file provided' })
    }
    
    const newFormData = new FormData()
    newFormData.append('file', file)
    
    const result = await uploadImage(newFormData)
    
    if (result.error) {
       return NextResponse.json({ success: false, msg: result.error })
    }
    
    return NextResponse.json({
        success: true,
        data: {
             baseurl: '',
             messages: [],
             isImages: [true],
             code: 220,
             path: '',
             files: [result.url]
        }
    })
  } catch (error: any) {
      return NextResponse.json({ success: false, msg: error.message || 'Upload failed' })
  }
}
