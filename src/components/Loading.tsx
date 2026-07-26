

export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className="animate-spin rounded-full border-4 border-t-4 border-gray-300 border-t-blue-500"
        style={{ width: 40, height: 40 }}
      ></div>
      <p className="mt-2 text-gray-500">Loading ...</p>
    </div>
  );
};