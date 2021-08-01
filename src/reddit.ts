/**
 * Reddit API response types
 */

type RedditSubmission = {
  data: {
    author: string;
    created_utc: number;
    num_comments: number;
    permalink: string;
    score: number;
    subreddit: string;
    title: string;
  };
};

type RedditListing = {
  data: {
    children: RedditSubmission[];
  };
};

/**
 * Parsed submission type
 */

export type Submission = {
  author: string;
  created: number;
  numComments: number;
  permalink: string;
  score: number;
  subreddit: string;
  title: string;
};

const fetchRedditApi = async (url: string): Promise<RedditListing> => {
  return fetch(url).then((response) => response.json());
};

const getRedditApiUrls = (href: string) => {
  return [
    `https://api.reddit.com/api/info?url=${href}`,
    `https://api.reddit.com/search?q=url:${href}`,
    `https://api.reddit.com/search?q=selftext:"${href}"`,
  ];
};

/**
 * Gets alternative Youtube url format for given href
 *
 * Example:
 * www.youtube.com/watch?v=XYZ -> youtu.be/XYZ
 */
const getAlternateYoutubeUrl = (href: string) => {
  const url = new URL(href);
  if (url.hostname !== "www.youtube.com" && url.pathname !== "/watch") {
    return;
  }

  const videoId = url.searchParams.get("v");
  if (videoId === null) {
    return;
  }

  return `https://youtu.be/${videoId}`;
};

/**
 * Get list of reddit API endpoints to query based on target url
 */
const getUrls = (href: string): string[] => {
  const altUrl = getAlternateYoutubeUrl(href);
  if (altUrl === undefined) {
    return getRedditApiUrls(href);
  }

  return getRedditApiUrls(href).concat(getRedditApiUrls(altUrl));
};

/**
 * Fetch all relevant Reddit posts for given url.
 * Returns an array of Submission objects sorted by score descending.
 */
export const fetchRedditPosts = async (url: string) => {
  const urls = getUrls(url);
  const responsePromises = urls.map((url) => fetchRedditApi(url));
  const responses = await Promise.all(responsePromises);

  // de-dupe the posts by creating a map keyed by permalink
  const postsMap = new Map(
    responses.flatMap((response) =>
      response.data.children.map(({ data }): [string, Submission] => [
        data.permalink,
        {
          author: data.author,
          created: data.created_utc,
          numComments: data.num_comments,
          permalink: data.permalink,
          score: data.score,
          subreddit: data.subreddit,
          title: data.title,
        },
      ])
    )
  );
  const posts = Array.from(postsMap.values());
  posts.sort((a, b) => b.score - a.score);
  return posts;
};
