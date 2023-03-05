import { useState, useRef, useEffect } from "react";

import Arrow from "./Arrow";
import {
  fetchWikiTitles,
  fetchWikiImages,
  isVisible,
  searchArticles,
} from "./utils";

export default function Map({ initialWikiData, setInitialWikiData }) {
  const [viewBox, setViewBox] = useState([40, -55, 200, 200]);
  const [pointerDown, setPointerDown] = useState(false);
  const [arrows, setArrows] = useState([]);
  const [levels, setLevels] = useState(2);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  let anchorPoint = useRef([0, 0]);
  const myMapSVG = useRef(null);
  const mySearchResults = useRef(null);
  const [articles, setArticles] = useState([
    [
      {
        x: 100,
        y: 0,
        displayed: true,
        title: initialWikiData[0][0],
        imageUrl: initialWikiData[0][1],
      },
    ],
    [
      //slice is used because the first item is the main article, so
      //array is sliced in order not to display it twice.
      ...initialWikiData.slice(1).map((n, index) => {
        return {
          x:
            100 * index +
            100 -
            initialWikiData.length * 50 +
            (initialWikiData.length % 2 === 0 ? 0 : 50) +
            100,
          y: 150,
          displayed: false,
          title: n[0],
          imageUrl: n[1],
        };
      }),
    ],
  ]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        let searchResultsArray = searchArticles(search, articles);
        setSearchResults(searchResultsArray);
      }
    }, 200);

    return () => {
      clearTimeout(delayDebounceFn);
      setSearchResults([]);
    };
  }, [search, articles]);

  function mouseZoom(e) {
    if (pointerDown) {
      return;
    }
    let newViewBox = [];

    if (e.deltaY > 0) {
      newViewBox[0] = viewBox[0] - viewBox[2] / 2;
      newViewBox[1] = viewBox[1] - viewBox[3] / 2;
      newViewBox[2] = viewBox[2] * 2;
      newViewBox[3] = viewBox[3] * 2;
    }
    if (e.deltaY < 0) {
      newViewBox[0] = viewBox[0] + viewBox[2] / 4;
      newViewBox[1] = viewBox[1] + viewBox[3] / 4;
      newViewBox[2] = viewBox[2] / 2;
      newViewBox[3] = viewBox[3] / 2;
    }
    if (newViewBox[3] < 100) {
      return;
    }
    setViewBox(newViewBox);
  }

  function Pan(e) {
    if (pointerDown) {
      let targetPoint = svgCoords(e, myMapSVG.current);
      let newViewBox = [];
      newViewBox[0] = viewBox[0] + anchorPoint.current[0] - targetPoint.x;
      newViewBox[1] = viewBox[1] + anchorPoint.current[1] - targetPoint.y;
      newViewBox[2] = viewBox[2];
      newViewBox[3] = viewBox[3];
      setViewBox(newViewBox);
    }
  }

  function Down(e) {
    setPointerDown(true);
    let point = svgCoords(e, myMapSVG.current);
    anchorPoint.current[0] = point.x;
    anchorPoint.current[1] = point.y;
  }

  function Up(e) {
    setPointerDown(false);
  }

  function svgCoords(event, elem) {
    let ctm = elem.getScreenCTM();
    let pt = myMapSVG.current.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    return pt.matrixTransform(ctm.inverse());
  }

  function addArticles(e, title, row, column) {
    articles[row][column].displayed = true;
    let cx = e.currentTarget.x.baseVal.value;
    let cy = e.currentTarget.y.baseVal.value;
    let getLevel = 150 * levels;
    setLevels(levels + 1);
    let newArticles = fetchWikiTitles(e, title);
    newArticles.then((response) => {
      if (!response) {
        articles[row][column].displayed = false;
        setLevels(getLevel / 150);
        return;
      }
      let data = fetchWikiImages(response, title);
      data.then((responseImages) => {
        if (!responseImages) {
          articles[row][column].displayed = false;
          setLevels(getLevel / 150);
          return;
        }

        let newData = responseImages.map((n, index) => {
          return {
            x:
              100 * index +
              cx -
              responseImages.length * 50 +
              (responseImages.length % 2 === 0 ? 0 : 50) +
              100,
            y: getLevel,
            displayed: false,
            title: n[0],
            imageUrl: n[1],
          };
        });

        setArticles((articles) => [...articles, [...newData.slice(1)]]);
        setArrows((arrows) => [
          ...arrows,
          `${cx + 85},${cy + 40} ${cx + 90},${cy + 40} ${cx + 90},${
            getLevel - 10
          }`,
        ]);
      });
    });
  }

  return (
    <>
      <div className="search__map">
        <input
          placeholder="Search the map"
          onFocus={(e) => {
            e.preventDefault();
            mySearchResults.current.classList.remove("hidden");
          }}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
          }}
        ></input>
        <div className="result__box search__map__results" ref={mySearchResults}>
          {searchResults.map((e, index) => {
            return (
              <li
                key={index}
                onClick={(e2) => {
                  mySearchResults.current.classList.add("hidden");
                  setViewBox([e[1] - 65, e[2] - 60, 200, 200]);
                }}
              >
                {e[0]}
              </li>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className="button__to__search__again"
        onClick={(e) => setInitialWikiData(false)}
      >
        Try another article
      </button>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox.join(" ")}
        width="100%"
        height="100%"
        onWheel={mouseZoom}
        onPointerDown={Down}
        onPointerMove={Pan}
        onPointerCancel={Up}
        onPointerLeave={Up}
        onTouchMove={Pan}
        onPointerUp={Up}
        className="Main"
        ref={myMapSVG}
        preserveAspectRatio="xMidYMid slice"
      >
        {arrows.map((a, index) => (
          <Arrow
            key={index}
            coords={a}
            onClickFunction={(e) => {
              setViewBox([
                a.split(" ").at(-1).split(",")[0] - 100,
                a.split(" ").at(-1).split(",")[1] - 40,
                200,
                200,
              ]);
            }}
          />
        ))}

        {articles.map((row, index1) =>
          row.map(
            (c2, index2) =>
              isVisible(viewBox, c2) && (
                <svg
                  x={c2.x}
                  y={c2.y}
                  key={`${index1} ${index2}`}
                  id={`${index1} ${index2}`}
                  onClick={(e) =>
                    !c2.displayed && addArticles(e, c2.title, index1, index2)
                  }
                  className="image__container"
                  width="80"
                  height="90"
                >
                  <image
                    href={
                      c2.imageUrl
                        ? c2.imageUrl
                        : "https://upload.wikimedia.org/wikipedia/commons/d/de/Wikipedia-logo_%28inverse%29.png"
                    }
                    alt={c2.title}
                    className="images"
                    width="80"
                    height="80"
                  ></image>
                  <a
                    href={"https://en.wikipedia.org/wiki/" + c2.title}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <text x="40" y="85" fill="white">
                      <tspan dy="0px">
                        {c2.title.length < 25
                          ? c2.title
                          : c2.title.slice(0, 25) + "..."}
                      </tspan>
                    </text>
                  </a>
                </svg>
              )
          )
        )}
      </svg>
    </>
  );
}
