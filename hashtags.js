const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

const PAGE_WIDTH = 1024;
const PAGE_HEIGHT = 10000;

async function getHashtagsForPost(insta, url) {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(url);
  const links = await page.$$("a");
  const hashtags = new Set();
  for (const link of links) {
    const hrefHandle = await link.getProperty("href");
    const href = await hrefHandle.jsonValue();
    if (href.includes("https://www.instagram.com/explore/tags/")) {
      const hashtagText = await (await link.getProperty("text")).jsonValue();
      hashtags.add(hashtagText);
    }
  }
  return Array.from(hashtags);
}

async function getProfile(insta) {
  const url = `https://www.instagram.com/${insta}/`;
  const res = await fetch(url);
  const html = await res.text();
  //console.log(html);
  const startIndex = html.indexOf("window._sharedData =");
  const endIndex = html.indexOf(";</script>", startIndex);
  // console.log(startIndex, endIndex);
  const json = html.substring(
    startIndex + "window._sharedData =".length,
    endIndex
  );

  const hashtagMap = {};

  const sharedData = JSON.parse(json);
  const profile = sharedData.entry_data.ProfilePage[0].graphql.user;
  return profile;
}

async function getHashtags(insta) {
  const profile = await getProfile(insta);
  const posts = profile.edge_owner_to_timeline_media.edges;
  for (const post of posts) {
    const caption = post.node.edge_media_to_caption.edges[0].node.text;
    const re = /#(\w+)/g;
    let m;
    do {
      m = re.exec(caption);
      if (m) {
        const hashtag = m[1];
        let count = hashtagMap[hashtag] || 0;
        count += 1;
        hashtagMap[hashtag] = count;
      }
    } while (m);
  }

  const hashtagList = [];
  for (hashtag of Object.keys(hashtagMap)) {
    const count = hashtagMap[hashtag];
    hashtagList.push({ hashtag, count });
  }

  hashtagList.sort((a, b) => b.count - a.count);
  return hashtagList;
}

async function getLocations(insta) {
  const profile = await getProfile(insta);
  const posts = profile.edge_owner_to_timeline_media.edges;
  const locationSet = new Set();
  for (const post of posts) {
    const location = post.node.location;
    //    console.log(location);
    if (location) {
      locationSet.add(location.name);
    }
  }
  return Array.from(locationSet);
}

module.exports = { getHashtags, getLocations };

// downloadPosts('nasa');
// downloadPost('nasa', 'https://www.instagram.com/p/BvZZKL9jRZf/');
