import { createUploadthing, type FileRouter } from "uploadthing/next-legacy"

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "1MB" } })
    // Set permissions and file types for this FileRoute
    .onUploadComplete(({ file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("file url", file.url)
      console.log("file size", file.size)
      console.log("file name", file.name)
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
