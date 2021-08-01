import * as React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Submission } from "../reddit";
dayjs.extend(relativeTime);

const redditLink = (path: string) => `https://www.reddit.com${path}`;

const formatNumber = (x: number) => {
  if (x < 10000) return x.toString();

  const abbreviatedNum = (x / 1000).toPrecision(3);
  return `${abbreviatedNum}k`;
};

export const Post = ({ submission }: { submission: Submission }) => {
  const handleClick = (evt: React.MouseEvent) => {
    const target = evt.target as HTMLElement;
    if (target.tagName === "A") return;
    window.open(redditLink(submission.permalink));
  };

  return (
    <div className="submissionWrapper" onClick={handleClick}>
      <div className="submissionScoreWrapper">
        <div className="submissionScore">
          <span>{formatNumber(submission.score)}</span>
        </div>
        <span className="submissionComments">
          {formatNumber(submission.numComments)} Comments
        </span>
      </div>
      <div>
        <div className="submissionAuthorWrapper">
          <a
            className="submissionSubreddit"
            href={redditLink(`/r/${submission.subreddit}`)}
            target="_blank"
          >
            r/{submission.subreddit}
          </a>
          <span className="submissionAuthorSeparator">•</span>
          <span>
            Posted by{" "}
            <a
              className="submissionAuthor"
              href={redditLink(`/user/${submission.author}`)}
              target="_blank"
            >
              u/{submission.author}
            </a>{" "}
            {dayjs.unix(submission.created).fromNow()}
          </span>
        </div>
        <a
          className="submissionTitle"
          href={redditLink(submission.permalink)}
          target="_blank"
        >
          {submission.title}
        </a>
      </div>
    </div>
  );
};
