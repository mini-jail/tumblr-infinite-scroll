/**
 * @type {Set<string>}
 */
const postIdSet = new Set()
const debounceValue = 50
const containerQuery = "body main"
const postQuery = "article[data-post]"
const parser = new DOMParser()
const parse = parser.parseFromString.bind(parser)
const isPostsPage = location.pathname === "/" ||
  location.pathname.startsWith("/page/")
let page = location.pathname.match(/\/page\/(\d+)/)?.[1] || 1
let isLoading = false
/**
 * @type {HTMLElement | null}
 */
let postsContainer = null
let preventLoading = false

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

if (isPostsPage) {
  addEventListener(
    "scroll",
    debounced(async () => {
      if (isLoading || preventLoading) {
        return
      }
      isLoading = true
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement
      const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1
      if (atBottom) {
        for (const post of document.querySelectorAll(postQuery)) {
          postIdSet.add(post.dataset.post)
        }
        try {
          const posts = await getPosts(++page)
          if (posts.length === 0) {
            page--
            preventLoading = true
          } else {
            const postsContainer = getPostsContainer()
            for (const post of posts) {
              if (postIdSet.has(post.dataset.post)) {
                continue
              }
              postsContainer.appendChild(post)
            }
          }
        } catch (error) {
          console.error(
            `create an issue for this error on "https://github.com/mini-jail/tumblr-infinite-scroll/issues"`,
            error,
          )
        }
      }
      isLoading = false
    }, debounceValue),
  )
}
