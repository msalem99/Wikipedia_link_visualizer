import { useState, useEffect, useRef } from "react";
import { fetchWikiTitles, fetchWikiImages, searchWikiTitles } from "./utils.js";
import loadingGif from "./assets/Loading.gif";

export default function Search({ setInitialWikiData, setLoadingMap }) {
  const [name, setName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchedName = useRef("");

  useEffect(() => {
    searchedName.current = name;
    const delayDebounceFn = setTimeout(() => {
      name &&
        searchWikiTitles(setLoading, name).then((response) => {
          searchedName.current === name && setResults(response);
          searchedName.current === name && setLoading(false);
        });
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      setResults([]);
      setLoading(false);
    };
  }, [name]);

  function getWikiData(e, titleToFetch) {
    titleToFetch = titleToFetch.trim();
    setLoadingMap(true);
    let newArticles = fetchWikiTitles(e, titleToFetch);
    newArticles.then((response) => {
      if (!response) {
        setLoadingMap(false);
        return;
      }
      let data = fetchWikiImages(response, titleToFetch);
      data.then((response2) => {
        if (!response) {
          setLoadingMap(false);
          return;
        }
        setInitialWikiData(response2);
        setLoadingMap(false);
      });
    });
  }

  return (
    <div className="form__wrapper">
      <img
        src={
          "https://upload.wikimedia.org/wikipedia/commons/d/de/Wikipedia-logo_%28inverse%29.png"
        }
        alt=""
        className="wikipedia__logo"
      ></img>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          getWikiData(e, name);
        }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setResults([]);
          }}
          placeholder="Search wikipedia"
        />
        <div className="result__box">
          {loading ? (
            <img
              alt="Loading"
              className="loading__list__gif"
              src={loadingGif}
            ></img>
          ) : (
            results.map((result, index) => (
              <li
                key={index}
                onClick={(e) => {
                  getWikiData(e, e.currentTarget.innerHTML);
                }}
              >
                {result}
              </li>
            ))
          )}
        </div>
      </form>
    </div>
  );
}
