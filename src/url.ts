export type SearchParams = {
  exactUrls: string[];
  urlSearch: string;
  selfTextSearch: string;
};

/**
 * Remove trackers from the given href
 */
const cleanHref = (href: string) => {
  const url = new URL(href);
  url.searchParams.delete("fbclid"); // remove fb tracker
  url.searchParams.delete("utm_source"); // remove utm trackers
  url.searchParams.delete("utm_medium");
  url.searchParams.delete("utm_campaign");
  url.searchParams.delete("utm_term");
  url.searchParams.delete("utm_content");
  if (url.hostname.includes("twitter.com")) {
    url.searchParams.delete("s"); // remove twitter tracker
  }
  return url.href;
};

/**
 * Replaces the ? URL search character with an underscore _
 */
const replaceSearchCharacter = (href: string) => {
  return href.replace("?", "_");
};

/**
 * Get Youtube link search params for given href
 *
 * Searches for both style of Youtube links:
 * - www.youtube.com/watch?v=XYZ
 * - youtu.be/XYZ
 */
const getYoutubeSearchParams = (href: string) => {
  const url = new URL(href);
  if (url.hostname !== "www.youtube.com" && url.pathname !== "/watch") {
    return;
  }

  const videoId = url.searchParams.get("v");
  if (videoId === null) {
    return;
  }

  const exactUrls = [
    `https://www.youtube.com/watch?v=${videoId}`,
    `https://youtu.be/${videoId}`,
  ];
  const urlSearch = `("youtube.com/watch?v=${videoId}" OR "youtu.be/${videoId}")`;
  const selfTextSearch = replaceSearchCharacter(urlSearch);

  return { exactUrls, urlSearch, selfTextSearch };
};

/**
 * Get Wikipedia link search params for given href
 *
 * Searches for both style of Wikipedia links:
 * - wikipedia.org/w/index.php?title=XYZ
 * - wikipedia.org/wiki/XYZ
 */
const getWikipediaSearchParams = (href: string) => {
  const url = new URL(href);
  if (!url.hostname.includes("wikipedia.org")) {
    return;
  }

  let title = "";
  if (url.pathname.startsWith("/wiki/")) {
    title = url.pathname.replace("/wiki/", "");
  } else if (url.pathname === "/w/index.php") {
    title = url.searchParams.get("title") ?? "";
  }

  const exactUrls = [
    `https://${url.hostname}/wiki/${title}`,
    `https://${url.hostname}/w/index.php?title=${title}`,
  ];
  const urlSearch = `("wikipedia.org/w/index.php?title=${title}" OR "wikipedia.org/wiki/${title}")`;
  const selfTextSearch = replaceSearchCharacter(urlSearch);

  return { exactUrls, urlSearch, selfTextSearch };
};

const getBaseSearchParams = (href: string) => {
  const exactUrls = [href];
  const urlSearch = `"${href.replace(/^https?:\/\//, "")}"`;
  const selfTextSearch = replaceSearchCharacter(urlSearch);

  return { exactUrls, urlSearch, selfTextSearch };
};

export const getSearchParams = (href: string): SearchParams => {
  const cleanedHref = cleanHref(href);

  const youtubeSearchParams = getYoutubeSearchParams(cleanedHref);
  if (youtubeSearchParams !== undefined) {
    return youtubeSearchParams;
  }

  const wikipediaSearchParams = getWikipediaSearchParams(cleanedHref);
  if (wikipediaSearchParams !== undefined) {
    return wikipediaSearchParams;
  }

  return getBaseSearchParams(cleanedHref);
};
