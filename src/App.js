import "./App.css";
import Map from "./Map";
import Search from "./Search";
import { useState } from "react";
import LoadingGif from "./assets/Loading2.svg";
function App() {
  const [initialWikiData, setInitialWikiData] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  //If initialwikidata is avaialable > show map and hide everything else
  //If loadingMap is true, show loading gif and hide everything else
  //If nothing is loading and wikidata isnt ready, show search, which is the
  //default state.
  return (
    <div className="App">
      {loadingMap && (
        <img
          alt="Loading"
          className="loading__data__gif"
          src={LoadingGif}
        ></img>
      )}
      {!initialWikiData && !loadingMap && (
        <Search
          setInitialWikiData={setInitialWikiData}
          setLoadingMap={setLoadingMap}
        />
      )}
      {initialWikiData && (
        <Map
          initialWikiData={initialWikiData}
          setInitialWikiData={setInitialWikiData}
        />
      )}
    </div>
  );
}

export default App;
