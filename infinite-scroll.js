/**
 * @type {Map<string, HTMLElement>}
 */
const postMap = new Map()
const debounceValue = 250
const modeUp = 0.5
const modeDown = 0.3
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
 * @template FN, T
 * @typedef {{
 *   (...args: Parameters<FN>): ReturnType<FN>
 * }} DebouncedCallback
 */

/**
 * @template FN, T
 * @param {FN & (...args: any[]) => any} callback
 * @param {T & number} timeout
 * @returns {DebouncedCallback<FN, T>}
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

const debouncedScrollListener = debounced(async () => {
  if (isLoading || page === maxPage) {
    return
  }

  isLoading = true
  const { scrollHeight, scrollTop } = document.documentElement
  const scrolled = scrollTop / scrollHeight
  const mode = scrolled > modeUp ? 1 : scrolled < modeDown ? -1 : 0

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
}, debounceValue)

// only enabled on main-page
if (location.pathname === "/") {
  addEventListener("scroll", debouncedScrollListener)
}
