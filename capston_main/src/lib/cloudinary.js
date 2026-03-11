export async function uploadToCloudinary(file) {
  const url = "https://api.cloudinary.com/v1_1/dhubbsdry/image/upload";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "capstone_unsigned");

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();

  return data.secure_url;
}