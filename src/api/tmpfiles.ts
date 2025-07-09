export async function uploadTempFile(file: any): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${import.meta.env.VITE_TMPFILES_API}`, {
    method: "POST",
    body: formData,
  })

  const result = await response.json()
  if (response.ok) {
    const domain = "tmpfiles.org/"
    const id = result.data.url.split(domain)[1]
    const url = `https://${domain}dl/${id}`
    return url
  } else {
    throw new Error(result.message || "Gagal mengunggah file")
  }
}
