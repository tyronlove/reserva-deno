import { parse } from "https://deno.land/std@0.149.0/encoding/yaml.ts"
import { serveDir } from "https://deno.land/std@0.149.0/http/file_server.ts"
import { serve } from "https://deno.land/std@0.149.0/http/server.ts"
import { walk, walkSync } from "https://deno.land/std@0.149.0/fs/mod.ts"
import { render } from "https://deno.land/x/gfm/mod.ts"

const routes = ['']

const headers = {headers : {"content-type": "text/html; charset=utf-8"}}

let linklist = ''

let postStore = new Map()

let posts = []

let postnames = []

let homepage = {
  title: 'Posts',
  markdown: 'List of posts goes here'
}

for await (const entry of walk('./posts/')) {
  if (entry.name.endsWith('md')) {
    const post = await Deno.readTextFile(entry.path)
    const findYAML = post.split('---')
    const split = entry.name.split('.')
    const parsed = parse(findYAML[1])
    parsed.content = findYAML[2]
    parsed.name = split[0]
    parsed.markdown = '<p>' + parsed.publish_date.toLocaleString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}) + '</p>' + render(parsed.content)
    posts.push(parsed)
    postnames.push(parsed.name)
    postStore.set(parsed.name, parsed)
  }
}

let listposts = ''

posts.sort((a,b) => a.publish_date - b.publish_date)

for await (const post of posts) {
  listposts = '<li><a href="/' + post.name + '">' + post.title + '</a> — ' + post.publish_date.toLocaleString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}) + '</li>' + listposts
}

homepage.markdown = '<ul>' + listposts + '</ul>'
postStore.set('/', homepage)

async function genlinks (links) {
  for (const link of links) {
    linklist = linklist + '<li><a href="' + link.url + '">' + link.title + '</a></li>'
  }
}

function handle (config, postname) {
  const post = postStore.get(postname)
  const head = `
  <!DOCTYPE html>  
  <html>
      <head>
        <title>${config.title || 'My Deno Blog'}</title>
        <meta name='viewport' content='width=device-width initial-scale=1' />
        <meta name="robots" content="noindex">
        <link rel='stylesheet' href='./reserva.css' type='text/css' />
        <link rel='stylesheet' href='./custom.css' type='text/css' />
      </head>
      <body style="background: ${config.background || '#fff'};">
      <div class='contain'>
  `

  const foot = `</div></div></body></html>`

  const content = `
  <div class="ten col off-one">
  <h1><a href="/">${config.title || 'My Deno Blog'}</a></h1>
    <hr>
    <a href="/"><img src=${config.avatar || 'https://deno-avatar.deno.dev/avatar/blog.svg'} style="float: left; margin-right: .8em; width: 150px;" class="profile"/></a>
    <div>
    <p>${config.description || 'This is my blog description.'}</p>
    <ul>${linklist || 'Links'}</ul>
    </div>
    <hr />
    <h2>${post.title || 'Posts'}</h2>
    ${post.markdown || 'Post list should go here'}
    <hr>
    <p style="font-size: .8em;">Built with <a href="#">Metalwork</a> | Deployed to <a href="#">Digital Ocean</a> | <a href="#">GitMX</a>.
    </p>
  `
  return head + content + foot
}

export function blog (config) {
  //genposts('./posts/')
  if (config && config.links) {
    genlinks(config.links)
  }
  serve(req => {
    const url = new URL(req.url)
    let postname = url.pathname.substring(1).split('.')[0]
    if (postname.endsWith('/')) {
      postname = postname.substring(0, postname.length - 1) 
    }
    if (url.pathname == '/index.html' || url.pathname == '/') {
      return new Response(handle(config, '/'), headers)
    } else if (postnames.includes(postname)) { 
      return new Response(handle(config, postname), headers)
    } else {
      return serveDir(req, {fsRoot: '', showDirListing: true, quiet: true})
    }
  }, {port: 8000})
}
