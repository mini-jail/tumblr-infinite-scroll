/**
 * @type {Map<string, HTMLElement>}
 */
const postMap = new Map()
const debounceValue = 50
const containerQuery = "body main"
const postQuery = "article[data-post]"
const parser = new DOMParser()
const parse = parser.parseFromString.bind(parser)
let page = location.pathname.match(/\/page\/(\d+)/)?.[1] || 1
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
  const response = await fetch(`/page/${page}`)
  const text = await response.text()
  return parse(text, "text/html").querySelectorAll(postQuery)
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
      const mode = scrolled > 0.7 ? 1 : scrolled < 0.3 ? -1 : 0

      if (mode === 0) {
        isLoading = false
        return
      }

      for (const elt of document.querySelectorAll(postQuery)) {
        postMap.set(elt.dataset.post, elt)
      }

      try {
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
            mode === 1
              ? postsContainer.append(elt)
              : postsContainer.prepend(elt)
          }
        }
      } catch (error) {
        console.error(
          `create an issue for this error on "https://github.com/mini-jail/tumblr-infinite-scroll/issues"`,
          error,
        )
      }

      isLoading = false
    }, debounceValue),
  )
}
