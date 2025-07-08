import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
// import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const handleAuth = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return { userId };
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  image: f({
    image: { maxFileCount: 6, maxFileSize: "8MB" },
    video: { maxFileCount: 3, maxFileSize: "1GB" }
  })
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => { }),

  file: f({
    image: { maxFileCount: 6, maxFileSize: "8MB" },
    video: { maxFileCount: 3, maxFileSize: "1GB" },
    audio: { maxFileCount: 3, maxFileSize: "16MB" },
    pdf: { maxFileCount: 6, maxFileSize: "16MB" }
  })
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => { })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
