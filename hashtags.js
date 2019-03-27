const puppeteer = require('puppeteer');

const PAGE_WIDTH = 1024;
const PAGE_HEIGHT = 10000;

async function getHashtagsForPost(insta, url) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url);
  const links = await page.$$('a');
  const hashtags = new Set();
  for (const link of links) {
      const hrefHandle = await link.getProperty('href');
      const href = await hrefHandle.jsonValue();
      if (href.includes('https://www.instagram.com/explore/tags/')) {
          const hashtagText = await (await link.getProperty('text')).jsonValue();
          hashtags.add(hashtagText);
      }
  }
  return Array.from(hashtags);
}

async function getHashtags(insta) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setViewport({ width: PAGE_WIDTH, height: PAGE_HEIGHT});
  await page.goto(`https://www.instagram.com/${insta}/`);

  const posts = new Set();

  const links = await page.$$('a');
  for (const link of links) {
      const hrefHandle = await link.getProperty('href');
      const href = await hrefHandle.jsonValue();
      // console.log(href);
      if (href.includes('https://www.instagram.com/p/')) {
          posts.add(href);
      }
  }
  console.log(posts);

  // for (let i = 0; i < 2; i++) {
  //     const links = await page.$$('a');
  //     for (const link of links) {
  //         const hrefHandle = await link.getProperty('href');
  //         const href = await hrefHandle.jsonValue();
  //         // console.log(href);
  //         if (href.includes('https://www.instagram.com/p/')) {
  //             posts.add(href);
  //         }
  //     }

  //     const previousHeight = await page.evaluate('document.body.scrollHeight');
  //     // console.log('SCROLL', previousHeight);
  //     await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
  //     await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
  //     await page.waitFor(500);

      // console.log(posts);
      // await downloadPost(insta, posts[0]);
  // }
  // console.log('FINAL');
  // console.log(posts);

  const hashtagMap = {};
  const requests = [];
  for (const postUrl of posts) {
      requests.push(getHashtagsForPost(insta, postUrl));
  }
  const allHashtags = await Promise.all(requests);
  for (const hashtags of allHashtags) {
      for (const hashtag of hashtags) {
          let count = hashtagMap[hashtag] || 0;
          count += 1;
          hashtagMap[hashtag] = count;
      }
  }

  console.log(hashtagMap);
  const hashtagList = []
  for (hashtag of Object.keys(hashtagMap)) {
      const count = hashtagMap[hashtag];
      hashtagList.push({ hashtag, count });
  }

  hashtagList.sort((a, b) => b.count - a.count);
  return hashtagList;
}

module.exports = { getHashtags }

// downloadPosts('nasa');
// downloadPost('nasa', 'https://www.instagram.com/p/BvZZKL9jRZf/');
