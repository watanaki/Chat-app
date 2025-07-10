import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import React from 'react'

type Props = {
  urls: string[]
}

const ImagePreview = ({ urls }: Props) => {

  const isVideoFile = (filename: string) => {
    const videoFilePattern = /\.(mp4|webm|ogg|mov)$/i;
    return videoFilePattern.test(filename);
  }

  return (
    <div className={cn("grid gap-2 justify-items-start", {
      "grid-cols-1": urls.length === 1,
      "grid-cols-2": urls.length > 1
    })}>
      {
        urls.map((url, index) => {
          const isVideo = isVideoFile(url);
          const indexOfType = url.lastIndexOf('.');
          url = url.substring(0, indexOfType);
          return (<Dialog key={index}>
            <div className={cn("relative cursor-pointer", {
              "w-28 h-28 max-w-full": !isVideo
            })}>
              <DialogTrigger asChild>
                {isVideo ?
                  <div>
                    <video poster={url} className='object-cover w-full h-full rounded-md'>
                      <source src={`${url}#t=0.1`} type='video/mp4' />
                    </video>
                  </div> :
                  <Image
                    src={url}
                    alt='Failed to load image'
                    referrerPolicy='no-referrer'
                    className='rounded-md object-contain w-full h-auto'
                    fill
                    unoptimized
                  />
                }
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>{`${isVideo ? 'Video' : 'Image'} preview`}</DialogTitle>
                <div className="w-full h-96 relative flex items-center justify-center">
                  {isVideo ?
                    <video controls poster={url} className='w-full'>
                      <source src={`${url}#t=0.1`} type='video/mp4' />
                    </video> :
                    <Image
                      src={url}
                      alt='Failed to load image'
                      referrerPolicy='no-referrer'
                      className='object-contain w-full h-full'
                      fill
                      unoptimized
                    />}
                </div>
              </DialogContent>
            </div>
          </Dialog>)
        })
      }
      {/* {urls} */}
    </div>
  )
}

export default ImagePreview;