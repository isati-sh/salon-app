export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Image Placeholder</p>
        </div>
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Image Placeholder</p>
        </div>
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Image Placeholder</p>
        </div>
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Image Placeholder</p>
        </div>
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Image Placeholder</p>
        </div>
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Image Placeholder</p>
        </div>
      </div>
    </div>
  );
}

