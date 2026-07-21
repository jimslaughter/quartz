function initCommentics() {
  const frame = document.getElementById("commentics-frame") as HTMLIFrameElement | null
  if (!frame) return
  const pageUrl = window.location.origin + window.location.pathname
  const encodedUrl = encodeURIComponent(pageUrl)
  const newSrc = `https://jimslaughter.net/travel/commentics/?page_url=${encodedUrl}`
  if (frame.getAttribute("src") !== newSrc) {
    frame.src = newSrc
  }
}

document.addEventListener("nav", initCommentics)

window.addEventListener("message", (e) => {
  if (e.data && typeof e.data === "object" && e.data.commentics_height) {
    const frame = document.getElementById("commentics-frame") as HTMLIFrameElement | null
    if (frame) frame.style.height = `${e.data.commentics_height + 20}px`
  }
})