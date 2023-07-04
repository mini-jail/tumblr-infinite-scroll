/**
 * @type {Map<string, HTMLElement>}
 */
const postMap = new Map()
const debounceValue = 500
const containerQuery = "body main"
const postQuery = "article[data-post]"
const parser = new DOMParser()
const parse = parser.parseFromString.bind(parser)
let page = 1
let isLoading = false
/**
 * @type {HTMLElement | null}
 */
let postsContainer = null
let maxPage = Infinity

/**
 * @template T
 * @param {T & (...args: any[]) => any} callback
 * @param {number} timeout
 * @returns {T}
 */
function debounced(callback, timeout) {
  let timeHandle = undefined
  return function (...args) {
    clearTimeout(timeHandle)
    timeHandle = setTimeout(() => {
      callback.call(this, ...args)
    }, timeout)
  }
}
/**
 * @param {number} page
 * @returns {Promise<Iterable<HTMLElement>>}
 */
async function getPosts(page) {
  try {
    const response = await fetch(`/page/${page}`)
    const text = await response.text()
    return parse(text, "text/html").querySelectorAll(postQuery)
  } catch (error) {
    console.error(`getPosts(${page})`, error)
    return []
  }
}

/**
 * @returns {HTMLElement}
 */
function getPostsContainer() {
  if (postsContainer) {
    return postsContainer
  }
  postsContainer = document.querySelector(containerQuery)
  return postsContainer
}

if (location.pathname === "/") {
  addEventListener(
    "scroll",
    debounced(async () => {
      if (isLoading || page === maxPage) {
        return
      }

      isLoading = true
      const { scrollHeight, scrollTop } = document.documentElement
      const scrolled = scrollTop / scrollHeight
      const mode = scrolled > 0.6 ? 1 : scrolled < 0.3 ? -1 : 0

      if (mode === 0 || (mode === -1 && page === 1)) {
        isLoading = false
        return
      }

      for (const elt of document.querySelectorAll(postQuery)) {
        postMap.set(elt.dataset.post, elt)
      }

      page = page + mode
      const posts = await getPosts(page)
      if (posts.length === 0) {
        maxPage = page
      } else {
        const postsContainer = getPostsContainer()
        for (const elt of posts) {
          const id = elt.dataset.post
          if (postMap.has(id)) {
            if (postMap.get(id).isEqualNode(elt) === false) {
              postsContainer.replaceChild(elt, postMap.get(id))
            }
            continue
          }
          mode === 1 ? postsContainer.append(elt) : postsContainer.prepend(elt)
        }
      }

      isLoading = false
    }, debounceValue),
  )
}
