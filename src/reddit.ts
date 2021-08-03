import { getSearchParams, SearchParams } from "./url";

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

/**
 * Get list of reddit API endpoints to query based on search params
 */
const getRedditApiUrls = ({
  exactUrls,
  urlSearch,
  selfTextSearch,
}: SearchParams) => {
  return exactUrls
    .map((url) => encodeURIComponent(url))
    .map((encodedUrl) => `https://api.reddit.com/api/info?url=${encodedUrl}`)
    .concat([
      `https://api.reddit.com/search?sort=top&q=url:${urlSearch}`,
      `https://api.reddit.com/search?sort=top&q=selftext:${selfTextSearch}`,
    ]);
};

/**
 * Make fetch request to reddit API endpoint
 */
const fetchRedditApi = async (url: string): Promise<RedditListing> => {
  const response = await fetch(url);
  return response.json();
};

/**
 * Fetch all relevant Reddit posts for given url.
 * Returns an array of Submission objects sorted by score descending.
 */
export const fetchRedditPosts = async (href: string) => {
  const searchParams = getSearchParams(href);
  const urls = getRedditApiUrls(searchParams);
  const responsePromises = urls.map(fetchRedditApi);
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
