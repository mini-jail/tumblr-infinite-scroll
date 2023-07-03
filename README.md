# tumblr-infinite-scroll
my solution for an infinite scroll

## motivation
yo hello! none of these tumblr-infinite-scroll-script thingies worked for me and looked really old! (probably because of compability issues back then...).

yeah right, thats why i wrote my own which works with my template (but is easily adjustable).

## how to get it to work?
either adjust your template or ... i dunno.

mine is like that
```html
...
<head>
  <script src="https://static.tumblr.com/...the-script.js"></script>
</head>
...
<main>
  {block:Posts}
    <article class="box" data-post="{PostId}">
      <header>
        <a href="{Permalink}">
          {block:Title}
            <h3 title="{Title}">{Title}</h3>
          {/block:Title}
          <time>{TimeAgo}</time>
        </a>
...
```

* `<main>` is the container for all posts
* `<article data-post="{PostId}">` is the post itself

## configuration
you will find this at the top. if you know basic DOM and JS...you know what to do x)

```javascript
const loadingClass = "is-loading"
const containerQuery = "body main"
const postQuery = "article[data-post]"
```
