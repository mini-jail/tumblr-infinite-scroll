/**
 * to tumblr:
 * i am sorry if i am violating against some rules :(
 * please remove it if you need to.
 *
 * motivation:
 * i wanted to implement a working infinite-scroll function
 * without firing "fetch" or any other request function too often.
 */

/**
 * @type {Set<string>}
 */
const postIdSet = new Set()
const articleQuery = "article[data-post]"
const parser = new DOMParser()
const parse = parser.parseFromString.bind(parser)
let page = location.pathname.match(/\/page\/(\d+)/)?.[1] || 1
let isLoading = false

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
async function getArticles(page) {
  const response = await fetch(`/page/${page}`)
  const text = await response.text()
  return parse(text, "text/html").querySelectorAll(articleQuery)
}

if (location.pathname === "/" || location.pathname.startsWith("/page/")) {
  addEventListener(
    "scroll",
    debounced(async () => {
      if (isLoading) {
        return
      }
      isLoading = true
      document.documentElement.classList.add("is-loading")
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement
      const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1
      if (atBottom) {
        for (const article of document.querySelectorAll(articleQuery)) {
          postIdSet.add(article.dataset.post)
        }
        try {
          const articles = await getArticles(++page)
          articles.length === 0 && page--
          if (articles.length) {
            const articleContainer = document.querySelector("body main")
            for (const article of articles) {
              if (postIdSet.has(article.dataset.post)) {
                continue
              }
              articleContainer.appendChild(article)
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
      document.documentElement.classList.remove("is-loading")
    }, 500),
  )
}
