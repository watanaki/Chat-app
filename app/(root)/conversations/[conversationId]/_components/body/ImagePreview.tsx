import React from 'react'

type Props = {
  urls: string[]
}

const ImagePreview = ({ urls }: Props) => {

  const isVideoFile = (filename: string) => {
    const videoFilePattern = /\.(mp4|webm|ogg|mov)$/i
  }

  return (
    <div>ImagePreview</div>
  )
}

export default ImagePreview;