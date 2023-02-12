import { blog } from './blog.js'

blog({
  title: "Tyron's Blog",
  avatar: 'https://avatars.githubusercontent.com/u/13947166?v=4',
  author: 'Tyron Love',
  description: "Proud Dad. <br>Lover of one Exquisite human. <br>Cartoonist for pretend.",
  background: "#f5f5f5",
  links: [
    { title: 'Twitter', url: 'https://twitter.com/tyron_love'},
    { title: 'Bogbook', url: 'https://bogbook.com/#TIZGEEjhlzfr0+15ZXO0+03vSLfDJEIFUKwXjeVGUQQ='} 
  ],
  lang: "en",
  favicon: "favicon.ico",
  ogImage: {
    url: "/images/profile.png",
    twitterCard:  "/images/profile.png" 
  },
  style:".img-style {float: left; width: 60%; margin-left: 1em; margin-top: -4.6em;}"
});
