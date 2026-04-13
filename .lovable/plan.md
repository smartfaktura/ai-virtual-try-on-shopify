

# Improve Admin Models Page

## What Changes
1. **Add image replacement** — Make the model thumbnail clickable during edit mode (or always for custom models) to upload a new image. Clicking it opens a file picker, uploads to `scratch-uploads`, and updates the model's `image_url` and `optimized_image_url`.

2. **Improve delete UX** — Replace the browser `confirm()` dialog with a proper styled confirmation dialog using the existing AlertDialog component, showing the model name and image before confirming permanent deletion.

3. **Visual polish** — Add a camera/upload overlay icon on the image when hoverable for custom models, making it clear the image is changeable.

## Technical Details

### File: `src/pages/AdminModels.tsx`
- Add a hidden `<input type="file">` ref for image upload
- When the thumbnail of a custom model is clicked, trigger the file input
- On file select: upload to `scratch-uploads/models/`, get public URL, call `updateModel.mutateAsync` with new `image_url` and computed `optimized_image_url`
- Replace `confirm()` with an `AlertDialog` from `@/components/ui/alert-dialog` showing model name + thumbnail
- Add hover overlay on custom model images with a camera icon
- Show a loading spinner on the image while uploading

### No database or hook changes needed
- `useUpdateCustomModel` already supports updating `image_url`
- `useDeleteCustomModel` already does hard deletes
- Storage bucket `scratch-uploads` is public and available

