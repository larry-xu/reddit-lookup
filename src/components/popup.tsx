import * as React from "react";
import { browser } from "webextension-polyfill-ts";
import { fetchRedditPosts, Submission } from "../reddit";
import { Post } from "./post";

const getActiveTab = async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};

export const Popup = () => {
  const [submissions, setSubmissions] = React.useState<Submission[]>();

  React.useEffect(() => {
    getActiveTab().then((tab) => {
      if (!tab.url) return;
      fetchRedditPosts(tab.url).then(setSubmissions);
    });
  }, []);

  return (
    <div className="popupWrapper">
      {submissions &&
        (submissions.length > 0
          ? submissions.map((submission) => <Post submission={submission} />)
          : "No results found")}
    </div>
  );
};
